// Hybrid regex-based extraction for arbitrary text (word + version)
const { getAllKeywords } = require('../utils/cveKeywords');
function extractWordsWithVersionFromText(text) {
	const results = [];
	if (!text) return results;

	// Get all keywords, sort by length descending to match multi-word first
	const keywords = Array.from(getAllKeywords()).sort((a, b) => b.length - a.length);
	const lowerText = text.toLowerCase();
	const used = new Set();

	// Try to match each keyword in the text
	for (const keyword of keywords) {
		// Escape regex special chars
		const kwRegex = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// Match keyword followed by version (e.g., 'apache httpd 2.4.52', 'openssh 8.9p1')
		const regex = new RegExp(`(${kwRegex})[\s\-_:,vV]*([0-9]+(?:\.[0-9]+)*[a-zA-Z0-9\-]*)`, 'gi');
		let match;
		while ((match = regex.exec(text)) !== null) {
			const name = match[1].trim();
			const version = match[2] ? match[2].trim() : null;
			const key = name.toLowerCase() + ':' + (version || '');
			if (!used.has(key)) {
				results.push({ word: name, version });
				used.add(key);
			}
		}
	}

	// Fallback: also extract single words with version (legacy logic)
	const fallbackRegex = /([a-zA-Z0-9_\-]+)[\s\-_:,vV]*([0-9]+(?:\.[0-9]+)*[a-zA-Z0-9\-]*)/g;
	let matches;
	while ((matches = fallbackRegex.exec(text)) !== null) {
		const name = matches[1];
		const version = matches[2] || null;
		const key = name.toLowerCase() + ':' + (version || '');
		if (!used.has(key)) {
			results.push({ word: name, version });
			used.add(key);
		}
	}
	return results;
}

// Check if a word+version has a CVE in the loaded NVD data
function hasCveForWord(word, version, vulnerabilities) {
	const w = (word || '').toLowerCase();
	const v = (version || '').toLowerCase();
	return vulnerabilities.some(item => {
		const cve = item.cve;
		if (!cve) return false;
		const desc = (cve.descriptions || []).map(d => d.value.toLowerCase()).join(' ');
		const cpe = JSON.stringify(cve.configurations || {}).toLowerCase();
		if (!desc.includes(w) && !cpe.includes(w)) return false;
		if (v && v !== 'any' && !desc.includes(v) && !cpe.includes(v)) return false;
		return true;
	});
}

// Exported function for API: get all words (with version) and CVE status from latest scan data
function getAllWordsWithCveStatusFromReport(report) {
	const vulnerabilities = loadNvdData();
	// Use all text fields in the report for extraction
	let allText = '';
	(report || []).forEach(entry => {
		if (entry && entry.title) allText += ' ' + entry.title;
		if (entry && entry.value) allText += ' ' + entry.value;
		if (entry && entry.dataToDisplay) {
			if (typeof entry.dataToDisplay === 'string') allText += ' ' + entry.dataToDisplay;
			else if (Array.isArray(entry.dataToDisplay)) allText += ' ' + entry.dataToDisplay.map(x => (x && x.value ? x.value : '')).join(' ');
		}
	});
	const words = extractWordsWithVersionFromText(allText);
	// Remove duplicates
	const seen = new Set();
	const uniqueWords = words.filter(({ word, version }) => {
		const key = word + ':' + (version || '');
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
	return uniqueWords.map(({ word, version }) => ({
		word,
		version,
		hasCVE: hasCveForWord(word, version, vulnerabilities)
	}));
}

module.exports.getAllWordsWithCveStatusFromReport = getAllWordsWithCveStatusFromReport;
const fs = require('fs');
const path = require('path');
const { DataToDisplay } = require('../utils/dataToDisplay');
const generateSummary = require('../utils/generateSummary');
const { extractVersion } = require('../utils/cveKeywords');

const NVD_PATH = path.join(__dirname, 'nvdcve-2.0.json');
const MAX_CVES_PER_SERVICE = 50;

let cachedVulnerabilities;
let cachedProducts;

const severityFromScore = (score) => {
	if (score === undefined || score === null) {
		return 'unknown';
	}

	const numeric = Number(score);
	if (Number.isNaN(numeric)) return 'unknown';
	if (numeric >= 9) return 'critical';
	if (numeric >= 7) return 'high';
	if (numeric >= 4) return 'medium';
	return 'low';
};

const loadNvdData = () => {
	if (cachedVulnerabilities) {
		return cachedVulnerabilities;
	}

	try {
		const raw = fs.readFileSync(NVD_PATH, 'utf-8');
		const parsed = JSON.parse(raw);
		cachedVulnerabilities = parsed.vulnerabilities || [];
	} catch (err) {
		console.error('Failed to load NVD data:', err.message);
		cachedVulnerabilities = [];
	}

	return cachedVulnerabilities;
};

const englishDescription = (cve) => {
	const match = (cve?.descriptions || []).find((d) => d.lang === 'en');
	return match?.value || '';
};

const collectCpeStrings = (cve) => {
	const configs = cve?.configurations || [];
	const values = [];

	configs.forEach((cfg) => {
		(cfg.nodes || []).forEach((node) => {
			(node.cpeMatch || []).forEach((cm) => {
				if (cm.criteria) values.push(cm.criteria.toLowerCase());
				if (cm.cpeName) values.push(cm.cpeName.toLowerCase());
			});
		});
	});

	return values;
};

const pickCvss = (cve) => {
	const metrics = cve?.metrics || {};
	const order = ['cvssMetricV31', 'cvssMetricV30', 'cvssMetricV2'];

	for (const key of order) {
		const arr = metrics[key];
		if (arr && arr.length) {
			const data = arr[0].cvssData || {};
			return {
				score: data.baseScore,
				severity: (data.baseSeverity || severityFromScore(data.baseScore)).toLowerCase(),
				scoreType: data.version || key,
			};
		}
	}

	return { score: null, severity: 'unknown', scoreType: 'unknown' };
};

const extractServicesFromReport = (report = []) => {
	console.log('[CVE] extractServicesFromReport: start, report length:', Array.isArray(report) ? report.length : 0);
	const { DataToDisplay } = require('../utils/dataToDisplay');
	const { PORT_HEURISTICS, isRelevantKeyword } = require('../utils/cveKeywords');
	const unique = new Map();

	// Load relevant keywords
	const relevantKeywords = getAllKeywords();

	// Prepare regex for known keywords
	const keywordList = Array.from(relevantKeywords).filter(kw => kw.length > 1);
	const whitelistRegex = new RegExp(
		keywordList.map(kw => `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).join('|'),
		'i'
	);

	// Generic regex for "Name/Version" pattern (e.g. Apache/2.4.52, nginx/1.18)
	// Captures: 1=Name, 2=Version
	const genericServiceRegex = /([a-zA-Z0-9_\-]+)\/(\d+(?:\.\d+)+[a-z0-9\-\.]*)/gi;

	// Helper to add findings
	const addFinding = (service, version, source = 'whitelist', port = '') => {
		if (!service) return;
		const s = service.toLowerCase();
		// block some noise
		if (s.length < 3) return;

		let v = (version || 'Any').trim();
		// Cleanup version
		v = v.replace(/[\.\-]+$/, '');

		const key = `${s}:${v}:${port}`;
		if (!unique.has(key)) {
			unique.set(key, { service: s, version: v, port, source });
		}
	};

	// 2. NVD-based Dynamic Extraction (Slower, Broader)
	if (!cachedProducts) {
		const vulnerabilities = loadNvdData();
		cachedProducts = new Set();
		vulnerabilities.forEach(item => {
			const configs = item.cve?.configurations || [];
			configs.forEach(cfg => {
				(cfg.nodes || []).forEach(node => {
					(node.cpeMatch || []).forEach(match => {
						if (match.criteria) {
							// cpe:2.3:part:vendor:product:version...
							const parts = match.criteria.split(':');
							if (parts.length >= 5) {
								cachedProducts.add(parts[4].toLowerCase()); // Product
							}
						}
					});
				});
			});
		});
		console.log(`[CVE] Built product cache with ${cachedProducts.size} unique products.`);
	}

	// 3. Scan all text in the report
	const startTime = Date.now();

	// Function to scan a string for all types of matches
	const scanString = (str, portContext = '') => {
		if (!str || typeof str !== 'string') return;
		const lower = str.toLowerCase();

		// A. Generic "Name/Version" Regex
		// We use a new regex instance or reset lastIndex if global
		// genericServiceRegex is global, so we need a loop
		let gMatch;
		// Reset lastIndex just in case
		genericServiceRegex.lastIndex = 0;
		while ((gMatch = genericServiceRegex.exec(str)) !== null) {
			const name = gMatch[1];
			const ver = gMatch[2];
			// Filter out common false positives for "Name/Version" like "TCP/IP", "HTTP/1.1"
			const noise = ['tcp', 'udp', 'http', 'https', 'html', 'xml', 'json'];
			if (!noise.includes(name.toLowerCase())) {
				addFinding(name, ver, 'regex-generic', portContext);
			}
		}

		// B. Whitelist Match
		let wMatch = whitelistRegex.exec(lower);
		if (wMatch) {
			const keyword = wMatch[0];
			if (relevantKeywords.has(keyword)) {
				const ver = extractVersion(str);
				addFinding(keyword, ver, 'whitelist', portContext);
			}
		}

		// C. Dynamic NVD Check
		const tokens = lower.split(/[\s\/\[\]\(\),;=]+/);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (token.length < 3) continue;

			if (cachedProducts.has(token)) {
				const commonFalsePositives = new Set(['date', 'time', 'echo', 'start', 'end', 'files', 'data', 'user', 'admin', 'root', 'login', 'logout', 'help', 'home']);
				if (commonFalsePositives.has(token)) {
					const ver = extractVersion(str);
					if (ver) {
						addFinding(token, ver, 'dynamic-strict', portContext);
					}
				} else {
					const ver = extractVersion(str);
					addFinding(token, ver, 'dynamic', portContext);
				}
			}
		}
	};

	// D. Port Heuristics (Explicit Check)
	const portsEntry = report.find((entry) => entry?.title === 'PORTS');
	if (portsEntry) {
		let portData = Array.isArray(portsEntry.dataToDisplay)
			? portsEntry.dataToDisplay
			: DataToDisplay('PORTS', portsEntry.data || {});

		if (!Array.isArray(portData) && portData && typeof portData === 'object') {
			portData = [portData];
		} else if (!Array.isArray(portData)) {
			portData = [];
		}

		portData.forEach(item => {
			if (!item) return;
			// For PORTS, User wants: first subfield (PORT/SERVICE) AND value (VERSION)
			// item.title = "22/tcp/ssh"
			// item.value = "OpenSSH..."

			// 1. Extract port number
			const portMatch = (item.title || '').match(/^(\d+)/);
			const port = portMatch ? parseInt(portMatch[1]) : null;
			const portStr = port ? port.toString() : '';

			// 2. Combined Logic: Scan Title for Service Names, Value for Version
			const tokens = (item.title || '').toLowerCase().split(/[\s\/\[\]\(\),;=]+/);
			tokens.forEach(token => {
				if (token.length < 3) return;
				// Check against NVD or Whitelist
				const isProduct = cachedProducts.has(token) || relevantKeywords.has(token);
				if (isProduct) {
					// Found service in title (e.g. rpcbind detected from 111/tcp/rpcbind)
					// Try to find version in VALUE first
					let ver = extractVersion(item.value);
					if (!ver) {
						// Fallback to title
						ver = extractVersion(item.title);
					}
					addFinding(token, ver, 'port-combined', portStr);
				}
			});

			// 3. Scan Value for "Service Version" string (standard scan for others)
			scanString(item.value, portStr);

			// 4. Apply Heuristic if mapped
			if (port && PORT_HEURISTICS[port]) {
				const heuristicService = PORT_HEURISTICS[port];
				addFinding(heuristicService, 'Any', 'heuristic', portStr);
			}
		});
	}

	// Negative phrases to ignore in values
	const SKIP_PHRASES = [
		'no success',
		'connection failed',
		'unknown',
		'not possible',
		'not found',
		'0',
		'false',
		'firewall',
	];

	// Traverse everything else
	const traverseAndExtract = (obj) => {
		if (Date.now() - startTime > 15000) return;
		if (!obj) return;

		if (typeof obj === 'string') {
			const lower = obj.toLowerCase().trim();
			// Filter negative values
			const isNegative = SKIP_PHRASES.some(phrase => lower.includes(phrase));
			if (isNegative) return;
			// Filter extremely short junk
			if (lower.length < 2) return;

			scanString(obj);

		} else if (Array.isArray(obj)) {
			obj.forEach(item => traverseAndExtract(item));
		} else if (typeof obj === 'object') {
			// If it's a report entry object with title/value, handle smartly
			if ('value' in obj) {
				// Only scan value, ignore title (unless it's PORTS which is handled above)
				traverseAndExtract(obj.value);
				// If dataToDisplay is different, scan that too
				if (obj.dataToDisplay && obj.dataToDisplay !== obj.value) {
					traverseAndExtract(obj.dataToDisplay);
				}
			} else {
				// Generic object traversal
				Object.values(obj).forEach(val => traverseAndExtract(val));
			}
		}
	};

	(report || []).forEach((entry, idx) => {
		if (entry.title === 'PORTS') return; // Handled explicitly

		// For all other sections:
		// User Rule: "I don't want names like firewall... instead I want their value field"
		// User Rule: "If value = 'No Success' then don't take that"

		// We explicitly scan `entry.value` and `entry.dataToDisplay` using the filtering logic
		if (entry.value) traverseAndExtract(entry.value);
		if (entry.dataToDisplay) traverseAndExtract(entry.dataToDisplay);
	});

	const result = Array.from(unique.values());
	console.log('[CVE] extractServicesFromReport: end, found services:', result.length);
	return result;
};

const matchCvesForService = (service, vulnerabilities) => {
	const keyword = service.service.toLowerCase();
	const version = (service.version || '').toLowerCase();
	const results = [];
	const seen = new Set();

	for (const item of vulnerabilities) {
		const cve = item.cve;
		if (!cve?.id) continue;

		const description = englishDescription(cve).toLowerCase();
		const cpeStrings = collectCpeStrings(cve);

		const hasKeyword =
			description.includes(keyword) ||
			cpeStrings.some((text) => text.includes(keyword));

		if (!hasKeyword) continue;

		if (version && version !== 'any') {
			const versionHit =
				description.includes(version) ||
				cpeStrings.some((text) => text.includes(version));
			if (!versionHit) continue;
		}

		if (seen.has(cve.id)) continue;

		const cvss = pickCvss(cve);
		results.push({
			id: cve.id,
			service: service.service,
			version: service.version,
			port: service.port,
			descriptions: englishDescription(cve),
			published: cve.published,
			vulnStatus: cve.vulnStatus,
			score: cvss.score,
			scoreType: cvss.scoreType,
			severity: cvss.severity,
			url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
		});

		seen.add(cve.id);

		if (results.length >= MAX_CVES_PER_SERVICE) {
			break;
		}
	}

	return results;
};

const buildCvePayload = (report) => {
	const services = extractServicesFromReport(report);
	const vulnerabilities = loadNvdData();

	// IMPORTANT: We now keep ALL services, even if they have 0 CVEs
	// This fulfills user requirement to show feedback even if no matches found
	const cvesByService = services.map((service) => ({
		...service,
		cves: matchCvesForService(service, vulnerabilities),
	}));

	const flatCves = cvesByService.flatMap((entry) =>
		entry.cves.map((cve) => ({ ...cve, service: entry.service, version: entry.version, port: entry.port }))
	);

	const rawText = flatCves.length
		? flatCves.map((cve) => JSON.stringify(cve)).join('\n')
		: JSON.stringify({
			id: 'NO-CVE-DATA',
			service: 'all',
			severity: 'none',
			descriptions: 'No CVEs found for detected services',
			noData: 'true',
			reason: 'No CVEs found for detected services',
		});

	const dataToDisplay = DataToDisplay('CVE', { text: rawText });
	const summary = generateSummary('CVE', dataToDisplay);

	return {
		services,
		cvesByService,
		flatCves,
		rawText,
		dataToDisplay,
		summary,
	};
};

module.exports = {
	buildCvePayload,
	extractServicesFromReport,
	loadNvdData,
};

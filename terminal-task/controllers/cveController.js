const IPDataModel = require('../models/IPDataModel');
const Constants = require('../utils/constants');
const { buildCvePayload, getAllWordsWithCveStatusFromReport } = require('../CVE/cveService');

const { scans } = Constants;

// API endpoint for frontend: get all extracted words (with version) and CVE status
const getWordsWithCveStatus = async (req, res) => {
	try {
		// Get the latest scan (or you can use a specific scan if needed)
		const latest = await IPDataModel.findOne({}, {}, { sort: { _id: -1 } });
		if (!latest) return res.status(404).json([]);
		const report = latest.report || [];
		const words = getAllWordsWithCveStatusFromReport(report);
		res.json(words);
	} catch (err) {
		res.status(500).json({ error: 'Failed to extract words' });
	}
};
module.exports.getWordsWithCveStatus = getWordsWithCveStatus;

const resolveScan = async (identifier) => {
	if (!identifier) return null;

	if (scans[identifier]) {
		return { id: identifier, formatted: scans[identifier].formatted };
	}

	const fromMemory = Object.entries(scans).find(([, value]) => value?.formatted?.ip === identifier);
	if (fromMemory) {
		return { id: fromMemory[0], formatted: fromMemory[1].formatted };
	}

	const fromDbById = await IPDataModel.findById(identifier);
	if (fromDbById) {
		return { id: fromDbById._id.toString(), formatted: fromDbById };
	}

	const fromDbByIp = await IPDataModel.findOne({ ip: identifier });
	if (fromDbByIp) {
		return { id: fromDbByIp._id.toString(), formatted: fromDbByIp };
	}

	return null;
};

const persistCveReport = async (scanId, formatted, payload) => {
	const reportEntry = {
		title: 'CVE',
		data: {
			text: payload.rawText,
			link_title: 'CVE Raw Report',
		},
		dataToDisplay: payload.dataToDisplay,
	};

	const reportIndex = (formatted.report || []).findIndex((entry) => entry.title === 'CVE');
	if (reportIndex >= 0) {
		formatted.report[reportIndex] = reportEntry;
	} else {
		formatted.report.push(reportEntry);
	}

	formatted.summary = Array.isArray(formatted.summary)
		? formatted.summary.filter((item) => !(item?.name || '').includes('CVE-')).concat(payload.summary)
		: payload.summary;

	if (scans[scanId]) {
		scans[scanId].formatted = formatted;
	}

	await IPDataModel.findByIdAndUpdate(scanId, formatted);
};

const buildResponse = (payload, formatted) => ({
	ok: true,
	ip: formatted?.ip,
	services: payload.services,
	summary: payload.summary,
	totalCves: payload.flatCves.length,
	totalServices: payload.services.length,
	cvesByService: payload.cvesByService,
	flatCves: payload.flatCves,
});

const getCveResults = async (req, res) => {
	try {
		const { id: identifier } = req.params;
		console.log('[CVE] getCveResults called for id:', identifier);
		const resolved = await resolveScan(identifier);

		if (!resolved) {
			console.log('[CVE] Scan not found for id:', identifier);
			return res.status(404).json({ ok: false, message: 'Scan not found' });
		}

		// Timeout logic: if buildCvePayload takes too long, abort
		const TIMEOUT_MS = 15000; // 15 seconds
		let timeoutHandle;
		const timeoutPromise = new Promise((_, reject) => {
			timeoutHandle = setTimeout(() => {
				reject(new Error('CVE analysis timed out'));
			}, TIMEOUT_MS);
		});

		let payload;
		try {
			payload = await Promise.race([
				Promise.resolve(buildCvePayload(resolved.formatted.report || [])),
				timeoutPromise
			]);
			clearTimeout(timeoutHandle);
		} catch (err) {
			console.error('[CVE] buildCvePayload timed out or errored:', err);
			return res.status(500).json({ ok: false, message: 'CVE analysis timed out or failed' });
		}

		console.log('[CVE] buildCvePayload completed for id:', identifier);
		return res.status(200).json(buildResponse(payload, resolved.formatted));
	} catch (err) {
		console.error('Error while building CVE response', err);
		return res.status(500).json({ ok: false, message: 'Unable to build CVE data' });
	}
};

const updateCveReport = async (req, res) => {
	try {
		const { id: identifier } = req.body;
		if (!identifier) {
			return res.status(400).json({ ok: false, message: 'scan id is required' });
		}

		const resolved = await resolveScan(identifier);
		if (!resolved) {
			return res.status(404).json({ ok: false, message: 'Scan not found' });
		}

		const payload = buildCvePayload(resolved.formatted.report || []);
		await persistCveReport(resolved.id, resolved.formatted, payload);

		return res.status(200).json(buildResponse(payload, resolved.formatted));
	} catch (err) {
		console.error('Error while updating CVE report', err);
		return res.status(500).json({ ok: false, message: 'Unable to update CVE data' });
	}
};

module.exports = {
	getCveResults,
	updateCveReport,
	getWordsWithCveStatus,
};

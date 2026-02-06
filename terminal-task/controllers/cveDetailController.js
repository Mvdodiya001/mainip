const getCveDetail = async (req, res) => {
	try {
		const { cveId } = req.params;
		if (!cveId) {
			return res.status(400).json({ ok: false, message: 'CVE ID is required' });
		}

		const { loadNvdData } = require('../CVE/cveService');
		const vulnerabilities = loadNvdData();

		const cveEntry = vulnerabilities.find((item) => item?.cve?.id === cveId);
		if (!cveEntry) {
			return res.status(404).json({ ok: false, message: 'CVE not found' });
		}

		const cve = cveEntry.cve;
		const description = (cve?.descriptions || []).find((d) => d.lang === 'en')?.value || '';

		// Extract CVSS data
		const metrics = cve?.metrics || {};
		let cvssData = { score: null, severity: 'unknown', scoreType: 'unknown' };
		
		const order = ['cvssMetricV31', 'cvssMetricV30', 'cvssMetricV2'];
		for (const key of order) {
			const arr = metrics[key];
			if (arr && arr.length) {
				const data = arr[0].cvssData || {};
				cvssData = {
					score: data.baseScore,
					severity: (data.baseSeverity || '').toLowerCase() || 'unknown',
					scoreType: data.version || key,
				};
				break;
			}
		}

		const response = {
			ok: true,
			id: cve.id,
			descriptions: description,
			published: cve.published,
			lastModified: cve.lastModified,
			vulnStatus: cve.vulnStatus,
			score: cvssData.score,
			severity: cvssData.severity,
			scoreType: cvssData.scoreType,
			url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error('Error fetching CVE detail:', err);
		return res.status(500).json({ ok: false, message: 'Unable to fetch CVE details' });
	}
};

module.exports = {
	getCveDetail,
};

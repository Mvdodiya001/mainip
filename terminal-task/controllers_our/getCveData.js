const fs = require('fs');
const { execSync } = require('child_process');
const Constants = require('../utils/constants');
const { directory, scans } = Constants;
const IPDataModel = require('../models/IPDataModel');
const dataToDisplay = require('../utils/dataToDisplay');

module.exports = async (req, res) => {
	const { id, key } = req.body;

	const portsdata =
		scans[id].formatted.report &&
		scans[id].formatted.report.filter((el) => el.title === 'PORTS')[0];
	const IPAddress = scans[id].formatted.ip;

	if (!portsdata) {
		return res.status(400).json({
			status: 'failed',
			ok: false,
			message: 'No ports found',
		});
	}

	fs.writeFileSync(
		`./final_test/output${IPAddress}.txt`,
		portsdata.data.text,
		{
			encoding: 'utf-8',
		}
	);

	let cveData = '';

	try {
		cveData = String(
			execSync(`python3 cve.py dropbear 2017.75 ${IPAddress}`, {
				shell: true,
				cwd: directory,
			})
		);
	} catch (err) {
		console.log('Error');
	}

	try {
		const index = scans[id].formatted.report.findIndex((el) => el.title == key);
		scans[id].formatted.report[index].data.text = cveData;
		scans[id].formatted.report[index].dataToDisplay = dataToDisplay(key, {
			text: cveData,
		});
		console.log(scans[id].formatted.report[index]);
	} catch(err) {
		io.emit('error', {
			message: 'Error in fetching CVE data',
			errorType: 'Internal Server Error',
			code: 500,
		});
	}

	res.status(200).json({
		status: 'success',
		ok: true,
	});

	await IPDataModel.findByIdAndUpdate(id, scans[id].formatted);

	try {
		fs.unlinkSync(`./final_test/output${IPAddress}.txt`);
	} catch (err) {
		console.log(err);
	}
};
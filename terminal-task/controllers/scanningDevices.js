const { spawn } = require('child_process');
const Constants = require('../utils/constants');
const { directory, scans, pidTimestamp, io } = Constants;
const {formatData,port_443,port443} = require('../utils/formatData');
const IPDataModel = require('../models/IPDataModel');

exports.startScanning = (
	starttime,
	ipAddress,
	IPData,
	formatted,
	currentIndex,
	tempstr
) => {
	const child = spawn(
		`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./start.sh ${ipAddress}`,
		{
			cwd: directory,
			shell: true,
		}
	);

	child.stdout.on('data', (data) => {
		const dt = String(data);
		// console.log(dt);

		if (dt.toLowerCase().includes('testing started for')) {
			formatted['id'] = IPData._id;
			pidTimestamp[child.pid] = formatted.id;
			scans[pidTimestamp[child.pid]] = {
				formatted: formatted,
				currentIndex: currentIndex,
				tempstr: tempstr,
			};
		}

		if (dt.toLowerCase().includes('test completed')) {
			scans[pidTimestamp[child.pid]].formatted = {
				...scans[pidTimestamp[child.pid]].formatted,
				end: true,
				// endtime: new Date(Date.now()-starttime ).toISOString() + 'sec',
				demoendtime:new Date(Date.now()).toISOString(),
				endtime: ((Date.now()-starttime)/60000 ).toFixed(2) + ' ' +'Min.',
			};

			io.emit('IPScanData', JSON.stringify(scans));
			child.kill('SIGKILL');
		}

		if (scans[pidTimestamp[child.pid]] === undefined) {
			return;
		}

		try {
			formatData(data, scans[pidTimestamp[child.pid]]).then(
				async (modifiedObj) => {
					scans[pidTimestamp[child.pid]] = modifiedObj;

					io.emit('IPScanData', JSON.stringify(scans));
					await IPDataModel.findByIdAndUpdate(
						pidTimestamp[child.pid],
						scans[pidTimestamp[child.pid]].formatted
					);
				}
			);
		} catch (err) {
			const customError = {
				message: `Error using formatData function for ${ipAddress}. Please restart the server.`,
				errorType: 'Internal Server Error',
				code: 500,
			};
			io.emit('error', JSON.stringify(customError));
			scans[pidTimestamp[child.pid]].formatted.end = true;
			io.emit('IPScanData', JSON.stringify(scans));
			console.log(JSON.stringify(scans), "anushka");
			child.kill('SIGKILL');
		}
	});

	child.stderr.on('data', (data) => {
		const dt = String(data);
		console.log(dt);
		if (dt.toLowerCase().includes('error')) {
			scans[pidTimestamp[child.pid]].formatted.end = true;
		}
	});

	child.on('exit', async (code, signal) => {
		try {
			await IPDataModel.findByIdAndUpdate(
				pidTimestamp[child.pid],
				scans[pidTimestamp[child.pid]].formatted
			);
			delete pidTimestamp[child.pid];
		} catch (err) {
			const customError = {
				message: `Error when updating database for ${ipAddress}. Please restart the server.`,
				errorType: 'Internal Server Error',
				code: 500,
			};
			io.emit('error', JSON.stringify(customError));
		}
		console.log(`Child exited with code ${code} and signal ${signal}.`);
	});
};

exports.deleteScan = (req, res) => {
	const { id } = req.params;
	IPDataModel.findByIdAndDelete(id, async (err, doc) => {
		console.log(id);
		if (err) {
			console.log(err);
			return res.status(400).json({
				status: 'failure',
				ok: false,
				message: 'Error deleting IP Scan Data',
			});
		}

		scans[id] = undefined;
		io.emit('IPScanData', JSON.stringify(scans));

		return res.status(204).json({
			status: 'success',
			ok: true,
			message: 'IP Scan Data deleted successfully',
		});
	});
};

exports.routerScanData = (req, res) => {
	RouterScanModel.find({}, (err, doc) => {
		if (err) {
			return res.status(400).json({
				status: 'failure',
				ok: false,
				message: 'Error getting Router Scan Data',
			});
		}

		return res.status(200).json({
			status: 'success',
			ok: true,
			data: doc,
		});
	});
};

exports.multipleIPUploads = (req, res) => {
	const results = [];
	const invalid = [];
	const { ipList } = req.body;
	var rx = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;

	ipList.split('\n').forEach((el) => {
		el.split(',').forEach((ip) => {
			if (ip.length == 0) {
				return;
			}

			if (!rx.test(ip)) {
				invalid.push(ip);
			}

			results.push(ip.trim());
		});
	});

	if (invalid.length > 0) {
		return res.status(400).json({
			status: 'failure',
			ok: false,
			invalidIP: invalid,
			message: `${invalid.length > 1 ? 'Some' : 'One'} IP Address${
				invalid.length > 1 ? 'es are' : 'is'
			} not valid`,
		});
	}

	return res.status(200).json({
		status: 'success',
		ok: true,
		results,
	});
};

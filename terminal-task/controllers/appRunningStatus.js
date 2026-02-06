const fs = require('fs');
const { spawn } = require('child_process');
const Constants = require('../utils/constants');
const { io, directory } = Constants;
const { ProcessManager, Package } = require('../models/RunningAppProcess');
const {
	thirdPartyApps,
	isAppRunning,
	isProcessRunning,
} = require('../utils/runningAppUtils');
let runningAppStatus = null;
let shouldRestart =false;



exports.getThirdPartyApps = (req, res) => {
	const data = thirdPartyApps();

	const dataToReturn = data
		.map((element) => {
			if (!element || element.trim().length == 0) {
				return;
			}
			element = element.trim().replace('package:', '');
			return [element, isAppRunning(element)];
		})
		.filter((element) => {
			return element;
		});

	res.status(200).json({
		status: 'success',
		ok: true,
		data: dataToReturn,
	});
};

const getRunningAppStatusUtil = (selectedApps) => {
	const process = new ProcessManager();
	const command = 'adb shell top -b';
	runningAppStatus = spawn(command, { shell: true });
	runningAppStatus.stdout.on('data', (data) => {
		data.toString()
			.split('\n')
			.forEach((element) => {
				const data = element.trim().split(/ +/);
				if (data.length == 12) {
					const p = new Package(data);

					if (!selectedApps.includes(p.package_name)) {
						return;
					}

					if (!process.packages[p.package_name]) {
						process.packages[p.package_name] = {};
					}
					process.packages[p.package_name][p.pid] = p;
				}
			});

		Object.keys(process.packages).forEach((key) => {
			// console.log(key," OLD : ", Object.keys(process.packages[key]));
			const pids = Object.keys(process.packages[key]).filter((pid) => {
				return !isProcessRunning([pid]);
			});

			// console.log(key," : ", pids);

			pids.forEach((pid) => {
				delete process.packages[key][pid];
			});

			if (Object.keys(process.packages[key]).length == 0) {
				delete process.packages[key];
			}
		});

		io.emit('running-apps-status', JSON.stringify(process.packages));
		// console.log("Sending running apps status");
	});
	runningAppStatus.stderr.on('data', (data) => {
		if (process.displayError) {
			console.error(`Error: ${data.toString()}`);
		}
		io.emit(
			'error',
			JSON.stringify({
				message: data.toString(),
				errorType: 'Running App Status Error',
				code: 500,
			})
		);
		runningAppStatus.kill('SIGKILL');
		runningAppStatus = null;
	});
	runningAppStatus.on('exit', (code, signal) => {
		console.log(
			`Child process exited with code ${code} with signal ${signal}`
		);
		runningAppStatus = spawn(command, { shell: true });
	});
};

exports.getRunningAppStatus = (req, res) => {
	const { selectedApps } = req.body;

	getRunningAppStatusUtil(selectedApps);

	res.status(200).json({
		status: 'success',
		ok: true,
	});
};

exports.stopRunningAppStatus = (req, res) => {
	if (!runningAppStatus) {
		io.emit(
			'error',
			JSON.stringify({
				message: 'Process is not running',
				errorType: 'Running App Status Error',
				code: 500,
			})
		);
		return res.status(500).json({
			status: 'success',
			ok: true,
		});
	}

	console.log('Stopping running app status');
	runningAppStatus.kill('SIGKILL');
	runningAppStatus = undefined;

	res.status(200).json({
		status: 'success',
		ok: true,
	});
};

exports.checkRunningApps = (req, res) => {
	const { listOfPid } = req.body;
	console.log(listOfPid);
	const pidRunning = isProcessRunning(listOfPid).split(' ');

	res.status(200).json({
		status: 'success',
		ok: true,
		data: pidRunning,
	});
};

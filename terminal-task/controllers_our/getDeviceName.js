const {exec} = require('child_process');
const Constants = require('../utils/constants');
const { directory, ipAddressUnderDeviceScan, io } = Constants;

module.exports = async (req, res) => {
	const { ip } = req.params;

	if (ipAddressUnderDeviceScan[ip]) {
		return res.status(200).json({
			status: 'success',
			ok: true,
			deviceName: ipAddressUnderDeviceScan[ip],
		});
	}

	ipAddressUnderDeviceScan[ip] = 'Fetching Device Name...';

	const deviceDataProcess = exec(
		`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./get_device_name.sh ${ip}`,
		{
			shell: true,
			cwd: directory,
		}
	);

	deviceDataProcess.stdout.on('data', (data) => {
		try {
			const vendorName = String(data).match(/Name of the vendor\s*:\s*(.*)/);
			const deviceName = String(data).match(/Device type\s*:\s*(.*)/);
			if(deviceName.length > 1 && deviceName[1] !== '') {
				if(vendorName.length > 1 && vendorName[1] !== '') {
					ipAddressUnderDeviceScan[ip] = `Vendor: ${vendorName[1]} $$ Device: ${deviceName[1]}`;
				} else {
					ipAddressUnderDeviceScan[ip] = deviceName[1];
				}
				deviceDataProcess.kill('SIGKILL');
			}
		} catch (err) {
			io.emit('error', JSON.stringify({
				message: 'Error in fetching device name',
				errorType: 'Internal Server Error',
				code: 500,
			}));
		}
	});

	deviceDataProcess.on('close', (code, signal) => {
		res.status(200).json({
			status: 'success',
			ok: true,
			deviceName: ipAddressUnderDeviceScan[ip],
		});
		console.log(`child process exited with code ${code} and signal ${signal}`);
	});
};
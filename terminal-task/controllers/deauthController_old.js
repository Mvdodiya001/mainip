const Constants = require('../utils/constants');
const { execSync, spawnSync } = require('child_process');

/**
 * @param {string} command
 * @returns {json} outputJson
 */
const runSyncCommands = (command) => {
	console.log(command);
	

	const output = execSync(
		`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ${command}`,
		{
			cwd: Constants.directory + '/deauth',
			shell: true,
		}
	).toString();
	try {
		const outputJson = JSON.parse(output);
		console.log(outputJson);
		return {
			...outputJson,
			status: outputJson.status == 'true' ? true : false,
		};
	} catch (error) {
		return {
			status: false,
			message: `Error parsing output. ${output}`,
		};
		
	}
};

const sleep = (seconds) => {
	return new Promise(resolve => setTimeout(resolve,seconds*1000));
}

const checkCommands = () => {
	const command = './check_commands.sh';
	return runSyncCommands(command);
};

const checkExistingMonitorMode = () => {
	return {
		status: true,
		message: "output."
	}
	// const command = './check_existing_monitor_mode.sh';
	// return runSyncCommands(command);
};

const restartNetworkManager = () => {
	const command = './restart_network_manager.sh';
	return runSyncCommands(command);
};

const checkIpStatus = ($ipAddress) => {
	const command = `./check_ip_status.sh ${$ipAddress}`;
	return runSyncCommands(command);
};

const getAccessPointMacAddress = (interface) => {
	const command = `./get_access_point_mac_address.sh ${interface}`;
	return runSyncCommands(command);
};

const getDeviceMacAddress = (ipAddress) => {
	const command = `./get_device_mac_address.sh ${ipAddress}`;
	return runSyncCommands(command);
};

const startAndGetMonitorMode = (interface) => {
	return {
		status: true,
		message: "output."
	}
	// const command = `./start_and_get_monitor_mode.sh ${interface}`;
	// return runSyncCommands(command);
};

const getAPChannelName = (monitor_interface,accessPointMacAddress) => {
	const command = `./get_ap_channel_name.sh ${monitor_interface} ${accessPointMacAddress}`;
	return runSyncCommands(command);
};

const performDeauth = (
	interface,
	accessPointMacAddress,
	deviceMacAddress,
	timeout,
	channel
) => {
	const command = `./perform_deauth.sh ${interface} ${deviceMacAddress} ${accessPointMacAddress} ${timeout}`;
	return runSyncCommands(command);
};

const stopMonitorMode = (interface, monitorInterface) => {
	return {
		status: true,
		message: "output."
	}
// 	const command = `./stop_monitor_mode.sh ${interface} ${monitorInterface}`;
// 	return runSyncCommands(command);
};

const getCheckListId = (idIndex) => {
	const checkList = [
		'check_commands',
		'check_existing_monitor_mode',
		'restart_network_manager_1',
		'check_ip_status',
		'get_access_point_mac',
		'get_device_mac',
		'start_monitor_mode',
		'get_access_point_channel',
		'start_deauth_attack',
		'stop_monitor_mode',
		'restart_network_manager_2',
	];
	if (idIndex >= checkList.length) {
		throw new Error('Invalid id index');
	}
	return checkList[idIndex];
};

/**
 *
 * @param {number} id
 * @param {boolean} status
 * @param {string} message
 * @param {boolean} isRunning
 * @returns {string}
 */
const prepareRespose = (
	id,
	success,
	message,
	isRunning,
	ipAddress,
	ipStatus
) => {
	if (id === undefined) {
		throw new Error('Id is required');
	}
	if (isRunning === undefined) {
		isRunning = false;
	}
	if (success === undefined) {
		success = false;
	}
	if (message === undefined) {
		message = '';
	}
	return JSON.stringify({
		checkId: getCheckListId(id),
		success,
		message,
		isRunning,
		status: true,
		ipAddress,
		ipStatus,
	});
};



const performDeauthantication = async (networkInterface, ipAddress, timeout) => {
	console.log(
		'performDeauthantication',
		networkInterface,
		ipAddress,
		timeout
	);
	const { io } = Constants;
	Constants.deauthRunning = true;
	const response1 = prepareRespose(0, true, undefined, true, ipAddress, true);
	console.log('response1', response1);
	io.emit('deauth_1', response1);
	const commandCheckOutput = checkCommands();
	const response2 = prepareRespose(
		0,
		commandCheckOutput.status,
		commandCheckOutput.output,
		false,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response2', response2);
	io.emit('deauth_2', response2);
	if (!commandCheckOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_1', {
			status: false,
			success: false,
			message: `Deauth failed. ${commandCheckOutput.output}`,
		});
		return;
	}

	const response3 = prepareRespose(1, true, undefined, true, ipAddress, true);
	await sleep(1);
	console.log('response3', response3);
	io.emit('deauth_3', response3);
	const existingMonitorModeOutput = checkExistingMonitorMode();
	const response4 = prepareRespose(
		1,
		true,
		existingMonitorModeOutput.output,
		false,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response4', response4);
	io.emit('deauth_4', response4);
	if (!existingMonitorModeOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_2', {
			status: false,
			success: false,
			message: `Deauth failed. ${existingMonitorModeOutput.output}`,
		});
		return;
	}

	// const response5 = prepareRespose(2, true, undefined, true, ipAddress, true);
	// await sleep(1);
	// console.log('response5', response5);
	// io.emit('deauth_5', response5);
	// const networkManagerOutput = restartNetworkManager();
	// const response6 = prepareRespose(
	// 	2,
	// 	networkManagerOutput.status,
	// 	networkManagerOutput.output,
	// 	false,
	// 	ipAddress,
	// 	true
	// );
	// await sleep(1);
	// console.log('response6', response6);
	// io.emit('deauth_6', response6);
	// if (!networkManagerOutput.status) {
	// 	Constants.deauthRunning = false;
	// 	await sleep(1);
	// 	io.emit('deauth_j_3', {
	// 		status: false,
	// 		success: false,
	// 		message: `Deauth failed. ${networkManagerOutput.output}`,
	// 	});
	// 	return;
	// }

	const response7 = prepareRespose(3, true, undefined, true, ipAddress, true);
	await sleep(1);
	console.log('response7', response7);
	io.emit('deauth_7', response7);
	const ipStatusOutput = checkIpStatus(ipAddress);
	const response8 = prepareRespose(
		3,
		ipStatusOutput.status,
		ipStatusOutput.output,
		false,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response8', response8);
	io.emit('deauth_8', response8);
	if (!ipStatusOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_4', {
			status: false,
			success: false,
			message: `Deauth failed. ${ipStatusOutput.output}`,
		});
		return;
	}

	const response9 = prepareRespose(
		4,
		true,
		undefined,
		true,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response9', response9);
	io.emit('deauth_9', response9);
	const accessPointMacAddressOutput =
		getAccessPointMacAddress(networkInterface);
	const response10 = prepareRespose(
		4,
		accessPointMacAddressOutput.status,
		accessPointMacAddressOutput.output,
		false,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response10', response10);
	io.emit('deauth_10', response10);
	if (!accessPointMacAddressOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_5', {
			status: false,
			success: false,
			message: `Deauth failed. ${accessPointMacAddressOutput.output}`,
		});
		return;
	}

	const response11 = prepareRespose(
		5,
		true,
		undefined,
		true,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response11', response11);
	io.emit('deauth_11', response11);
	const deviceMacAddressOutput = getDeviceMacAddress(ipAddress);
	const response12 = prepareRespose(
		5,
		deviceMacAddressOutput.status,
		deviceMacAddressOutput.output,
		false,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response12', response12);
	io.emit('deauth_12', response12);
	if (!deviceMacAddressOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_6', {
			status: false,
			success: false,
			message: `Deauth failed. ${deviceMacAddressOutput.output}`,
		});
		return;
	}

	const response13 = prepareRespose(
		6,
		true,
		undefined,
		true,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response13', response13);
	io.emit('deauth_13', response13);
	const monitorModeOutput = startAndGetMonitorMode(networkInterface);
	const response14 = prepareRespose(
		6,
		monitorModeOutput.status,
		monitorModeOutput.output,
		false,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response14', response14);
	io.emit('deauth_14', response14);
	if (!monitorModeOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_7', {
			status: false,
			success: false,
			message: `Deauth failed. ${monitorModeOutput.output}`,
		});
		return;
	}

	const response21 = prepareRespose(
		7,
		true,
		undefined,
		true,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response21', response21);
	io.emit('deauth_21', response21);
	const channelOutput = getAPChannelName(
		monitorModeOutput.monitor_interface,
		accessPointMacAddressOutput.access_point_mac
		);
	const response22 = prepareRespose(
		7,
		channelOutput.status,
		channelOutput.output,
		false,
		ipAddress,
		ipStatusOutput.status
	);
	await sleep(1);
	console.log('response22', response22);
	io.emit('deauth_22', response22);
	if (!channelOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_12', {
			status: false,
			success: false,
			message: `Deauth failed. ${channelOutput.output}`,
		});
		return;
	}

	const response15 = prepareRespose(
		8,
		true,
		undefined,
		true,
		ipAddress,
		false
	);
	await sleep(1);
	console.log('response15', response15);
	io.emit('deauth_15', response15);
	const deauthOutput = performDeauth(
		// monitorModeOutput.monitor_interface,
		networkInterface,
		accessPointMacAddressOutput.access_point_mac,
		deviceMacAddressOutput.device_mac,
		timeout,
		channelOutput.channel
	);
	const response16 = prepareRespose(
		8,
		deauthOutput.status,
		deauthOutput.output,
		false,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response16', response16);
	io.emit('deauth_16', response16);
	if (!deauthOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_8', {
			status: false,
			success: false,
			message: `Deauth failed. ${deauthOutput.output}`,
		});
		return;
	}

	const response17 = prepareRespose(
		9,
		true,
		undefined,
		true,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response17', response17);
	io.emit('deauth_17', response17);
	const stopMonitorModeOutput = stopMonitorMode(
		networkInterface,
		monitorModeOutput.monitor_interface
	);
	const response18 = prepareRespose(
		9,
		stopMonitorModeOutput.status,
		stopMonitorModeOutput.output,
		false,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response18', response18);
	io.emit('deauth_18', response18);
	if (!stopMonitorModeOutput.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_9', {
			status: false,
			success: false,
			message: `Deauth failed. ${stopMonitorModeOutput.output}`,
		});
		return;
	}

	const response19 = prepareRespose(
		10,
		true,
		undefined,
		true,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response19', response19);
	io.emit('deauth_19', response19);
	const networkManagerOutput2 = restartNetworkManager();
	const response20 = prepareRespose(
		10,
		networkManagerOutput2.status,
		networkManagerOutput2.output,
		false,
		ipAddress,
		true
	);
	await sleep(1);
	console.log('response20', response20);
	io.emit('deauth_20', response20);
	if (!networkManagerOutput2.status) {
		Constants.deauthRunning = false;
		await sleep(1);
		io.emit('deauth_j_10', {
			status: false,
			success: false,
			message: `Deauth failed. ${networkManagerOutput2.output}`,
		});
		return;
	}

	Constants.deauthRunning = false;
	await sleep(1);
	io.emit('deauth_j_11', {
		status: true,
		success: true,
		message: 'Deauth successful',
		ipAddress: ipAddress,
		ipStatus: true,
	});
};

const isDeauthRunning = async (req, res) => {
	console.log('isDeauthRunning');
	const { ipAddress } = req.body;
	const { deauthRunning } = Constants;
	return res.status(200).json({
		isRunning: deauthRunning,
		ipAddress: ipAddress,
	});
};

module.exports = { 
	performDeauthantication, 
	isDeauthRunning,
};

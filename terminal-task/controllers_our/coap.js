const { spawn, execSync, spawnSync, exec } = require('child_process');
const Constants = require('../utils/constants');

let serverData;
exports.serverCoAP = (directory, type = 'start') => {
	const { io } = Constants;
	console.log(`Server ${type}`);

	if (type === 'stop') {
		try {
			serverData.kill('SIGINT');
			io.emit('coap-server-stopped');
			Constants.serverRunning = false;
		} catch (error) {
			console.log(error);
		}
		return;
	}

	serverData = spawn('./server.py', {
		cwd: `${directory}/aiocoap/`,
		shell: true,
	});

	serverData.stderr.on('data', (data) => {
		if (data.toString().includes('ready to receive')) {
			io.emit('coap-server-started');
			Constants.serverRunning = true;
			return;
		}
		if (!data.toString().includes('DEBUG')) {
			return;
		}
		console.error(`stderr: ${data.toString()}`);

		if (data.toString().split('\n').length < 3) {
			return;
		}

		const [incomingMessage, , responseMessage] = data
			.toString()
			.split('\n');
		const incomingMessageDetails = incomingMessage
			.slice(
				incomingMessage.indexOf('<') + 1,
				incomingMessage.lastIndexOf('>')
			)
			.split(':')[1]
			.trim()
			.split(' ');
		const responseMessageDetails = responseMessage
			.slice(
				responseMessage.indexOf('<') + 1,
				responseMessage.lastIndexOf('>')
			)
			.split(':')[1]
			.trim()
			.split(' ');

		io.emit(
			'coap-server',
			JSON.stringify({
				token: incomingMessageDetails[5].slice(0, -1),
				incomingMessage: {
					packetType: incomingMessageDetails[0],
					httpType: incomingMessageDetails[1],
					messageID: incomingMessageDetails[3].replace(',', ''),
					token: incomingMessageDetails[5].slice(0, -1),
				},
				responseMessage: {
					packetType: responseMessageDetails[0],
					httpType: responseMessageDetails[2],
					messageID: responseMessageDetails[4]?.replace(',', ''),
					token: responseMessageDetails[5]?.slice(0, -1),
				},
			})
		);
	});
};

exports.clientCoAP = (directory, type = 'get',url) => {
	const { io } = Constants;
	console.log(`handling ${type} request`);

	const clientData = spawnSync(`./clientGET.py ${url}`, {
		cwd: `${directory}/aiocoap/`,
		shell: true,
	});

	io.emit(
		'coap-client',
		JSON.stringify({
			debug: clientData.stderr.toString(),
			clientData: clientData.stdout.toString(),
		})
	);
};

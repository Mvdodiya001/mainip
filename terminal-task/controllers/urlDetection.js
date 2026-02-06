const fs = require('fs');
const { spawn } = require('child_process');
const Constants = require('../utils/constants');
const { io } = Constants;
const { ProcessManager } = require('../models/RunningAppProcess');

let UrlsGenerator = undefined;

const getUrlsGeneratorUtil = (ip, InterF) => {
	const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S bash newtool.sh ${ip} ${InterF}`;
	UrlsGenerator = spawn(command, { shell: true });

	UrlsGenerator.stdout.on('data', (data) => {
		io.emit('urls', JSON.stringify(data));
		console.log('ajajaja');
	});

	UrlsGenerator.stderr.on('data', (data) => {
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
		UrlsGenerator.kill('SIGKILL');
		UrlsGenerator = undefined;
	});

	UrlsGenerator.on('exit', (code, signal) => {
		console.log(`Child process exited with code ${code} with signal ${signal}`);
		UrlsGenerator = spawn(command, { shell: true });
	});
};


module.exports = getUrlsGeneratorUtil;
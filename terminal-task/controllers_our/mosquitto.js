const { spawn } = require('child_process');
const Constants = require('../utils/constants');
const { error } = require('console');
let bruteForceProcess;
let mosquittoSubsProcessInfo = {};
let mosquittoPubsProcessInfo = {};
let mosquittoDosProcessInfo = {};
const killSubscribe = (userId) => {
	if (!userId) return;
	let mosquittoSubsProcess = mosquittoSubsProcessInfo[userId];
	if (mosquittoSubsProcess) {
		delete mosquittoSubsProcessInfo[userId];
		mosquittoSubsProcess.stdout.removeAllListeners('data');
		mosquittoSubsProcess.stderr.removeAllListeners('data');
		mosquittoSubsProcess.kill();
	}
};
const killPublish = (userId) => {
	if (!userId) return;
	let mosquittoPubsProcess = mosquittoPubsProcessInfo[userId];
	if (mosquittoPubsProcess) {
		mosquittoPubsProcess.stdout.removeAllListeners('data');
		mosquittoPubsProcess.stderr.removeAllListeners('data');
		mosquittoPubsProcess.kill();
		mosquittoPubsProcess = null;
	}
};
const killDos = (userId)=>{
	if (!userId) return;
	let mosquittoDosProcess = mosquittoDosProcessInfo[userId];
	if (mosquittoDosProcess) {
		mosquittoDosProcess.stdout.removeAllListeners('data');
		mosquittoDosProcess.stderr.removeAllListeners('data');
		mosquittoDosProcess.kill();
		mosquittoDosProcess= null;
	}
}
const killBruteForce = () => {
	if (bruteForceProcess) {
		bruteForceProcess.stdout.removeAllListeners('data');
		bruteForceProcess.stderr.removeAllListeners('data');
		bruteForceProcess.kill();
		bruteForceProcess = null;
	}
};
const publish = (req, res, next) => {
	const { pubs } = req.body;
	const { io, directory } = Constants;
	const userInfo = `${pubs.username}-${pubs.ip}-${pubs.topic}`;
	if (mosquittoPubsProcessInfo.hasOwnProperty(userInfo)) {
		killPublish(userInfo);
		delete mosquittoPubsProcessInfo[userInfo];
	}
	let mosquittoPubsProcess = spawn(
		`echo ${process.env.ROOT_PASSWORD} | python3 publish_new.py -u ${pubs.username} -P ${pubs.password} -t ${pubs.topic} -r ${pubs.ip} -m "${pubs.message}"`,
		{
			cwd: `${directory}/mqtt/`,
			shell: true,
		}
	);
	io.emit('mosquittoPubsData', {
		msg: 'Publish process started. Check for updates.',
		id: userInfo,
	});
	mosquittoPubsProcessInfo = {
		...mosquittoPubsProcessInfo,
		[userInfo]: mosquittoPubsProcess,
	};
	const helper = (userInfo) => {
		return (data) => {
			const msg = data.toString();
			io.emit('mosquittoPubsData', {
				msg,
				id: userInfo,
			});
		};
	};
	const handleStdout = helper(userInfo);
	mosquittoPubsProcess.stdout.on('data', handleStdout);

	mosquittoPubsProcess.stderr.on('data', (data) => {
		io.emit('mosquittoPubsData', { msg: data.toString(), id: userInfo });
	});

	mosquittoPubsProcess.on('exit', (code) => {
		io.emit('mosquittoPubsData', {
			msg: 'Sucessfully published!!',
			id: userInfo,
		});
	});
	return res.status(200).json({
		message: 'Publish process started. Check for updates.',
	});
};
const subscribe = async (req, res, next) => {
	try {
		const { subs } = req.body;
		const { io, directory } = Constants;
		const userInfo = `${subs.username}-${subs.ip}-${subs.topic}`;
        
		if (mosquittoSubsProcessInfo.hasOwnProperty(userInfo)) {
			killSubscribe(userInfo);
			delete mosquittoSubsProcessInfo[userInfo];
		}
		let mosquittoSubsProcess = spawn(
			`echo ${process.env.ROOT_PASSWORD} | python3 ./subscribe_new.py -r ${subs.ip}  -t ${subs.topic} -u ${subs.username} -P ${subs.password} -T 10000`,
			{
				cwd: `${directory}/mqtt/`,
				shell: true,
			}
		);
		io.emit('mosquittoSubsData', {
			msg: 'Subscription process started. Check for updates.',
			id: userInfo,
		});
		mosquittoSubsProcessInfo = {
			...mosquittoSubsProcessInfo,
			[userInfo]: mosquittoSubsProcess,
		};
		const helper = (userInfo) => {
			return (data) => {
				const msg = data.toString();
				io.emit('mosquittoSubsData', {
					msg,
					id: userInfo,
				});
			};
		};
		const handleStdout = helper(userInfo);
		mosquittoSubsProcess.stdout.on('data', handleStdout);

		mosquittoSubsProcess.stderr.on('data', (data) => {
			console.log(data.toString());
			io.emit('mosquittoSubsData', {
				msg: data.toString(),
				id: userInfo,
			});
		});

		mosquittoSubsProcess.on('exit', (code) => {
			console.log(
				`mosquittoSubsProcess - Subscribe - exited with code ${code} ${
					mosquittoSubsProcess ? mosquittoSubsProcess.pid : null
				}`
			);
		});
		return res.status(200).json({
			message: 'Subscription process started. Check for updates.',
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

const bruteForce = (file, host, username, directory) => {
	const { io } = Constants;
	bruteForceProcess = spawn(
		`echo ${process.env.ROOT_PASSWORD} | python3 authbreaker.py -f ${file} -r ${host} -u ${username}`,
		{
			cwd: `${directory}/mqtt/`,
			shell: true,
		}
	);
	bruteForceProcess.stdout.on('data', (data) => {
		const msg = data.toString();
		console.log(msg);
		io.emit('bruteForceData', msg);
	});

	bruteForceProcess.stderr.on('data', (data) => {
		io.emit(
			'error',
			JSON.stringify({
				errorType: 'bruteForceError',
				message: `${data.toString()}. Stopping Brute force test.`,
				code: 500,
			})
		);
		killBruteForce();
	});
};
const dosAttack = (req,res, next)=>{
	const {dos} = req.body;
	const {io, directory} = Constants;
	const userInfo = `${dos.username}-${dos.ip}-${dos.topic}`;
	if(mosquittoDosProcessInfo.hasOwnProperty(userInfo)){
		killDos(userInfo);
		delete mosquittoDosProcessInfo[userInfo];
	}
	let mosquittoDosProcess = spawn(
		`echo ${process.env.ROOT_PASSWORD} | python3 ./dos.py -u ${dos.username} -P ${dos.password} -r ${dos.ip} -t ${dos.topic} -p ${dos.port} -m "${dos.message}"`,
		{
			cwd: `${directory}/mqtt/`,
			shell: true,
		}
	);
	io.emit('mosquittoDosData', {
		msg: `Started DOS attack  on ${dos.ip}.`,
		id: userInfo,
	});
	mosquittoDosProcessInfo = {
		...mosquittoDosProcessInfo,
		[userInfo]: mosquittoDosProcess,
	};
	const helper = (userInfo) => {
		return (data) => {
			const msg = data.toString();
			io.emit('mosquittoDosData', {
				msg,
				id: userInfo,
			});
		};
	};
	const handleStdout = helper(userInfo);
	mosquittoDosProcess.stdout.on('data', handleStdout);

	mosquittoDosProcess.stderr.on('data', (data) => {
		io.emit('mosquittoDosData', {
			msg: data.toString(),
			id: userInfo,
		});
	});

	mosquittoDosProcess.on('exit', (code) => {
		io.emit('mosquittoDosData', {
			msg: 'DOS process stopped.',
			id: userInfo,
		});
	});
	return res.status(200).json({
		message: 'DOS process started. Check for updates.',
	});

}
module.exports = {
	publish,
	subscribe,
	killSubscribe,
	killPublish,
	bruteForce,
	killBruteForce,
	dosAttack,
	killDos
};

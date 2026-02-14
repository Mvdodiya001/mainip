const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const { exec, spawn, execSync } = require('child_process');
const http = require('http');

dotenv.config({ path: path.join(__dirname, 'config.env') });

const cron = require('node-cron');
const { updateDataset } = require('./utils/datasetUpdater');

// Schedule CVE dataset update
// Run once on server start (non-blocking)
updateDataset();
// Schedule to run every day at midnight
cron.schedule('0 0 * * *', () => {
	updateDataset();
});

const app = express();
const server = http.createServer(app);
app.use(express.json());
// Add cors policy
app.use(cors());
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'final_test/uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, 'scanner.apk');
	},
});
const upload = multer({ storage: storage });
const IPDataModel = require('./models/IPDataModel'); // Module for scan data
const RouterScanModel = require('./models/RouterScanModel');
const { formatData, port_443 } = require('./utils/formatData'); // Formatting the output into json
// const cameraUsage = require('./controllers/cameraUsage');
// const audioUsage = require('./controllers/audioUsage');
// const { serverCoAP, clientCoAP } = require('./controllers/coap');
const { serverCoAP, clientCoAP, coaDos, sendReplay, sendarp } = require('./controllers/coap');
const getServerFingerprintUtil = require("./controllers/serverFingerprinting")

const getUrlsGeneratorUtil = require('./controllers/urlDetection');

// Global variables
const { MEMORY_USAGE_HELP_LIST } = require('./utils/memory_usage_utils');
let starttime = Date.now();

const { Server } = require('socket.io');
const Constants = require('./utils/constants');
Constants.io = new Server(server);
const {
	publish,
	subscribe,
	killSubscribe,
	killPublish,
	bruteForce,
	killBruteForce,
	dosAttack,
	killDos,
} = require('./controllers/mosquitto');
const {
	directory,
	scans,
	pidTimestamp,
	PORT,
	io,
	ipAddressUnderDeviceScan,
	getMemoryUsage,
} = Constants;

console.log('Testing =>', directory);
const {
	startScanning,
	deleteScan,
	routerScanData,
	multipleIPUploads,
} = require('./controllers/scanningDevices');
const getDeviceName = require('./controllers/getDeviceName');
const getCveData = require('./controllers/getCveData');
const { getCveResults } = require('./controllers/cveController');
const { getCveDetail } = require('./controllers/cveDetailController');

// const { getCveResults } = require('./controllers/cveController');
// const { getCveDetail } = require('./controllers/cveDetailController');

const appRunningStatus = require('./controllers/appRunningStatus');
//const { uploadApkFile, scanApkFile } = require('./controllers/apkScanner');
const {
	getNetworkInterfaces,
	setNetworkInterface,
	getCurrentNetworkInterface,
} = require('./controllers/networkInterface');
const {
	performDeauthantication,
	isDeauthRunning,
} = require('./controllers/deauthController');

const { getWordsWithCveStatus } = require('./controllers/cveController');
// API for frontend to get all extracted words (with version) and CVE status
app.get('/api/cve/words', getWordsWithCveStatus);

io.on('connection', (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);
	socket.on('scanIPAddress', async (ipAddress, currID) => {
		const formatted = {
			end: false,
			ip: ipAddress,
			report: [],
			summary: [],
			timestamp: new Date(Date.now()).toISOString(),
			//timestamp: Date.now(),
			// endtime: Date.now(),
			coun: 0,
			port: 0,
			demoendtime: new Date(Date.now()).toISOString(),
			endtime: new Date(Date.now()).toISOString(),

		};
		let starttime = Date.now();
		//st = Date.now();
		const currentIndex = -1;
		const tempstr = '';

		const IPData = await IPDataModel.create(formatted);

		startScanning(starttime, ipAddress, IPData, formatted, currentIndex, tempstr);

		// IPData.updateOne(
		// 	{ id: "66be71e24a7aeaff0e7219f7" },
		// 	{ $pull: { report: { title: "Cipher" } } }
		//   )
	});

	socket.on('scanMultipleIP', (listOfIPs) => {
		listOfIPs.forEach(async (ipAddress) => {
			if (ipAddress == '') {
				return;
			}

			const formatted = {
				end: false,
				ip: ipAddress,
				report: [],
				summary: [],
				// timestamp: new Date(Date.now()).toISOString(),
				coun: 0,
				port: 0,
				timestamp: new Date(Date.now()).toISOString(),
				//timestamp: Date.now(),
				//endtime: Date.now(),
				endtime: new Date(Date.now()).toISOString(),
			};
			let starttime = Date.now();
			//st = Date.now();
			const currentIndex = -1;
			const tempstr = '';

			const IPData = await IPDataModel.create(formatted);

			startScanning(starttime, ipAddress, IPData, formatted, currentIndex, tempstr);
		});
	});

	socket.on('scanRouterMultiThreaded', (id) => {
		const getIPAddress = exec(
			`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./connected_ips.sh`,
			{
				cwd: directory,
				shell: true,
			}
		);

		const routerScanData = {
			timestamp: new Date(Date.now()).toISOString(),
			numberOfIP: 0,
			IPScanIds: [],
		};

		getIPAddress.stdout.on('data', (data) => {
			data.split('\n').forEach(async (el) => {
				if (el == '') {
					return;
				}

				const ipAddress = el.replace('(', '').replace(')', '');
				const formatted = {
					end: false,
					ip: ipAddress,
					report: [],
					summary: [],
					//timestamp: new Date(Date.now()).toISOString(),
					timestamp: new Date(Date.now()).toISOString(),
					//timestamp: Date.now(),
					//endtime: Date.now(),
					coun: 0,
					port: 0,
					endtime: new Date(Date.now()).toISOString(),
				};

				//st = Date.now();
				const currentIndex = -1;
				const tempstr = '';

				const IPData = await IPDataModel.create(formatted);
				routerScanData.numberOfIP = routerScanData.numberOfIP + 1;
				routerScanData.IPScanIds.push(IPData._id);

				startScanning(
					ipAddress,
					IPData,
					formatted,
					currentIndex,
					tempstr
				);
			});
		});

		getIPAddress.on('close', async () => {
			await RouterScanModel.create(routerScanData);
		});
	});

	socket.on('scanRouterSingleThreaded', (id) => {
		const child = spawn(
			`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./router_scan.sh`,
			{
				cwd: directory,
				shell: true,
			}
		);

		const routerScanData = {
			timestamp: new Date(Date.now()).toISOString(),
			numberOfIP: 0,
			IPScanIds: [],
		};

		let formatted = {};
		let currentIndex = -1;
		let tempstr = '';
		let IPData = {};
		let currPID = 1;

		child.stdout.on('data', async (data) => {
			const dt = String(data);
			// console.log(dt);

			if (dt.toLowerCase().includes('testing started for')) {
				let ipAddress = '';
				try {
					ipAddress = dt.match(/TESTING STARTED FOR (.*)/)[1];
				} catch (err) {
					console.log(err);
				}

				if (ipAddress == '') {
					return;
				}

				formatted = {
					end: false,
					ip: ipAddress,
					report: [],
					summary: [],
					timestamp: new Date(Date.now()).toISOString(),
					//timestamp: Date.now(),
					//endtime: Date.now(),
					coun: 0,
					port: 0,
					endtime: new Date(Date.now()).toISOString(),
				};

				//st = Date.now();
				currentIndex = -1;
				tempstr = '';

				IPData = await IPDataModel.create(formatted);
				routerScanData.numberOfIP = routerScanData.numberOfIP + 1;
				routerScanData.IPScanIds.push(IPData._id);

				formatted['id'] = IPData._id;
				pidTimestamp[currPID] = formatted.id;
				scans[pidTimestamp[currPID]] = {
					formatted: formatted,
					currentIndex: currentIndex,
					tempstr: tempstr,
				};
				io.emit('IPScanData', JSON.stringify(scans));
				// return;
			}

			if (dt.toLowerCase().includes('test completed')) {
				scans[pidTimestamp[currPID]].formatted = {
					...scans[pidTimestamp[currPID]].formatted,
					end: true,

				};

				io.emit('IPScanData', JSON.stringify(scans));
				try {
					await IPDataModel.findByIdAndUpdate(
						pidTimestamp[currPID],
						scans[pidTimestamp[currPID]].formatted
					);
					delete pidTimestamp[currPID];
				} catch (err) {
					console.log(err);
				}
				return;
			}

			if (!scans[pidTimestamp[currPID]]) {
				return;
			}
			formatData(data, scans[pidTimestamp[currPID]]).then(
				async (modifiedObj) => {
					scans[pidTimestamp[currPID]] = modifiedObj;

					io.emit('IPScanData', JSON.stringify(scans));
					await IPDataModel.findByIdAndUpdate(
						pidTimestamp[currPID],
						scans[pidTimestamp[currPID]].formatted
					);
				}
			);
		});

		child.on('exit', async (code, signal) => {
			console.log(`Child exited with code ${code} and signal ${signal}.`);
		});
	});

	socket.on('memory-usage', (packetName) => {
		console.log('Usage scanning started');

		getMemoryUsage.process = exec(`adb shell top`, {
			shell: true,
			cwd: directory,
		});

		getMemoryUsage.process.stdout.on('data', (data) => {
			data = String(data)
				.split('\n')
				.filter((el) => el.indexOf(packetName) !== -1);

			if (!data) {
				return;
			}

			data = data[0];
			if (!data) {
				return;
			}

			try {
				data = data
					.trim()
					.split(' ')
					.filter((el) => el !== '')
					.map((el, index) => ({
						heading: MEMORY_USAGE_HELP_LIST[index][0],
						value: String(el),
						detail: MEMORY_USAGE_HELP_LIST[index][1],
					}));
			} catch (err) {
				io.emit(
					'error',
					JSON.stringify({
						message: `No process running for ${packetName}`,
						errorType: 'No Process Running',
						status: 500,
					})
				);
				getMemoryUsage.process.kill('SIGKILL');
				getMemoryUsage.process = undefined;
				return;
			}

			io.emit('memory-usage-data', JSON.stringify(data));
		});

		getMemoryUsage.process.stderr.on('data', (data) => {
			io.emit(
				'error',
				JSON.stringify({
					message: String(data),
					errorType: 'ADB Error',
					status: 500,
				})
			);
		});

		const memoryUsageTimeout = setTimeout(() => {
			if (!getMemoryUsage.process) {
				return;
			}

			io.emit(
				'memory-usage-data',
				'Memory Usage Stopped to excess time.'
			);
			getMemoryUsage.kill('SIGKILL');
			getMemoryUsage = undefined;
		}, 3600000);

		getMemoryUsage.process.on('exit', (code, signal) => {
			clearTimeout(memoryUsageTimeout);
			console.log(code, signal);
		});
	});

	socket.on('network-graph', () => {
		const getNetworkGraph = exec(
			`echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./network-graph.sh`,
			{
				shell: true,
				cwd: directory,
			}
		);

		let router = 0,
			nodeCounter = 1,
			edgeCounter = 1;
		const nodeMapping = {};

		Object.keys(ipAddressUnderDeviceScan).forEach((ipAddress) => {
			delete ipAddressUnderDeviceScan[ipAddress];
		});

		const angle = (2 * Math.PI) / 255;
		let lastIp = '';

		getNetworkGraph.stdout.on('data', (graphData) => {
			graphData = String(graphData).trim();
			graphData.split('\n').forEach((data) => {
				if (data.startsWith('Router')) {
					router = data.match(/Router IP\s*:\s*(.*)/)[1];
					const node = {
						id: router,
						name: '',
						fx: 700,
						fy: 300,
					};
					console.log(node);
					nodeMapping[router] = '0';
					// console.log(nodeMapping);
					io.emit('network-graph-data-node', JSON.stringify(node));
				} else if (data.startsWith('Route')) {
					const match = data.match(/Route for host\s*:\s*(\S+)(?:\s+(.*))?/);
					if (!match) return;

					const curr = match[1];
					let deviceName = match[2] ? match[2].trim() : '';
					if (deviceName.startsWith('(') && deviceName.endsWith(')')) {
						deviceName = deviceName.slice(1, -1);
					}

					const ipNum = Number(curr.split('.')[3]);
					const node = {
						id: curr,
						name: deviceName,
					};
					nodeMapping[curr] = String(nodeCounter);
					nodeCounter++;
					lastIp = curr;
					console.log(node);
					io.emit('network-graph-data-node', JSON.stringify(node));
				} else if (data !== '') {
					if (data.includes('*')) {
						io.emit(
							'error',
							JSON.stringify({
								message: `No route to host ${lastIp}`,
								errorType: 'No Route to Host',
								status: 500,
							})
						);
						return;
					}

					const edge = {
						source: router,
						target: data,
					};
					//console.log(edge);
					edgeCounter++;
					io.emit('network-graph-data-edge', JSON.stringify(edge));
				}
			});
		});
	});

	socket.on('killPubs', (pubs) => {
		const { username, ip, topic } = pubs;
		const userInfo = `${username}-${ip}-${topic}`;
		killPublish(userInfo);
	});
	socket.on('bruteForce', (passwordList, topic, username, customTest) => {
		if (customTest) {
			const passwords = passwordList.join('\n');
			fs.writeFile(
				'./final_test/mqtt/codes/crackauth/feed1.txt',
				passwords,
				(err) => {
					if (err) throw err;
					console.log('File saved!');
				}
			);
			bruteForce('feed1.txt', topic, username, directory);
		} else {
			bruteForce('passwords.txt', topic, username, directory);
		}
	});
	socket.on('stopBruteForce', killBruteForce);
	socket.on('disconnect', (reason) => {
		console.log(`${socket.id} is disconnected`);
		killSubscribe();
	});

	// socket.on('cameraObserver', (type, option, time) => {
	// 	cameraUsage(type, option, time);
	// });

	// socket.on('audioObserver', (type, option, time) => {
	// 	audioUsage(type, option, time);
	// });














	socket.on('coap-server', (type) => {
		serverCoAP(directory, type);
	});

	socket.on('coap-client', (type, url) => {
		clientCoAP(directory, type, url);
	});



	socket.on('coap-dos', (type, url) => {
		coaDos(directory, type, url);
	});


	socket.on('send-Replay', (url) => {
		sendReplay(directory, url);
	});

	socket.on('send-arp', (type, interf, url, urll) => {
		sendarp(directory, type, interf, url, urll);
	});






	socket.on('start_deauth', (deauthData) => {
		const { network_interface, ip_address, timeout } = deauthData;
		performDeauthantication(network_interface, ip_address, timeout);
	});





	//URL Detection Using Socket

	socket.on('url_detection', (data) => {
		const { ip_address, network_interface } = data;
		// getUrlsGeneratorUtil(ip, interface );
		const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S bash newtool.sh ${ip_address} ${network_interface}`;
		UrlsGenerator = spawn(command, { shell: true });

		UrlsGenerator.stdout.on('data', (data) => {
			io.emit('urls', JSON.stringify(data.toString()));

		});

		UrlsGenerator.stderr.on('data', (data) => {
			io.emit('urls', JSON.stringify(data.toString()));

		});

		UrlsGenerator.on('exit', (code, signal) => {
			console.log(`Child process exited with code ${code} with signal ${signal}`);
			UrlsGenerator = spawn(command, { shell: true });
		});
	});










	const multer = require('multer');

	// Set up multer for file handling
	const upload = multer({ dest: 'uploads/' });

	// Endpoint to handle file upload
	app.post('/upload', upload.single('pcap'), (req, res) => {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const pcapFilePath = req.file.path;
		const jsonFilePath = path.join(__dirname, 'analysis_results.json');


		// Run the Python script
		exec(`sudo python3 encryption.py ${pcapFilePath} ${jsonFilePath}`, (error, stdout, stderr) => {
			// const command = `echo ${process.env.ROOT_PASSWORD} | sudo python3 encryption.py ${path.join(__dirname, 'capt.pcap')}`;

			// exec({command}, (error) => {
			if (error) {
				console.error(`Error executing Python script: ${stderr}`);
				console.log(error);
				return res.status(500).json({ error: 'Error processing file' });
			}

			// Read the generated JSON file and send it as a response
			fs.readFile(jsonFilePath, 'utf8', (err, data) => {
				if (err) {
					console.error(`Error reading JSON file: ${err}`);
					return res.status(500).json({ error: 'Error reading generated JSON file' });
				}

				// Send the JSON content as the response
				res.json(JSON.parse(data));
			});
		});
	});



	app.get('/start-python-app', (req, res) => {
		exec(`python2 ${path.join(__dirname, 'final_test/serverspy/application.py')}`, (err, stdout, stderr) => {
			if (err) {
				console.error(`Error: ${err.message}`);
				res.status(500).send('Failed to start Python app');
				return;
			}
			console.log(`Python App Output: ${stdout}`);
			res.send('Python app started successfully');
		});
	});




	app.get('/process-pcap', async (req, res) => {
		// Logic to fetch the PCAP file and process it
		const pcapFilePath = path.join(__dirname, 'capt.pcap'); // Adjust this to your needs
		const jsonFilePath = path.join(__dirname, 'analysis_results.json');

		exec(`sudo python3 encryption.py ${pcapFilePath} ${jsonFilePath}`, (error) => {
			if (error) {
				console.error(`Error executing Python script: ${error.message}`);
				return res.status(500).json({ error: 'Error processing file' });
			}

			// Read the generated JSON file and send it as a response
			fs.readFile(jsonFilePath, 'utf8', (err, data) => {
				if (err) {
					console.error(`Error reading JSON file: ${err}`);
					return res.status(500).json({ error: 'Error reading generated JSON file' });
				}

				res.json(JSON.parse(data));
			});
		});
	});

	// Simple test endpoint to verify JSON responses are working
	app.get('/api/test-connection', (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.json({ status: 'ok', message: 'API connection successful' });
	});

	//   // Input validation middleware
	//   const validateInput = (req, res, next) => {
	// 	const { ip, port } = req.query;

	// 	// Check if parameters exist
	// 	if (!ip || !port) {
	// 	  return res.status(400).json({ error: 'IP address and port are required' });
	// 	}

	// 	// Validate IP address format (basic validation)
	// 	const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
	// 	if (!ipRegex.test(ip)) {
	// 	  return res.status(400).json({ error: 'Invalid IP address format' });
	// 	}

	// 	// Validate port
	// 	const portNum = parseInt(port);
	// 	if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
	// 	  return res.status(400).json({ error: 'Port must be a number between 1 and 65535' });
	// 	}

	// 	// Sanitize inputs to prevent command injection
	// 	if (ip.includes(';') || ip.includes('&') || ip.includes('|') || 
	// 		port.includes(';') || port.includes('&') || port.includes('|')) {
	// 	  return res.status(400).json({ error: 'Invalid characters in input' });
	// 	}

	// 	next();
	//   };

	// Endpoint for server fingerprinting (JSON API)


	// Alternative endpoint for JSONP support
	app.get('/alt-api/server-fingerpt-jsonp', (req, res) => {
		const { ip, port, callback } = req.query;

		if (!callback) {
			return res.status(400).json({ error: 'Callback parameter is required for JSONP' });
		}

		// Create output directory if it doesn't exist
		const outputDir = path.join(__dirname, 'outputs');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		// Generate unique filename for this run
		const timestamp = new Date().getTime();
		const jsonFilePath = path.join(outputDir, `fingerprint_${timestamp}.json`);

		try {
			exec(`python3 server_fingerprinting.py ${ip} ${port} -o ${jsonFilePath}`, (error, stdout, stderr) => {
				if (error) {
					const errorData = JSON.stringify({
						error: 'Error processing fingerprinting request',
						details: error.message
					});
					return res.send(`${callback}(${errorData});`);
				}

				// Read the generated JSON file
				fs.readFile(jsonFilePath, 'utf8', (err, data) => {
					if (err) {
						const errorData = JSON.stringify({
							error: 'Error reading generated JSON file',
							details: err.message
						});
						return res.send(`${callback}(${errorData});`);
					}

					try {
						// Parse JSON to validate it
						const jsonData = JSON.parse(data);
						// Return as JSONP
						res.send(`${callback}(${data});`);
					} catch (parseError) {
						const errorData = JSON.stringify({
							error: 'Error parsing JSON output',
							details: parseError.message
						});
						return res.send(`${callback}(${errorData});`);
					}
				});
			});
		} catch (err) {
			const errorData = JSON.stringify({
				error: 'Server error',
				details: err.message
			});
			return res.send(`${callback}(${errorData});`);
		}
	});

	// Direct endpoint to run the Python script
	app.get('/direct-run', (req, res) => {
		res.setHeader('Content-Type', 'text/plain');

		try {
			// Simple execution test
			exec('python3 --version', (error, stdout, stderr) => {
				if (error) {
					return res.send(`Error executing Python: ${error.message}\n${stderr}`);
				}
				res.send(`Python execution successful: ${stdout}`);
			});
		} catch (err) {
			res.send(`Server error: ${err.message}`);
		}
	});




	app.get('/detect-url', (req, res) => {
		const pcapFilePath = path.join(__dirname, 'capt.pcap'); // Adjust this as necessary

		// Construct the command to execute
		const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S bash newtool.sh ${pcapFilePath}`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing script: ${error.message}`);
				return res.status(500).json({ error: 'Error processing PCAP file' });
			}

			if (stderr) {
				console.error(`Script error: ${stderr}`);
				return res.status(500).json({ error: 'Error in script execution' });
			}

			// Send the output of the script as the response
			res.send(stdout);
		});
	});

	// const app = express();
	const uploads = multer({ dest: 'upload-pcap' });

	app.post('/upload-pcap', uploads.single('pcapFile'), (req, res) => {
		if (!req.file) {
			return res.status(400).send('No file uploaded.');
		}

		const uploadedFilePath = req.file.path;
		const newFilePath = path.join(path.dirname(uploadedFilePath), 'capt.pcap');

		fs.renameSync(uploadedFilePath, newFilePath);

		const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S bash newtool.sh ${newFilePath}`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing script: ${error.message}`);
				return res.status(500).json({ error: 'Error processing PCAP file' });
			}

			if (stderr) {
				console.error(`Script error: ${stderr}`);
				return res.status(500).json({ error: 'Error in script execution' });
			}

			// Send the output of the script as the response
			res.send(stdout);

			// Clean up: delete the uploaded file
			fs.unlinkSync(newFilePath);
		});
	});




	const fs = require('fs');
	const path = require('path');


	socket.on('communication_data', (data) => {
		const { ip_address, network_interface } = data;
		// console.log("Received communication data");

		// Ensure captures directory exists
		const capturesDir = path.join(__dirname, 'uploads', 'captures');
		if (!fs.existsSync(capturesDir)) {
			fs.mkdirSync(capturesDir, { recursive: true });
		}

		const timestamp = Date.now();
		const pcapFilename = `scan_${ip_address.replace(/\./g, '_')}_${timestamp}.pcap`;
		const pcapFilePath = path.join(capturesDir, pcapFilename);

		// Emit the PCAP filename to the client so they can request analysis later
		io.emit('pcap_file_created', { filename: pcapFilename, fullPath: pcapFilePath });

		const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S bash spoof2.sh ${ip_address} ${network_interface}`;
		// console.log('Command:', command);

		const communi_gen = spawn(command, { shell: true });

		// Start tcpdump to capture packets (Visual Stream - ASCII)
		const tcpdump = spawn('sudo', ['tcpdump', '-i', network_interface, '-A']); // -A for ASCII output

		// Start tcpdump to RECORD packets (Binary PCAP)
		const tcpdumpRecorder = spawn('sudo', ['tcpdump', '-i', network_interface, '-w', pcapFilePath]);

		// Listen for stdout data from the spoofing command
		communi_gen.stdout.on('data', (output) => {
			const outputStr = output.toString();
			//console.log('STDOUT:', outputStr);
			// if (outputStr.includes("Successfully Spoofed!")) {
			//     io.emit('comm', JSON.stringify({ type: 'success', message: `Successful IP: ${ip_address}` }));
			// }

			if (outputStr.includes("Successfully Spoofed!")) {
				// Read successful_ips.txt and emit its contents
				fs.readFile(path.join(__dirname, 'successful_ips.txt'), 'utf8', (err, data) => {
					if (err) {
						console.error('Error reading successful_ips.txt:', err);
						return;
					}
					// Emit the contents of successful_ips.txt
					io.emit('comm', JSON.stringify({ type: 'success', message: `Successful IPs:\n${data}` }));
				});
			}





			else {
				io.emit('comm', JSON.stringify({ type: 'stdout', message: outputStr }));
			}
		});

		//for ip_address
		io.emit('comm', JSON.stringify({ type: 'source_ip', message: ip_address }));



		// Listen for stdout data from tcpdump (Visual)
		tcpdump.stdout.on('data', (packetOutput) => {
			const packetStr = packetOutput.toString();
			//console.log('Captured Packet:', packetStr);
			io.emit('packet_capture', packetStr); // Emit captured packet data to the frontend
		});




		// Listen for stderr data from the spoofing command
		communi_gen.stderr.on('data', (errorOutput) => {
			// console.error('STDERR:', errorOutput.toString());
			io.emit('comm', JSON.stringify({ type: 'stderr', message: errorOutput.toString() }));
		});

		// Handle process exit for both processes
		communi_gen.on('exit', (code, signal) => {
			//  console.log(`Spoofing process exited with code ${code} and signal ${signal}`);
			tcpdump.kill(); // Stop tcpdump when spoofing is done
			tcpdumpRecorder.kill(); // Stop the recorder too
		});

		tcpdump.on('exit', (code) => {
			// console.log(`tcpdump exited with code ${code}`);
		});

		tcpdumpRecorder.on('exit', (code) => {
			console.log(`tcpdump recorder exited with code ${code}`);

			// AUTOMATIC FIRMWARE ANALYSIS
			if (fs.existsSync(pcapFilePath)) {
				console.log(`[Auto-Analysis] Starting firmware analysis on: ${pcapFilePath}`);
				const crypto = require('crypto');

				try {
					// 1. Calculate Integrity Hash
					const fileBuffer = fs.readFileSync(pcapFilePath);
					const hashSum = crypto.createHash('sha256');
					hashSum.update(fileBuffer);
					const hexHash = hashSum.digest('hex');

					// 2. Run Analysis Script
					const analysisCmd = `python3 extractfirm.py "${pcapFilePath}"`;
					exec(analysisCmd, (error, stdout, stderr) => {
						let results = {
							success: true,
							integrity_hash: hexHash,
							versions: [],
							raw_output: stdout || ""
						};

						if (error) {
							console.error(`[Auto-Analysis] Error: ${error.message}`);
							results.success = false;
							results.error = error.message;
						} else {
							const lines = stdout.toString().split('\n');
							const cleanedVersions = lines.filter(line =>
								line.trim() !== '' &&
								!line.includes('[+] Found:') &&
								!line.includes('[+] Scanning') &&
								!line.includes('Scanning single file') &&
								!line.includes('[-] No firmware') &&
								!line.includes('[*] Scan completed')
							).map(line => line.trim());
							results.versions = cleanedVersions;
						}

						// Emit results to all clients
						io.emit('firmware_report', results);
						console.log(`[Auto-Analysis] Completed. Found ${results.versions.length} versions.`);
					});
				} catch (err) {
					console.error(`[Auto-Analysis] Exception: ${err.message}`);
				}
			}
		});

		communi_gen.on('exit', (code, signal) => {
			//console.log(`Spoofing process exited with code ${code} and signal ${signal}`);
			if (!tcpdump.killed) {
				tcpdump.kill(); // Stop tcpdump if it's still running
				// console.log('tcpdump process killed');
			}
			if (!tcpdumpRecorder.killed) {
				tcpdumpRecorder.kill();
				console.log('tcpdump recorder process killed');
			}
		});

		// Handle process errors
		communi_gen.on('error', (error) => {
			console.error('Failed to start subprocess:', error);
			io.emit('comm', JSON.stringify({ type: 'error', message: error.message }));
		});
	});




	if (Constants.serverRunning) {
		socket.emit('coap-server-started');
	}
});

app.use(
	cors({
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		credentials: true,
	})
);


// qwert 
app.get('/api/server/fingerprint', async (req, res) => {

	const { ip, port } = req.query;
	console.log(ip, port)

	// Create output directory if it doesn't exist
	const outputDir = path.join(__dirname, 'outputs');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}

	// Generate unique filename for this run
	const timestamp = new Date().getTime();
	const jsonFilePath = path.join(outputDir, `fingerprint_${timestamp}.json`);

	console.log(`Starting fingerprinting for ${ip}:${port}`);

	try {
		// Execute the Python script with parameters
		exec(`python3 server_fingerprinting.py ${ip} ${port} -o ${jsonFilePath}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing Python script: ${error.message}`);
				console.error(`stderr: ${stderr}`);
				return res.status(500).json({
					error: 'Error processing fingerprinting request',
					details: error.message
				});
			}

			console.log(`Python script executed successfully: ${stdout}`);

			// Read the generated JSON file and send it as a response
			fs.readFile(jsonFilePath, 'utf8', (err, data) => {
				if (err) {
					console.error(`Error reading JSON file: ${err}`);
					return res.status(500).json({
						error: 'Error reading generated JSON file',
						details: err.message
					});
				}

				try {
					const jsonData = JSON.parse(data);
					res.json(jsonData);
				} catch (parseError) {
					console.error(`Error parsing JSON: ${parseError}`);
					res.status(500).json({
						error: 'Error parsing JSON output',
						details: parseError.message
					});
				}
			});
		});
	} catch (err) {
		console.error('Uncaught exception:', err);
		res.status(500).json({
			error: 'Server error',
			details: err.message
		});
	}
});


app.get('/ipscandata', function (req, res) {
	return res.status(200).json(scans);
});

app.get('/get-current-network-interface', getCurrentNetworkInterface);
app.get('/get-network-interfaces', getNetworkInterfaces);
app.post('/set-network-interface', setNetworkInterface);

app.delete('/ipscandata/:id', deleteScan);
app.get('/routerScanData', routerScanData);
app.post('/uploadMultipleIP', multipleIPUploads);
app.post('/bruteForce', bruteForce);
app.get('/stop-memory-usage', (req, res) => {
	if (!getMemoryUsage.process) {
		return res.status(400).json({
			status: 'success',
			ok: false,
			message: 'No process running',
		});
	}

	getMemoryUsage.process.kill('SIGKILL');
	getMemoryUsage.process = undefined;

	res.status(203).json({
		status: 'success',
		ok: true,
		message: 'Stopped Process',
	});
});

app.patch('/cve-report-data', getCveData);
app.get('/get-device-name/:ip', getDeviceName);
app.get('/get-third-party-apps', appRunningStatus.getThirdPartyApps);
app.post('/get-running-apps-status', appRunningStatus.getRunningAppStatus);
app.get('/stop-running-apps-status', appRunningStatus.stopRunningAppStatus);
app.post('/check-running-apps', appRunningStatus.checkRunningApps);
app.post('/api/mosquitto/subscribe', subscribe);
app.post('/api/mosquitto/publish', publish);
app.post('/api/deauth/check', isDeauthRunning);

//app.post('/upload-apk-file', upload.single('file'), uploadApkFile, scanApkFile);
app.post('/api/mosquitto/Dos', dosAttack);

app.get('/api/cve/:id', getCveResults);
app.get('/api/cve-detail/:cveId', getCveDetail);
app.patch('/cve-report-data', getCveData);



// app.post("/fingerprint", (req, res) => { const { target, port } = req.body; if (!target || !port) { return res.status(400).json({ error: "Target and port are required" }); } getServerFingerprintUtil(target, port, (error, data) => { if (error) { return res.status(error.code).json({ error: error.error }); } res.json({ results: data }); }); });

mongoose.set('strictQuery', true);
mongoose.connect(
	process.env.DB_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		keepAlive: true,
	},
	async (err) => {
		if (err) {
			console.log('💥💥💥', err);
		} else {
			const res = await IPDataModel.find();
			for (const value of Object.values(res)) {
				scans[value._id] = { formatted: value };
			}
			console.log('Connected to database');

			server.listen(PORT, () => {
				console.log(`Listing on port ${PORT}`);
			});
		}
	}
);

server.on('listening', () => {
	Object.entries(scans).forEach((el) => {
		el[1].formatted.end = true;
	});
});

process.on('uncaughtException', (err) => {
	io.emit(
		'error',
		JSON.stringify({
			message: `${String(err)}, Please restart the server.`,
			errorType: 'Uncaught Exception',
			status: 500,
		})
	);
	console.log('Error💥💥💥: ', err);
	process.exit(0);
});


// 1. Configure storage specifically for PCAP firmware analysis
const firmwareStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Ensure this folder exists or create it manually: mkdir -p uploads/firmware
		const dir = 'uploads/firmware/';
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: function (req, file, cb) {
		// Save with a unique timestamp to prevent overwriting
		cb(null, 'firmware_' + Date.now() + path.extname(file.originalname));
	}
});

const uploadFirmware = multer({ storage: firmwareStorage });


// 3. Analysis Endpoint for EXISTING files (captured during scan)
app.post('/analyze-existing-pcap', express.json(), (req, res) => {
	const { filePath } = req.body;

	if (!filePath) {
		return res.status(400).json({ error: 'No file path provided' });
	}

	// Security check: Ensure we are only accessing files within our uploads directory
	// This is a basic check; real production apps need robust path validation
	if (!filePath.includes('uploads/captures')) {
		// return res.status(403).json({ error: 'Access denied: Invalid file path' });
		// Commenting out strict check for now to allow flexibility in testing
	}

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ error: 'File not found' });
	}

	const crypto = require('crypto');

	// 1. Calculate Integrity Hash (SHA256)
	const fileBuffer = fs.readFileSync(filePath);
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);
	const hexHash = hashSum.digest('hex');

	// Command to run the Python script
	const command = `python3 extractfirm.py "${filePath}"`;

	console.log(`[Firmware Analysis] Starting scan on existing file: ${filePath}`);

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`Exec error: ${error.message}`);
			return res.status(500).json({
				error: 'Analysis failed or script error',
				details: error.message,
				integrity_hash: hexHash
			});
		}

		const lines = stdout.toString().split('\n');
		const cleanedVersions = lines.filter(line =>
			line.trim() !== '' &&
			!line.includes('[+] Found:') &&
			!line.includes('[+] Scanning') &&
			!line.includes('Scanning single file') &&
			!line.includes('[-] No firmware') &&
			!line.includes('[*] Scan completed')
		).map(line => line.trim());

		res.json({
			success: true,
			integrity_hash: hexHash,
			versions: cleanedVersions,
			raw_output: stdout
		});
	});
});

// 2. The Analysis Endpoint
app.post('/analyze-firmware', uploadFirmware.single('pcap'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No PCAP file uploaded' });
	}

	const pcapFilePath = req.file.path;
	const crypto = require('crypto');

	// 1. Calculate Integrity Hash (SHA256)
	const fileBuffer = fs.readFileSync(pcapFilePath);
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);
	const hexHash = hashSum.digest('hex');

	console.log(`[Firmware Analysis] Integrity Hash (SHA256): ${hexHash}`);


	// Command to run the Python script
	// Ensure python3 is available
	const command = `python3 extractfirm.py "${pcapFilePath}"`;

	console.log(`[Firmware Analysis] Starting scan on: ${pcapFilePath}`);

	exec(command, (error, stdout, stderr) => {
		// Cleanup: Delete the uploaded file after analysis to save space
		fs.unlink(pcapFilePath, (err) => {
			if (err) console.error("Error deleting temp file:", err);
		});

		if (error) {
			console.error(`Exec error: ${error.message}`);
			// Even if the script errors out, we might want to return partial info or the error
			return res.status(500).json({
				error: 'Analysis failed or script error',
				details: error.message,
				integrity_hash: hexHash
			});
		}

		// Parse the output (Split by newlines and filter empty strings)
		// The python script outputs "[+] Found:" followed by lines.
		const lines = stdout.toString().split('\n');
		const cleanedVersions = lines.filter(line =>
			line.trim() !== '' &&
			!line.includes('[+] Found:') &&
			!line.includes('[+] Scanning') &&
			!line.includes('Scanning single file') && // Filter out our debug print
			!line.includes('[-] No firmware') &&
			!line.includes('[*] Scan completed')
		).map(line => line.trim()); // Trim whitespace

		res.json({
			success: true,
			integrity_hash: hexHash,
			versions: cleanedVersions,
			raw_output: stdout
		});
	});
});

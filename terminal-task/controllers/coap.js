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











	let ans = " ";  // Declare the variable without 'let string', as JavaScript doesn't use 'string' this way
	serverData.stderr.on('data', (data) => {
		const dataStr = data.toString();

		// Check if the data contains 'ready to receive' and emit an event
		if (dataStr.includes('ready to receive')) {
			io.emit('coap-server-started');
			Constants.serverRunning = true;
			return;
		}

		// Append the new data to 'ans'
		// ans += "\n" + dataStr;
		ans += dataStr;

		// Use regex to match the 'Sending message <...>' pattern
		if (ans.match(/Sending message <(.+?)>/)) {
			  // Reset 'ans' after matching the message

			console.error(`stderr: ${ans}`);  // Log the reset value (empty) to stderr


		  const [incomingMessage, , responseMessage] = ans
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
































			
			ans = " ";
		}
	});



	// let string ans = " ";
	// serverData.stderr.on('data', (data) => {
	// 	const dataStr = data.toString();

	// 	if (dataStr.includes('ready to receive')) {
	// 		io.emit('coap-server-started');
	// 		Constants.serverRunning = true;
	// 		return;
	// 	}


		


	// 	 ans = ans + "\n" + dataStr;

	// 	if(ans.match(/Sending message <(.+?)>/)){

		
	// 	ans = " ";
	
		
	// 	console.error(`stderr: ans`);

	// }

		
	// });
};


// // console.error(`stderr: ${data}`);
		
		// // Check if server is ready
		// if (dataStr.includes('ready to receive')) {
		// 	io.emit('coap-server-started');
		// 	Constants.serverRunning = true;
		// 	return;
		// }










exports.clientCoAP = (directory, type = 'get',url) => {
	const { io } = Constants;
	console.log(`handling ${type} request`);

	const clientData = spawnSync(`./aiocoap-client ${url}`, {
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






// latest latest correc

exports.sendReplay = (directory, url) => {
	const { io } = Constants;
	

	console.log("Gaurav")
	const reData = spawn(`echo ${process.env.ROOT_PASSWORD} | python3 coap_replay_attack.py ${url}`, {
		cwd: `${directory}/aiocoap/`,
		shell: true,
	});
	reData.stderr.on('data', (data) => {
		
		
		console.error(data.toString());
		io.emit(
			'send-Replay',
			JSON.stringify({
				
				Infomation   : data.toString(),
			})
		);
		
	});
};


// const { spawn } = require('child_process'); // Make sure to require this


// exports.sendReplay = (directory, url) => {
//     const { io } = Constants;
//     console.log("Gaurav");

//     const reData = spawn(`echo ${process.env.ROOT_PASSWORD} | python3 coap_replay_attack.py ${url}`, {
//         cwd: `${directory}/aiocoap/`,
//         shell: true,
//     });

//     reData.stderr.on('data', (data) => {
//         console.error(data.toString());
//         io.emit('send-Replay', JSON.stringify({ Information: data.toString() }));
//     });

//     reData.stdout.on('data', (data) => {
//         // console.log(data.toString());
//         // io.emit('send-Replay', JSON.stringify({ Information: data.toString() }));
//     });

//     reData.on('close', (code) => {
//         // console.log(`Child process exited with code ${code}`);
//     });

//     reData.on('error', (err) => {
//         // console.error(`Failed to start subprocess: ${err.message}`);
//     });
// };






// let reData;
// exports.sendarp = (directory, type ='start', interf,url,urll) => {
// 	const { io } = Constants;



// 	if (type === 'stop') {
// 		try {
// 			reData.kill('SIGINT');
// 			// io.emit('coap-server-stopped');
// 			// Constants.serverRunning = false;
// 		} catch (error) {
// 			console.log(error);
// 		}
// 		return;
// 	}
	

// 	// console.log("Gaurav")
// 	reData = spawn(`echo ${process.env.ROOT_PASSWORD} |sudo arpspoof -i ${interf} -t ${url} ${urll}`, {
// 		cwd: `${directory}/aiocoap/`,
// 		shell: true,
// 	});

// 	reData.stderr.on('data', (data) => {
		
		
// 		console.error(data.toString());
// 		// io.emit(
// 		// 	'send-Replay',
// 		// 	JSON.stringify({
				
// 		// 		Infomation   : data.toString(),
// 		// 	})
// 		// );
		
// 	});
// };





// // Declare reData at the module level so it can be shared across function calls
// let reData = null;

// exports.sendarp = (directory, type = 'start', interf, url, urll) => {
// 	const { io } = Constants;

// 	if (type === 'stop') {
// 		if (reData) {  // Check if reData exists
// 			try {
// 				reData.kill('SIGINT');  // Kill the process if running
// 				console.log('Process stopped successfully');
// 				reData = null;  // Reset the reference after killing
// 			} catch (error) {
// 				console.log('Error stopping the process:', error);
// 			}
// 		} else {
// 			console.log('No process running');
// 		}
// 		return;
// 	}

// 	// Start the process if it's not already running
// 	if (!reData) {
// 		reData = spawn(`echo ${process.env.ROOT_PASSWORD} | sudo arpspoof -i ${interf} -t ${url} ${urll}`, {
// 			cwd: `${directory}/aiocoap/`,
// 			shell: true,
// 		});

// 		reData.stderr.on('data', (data) => {
// 			console.error(data.toString());
// 		});

// 		reData.on('close', () => {
// 			reData = null;  // Reset when process finishes
// 		});
// 	} else {
// 		console.log('Process already running');
// 	}
// };







// exports.sendarp = (directory, type = 'start', interf, url, urll) => {
//     const { io } = Constants;
//     const { exec, spawn } = require('child_process');

//     console.log(`Server ${type}`);

//     if (type === 'stop') {
//         try {
//             exec("pkill -f arpspoof", (error, stdout, stderr) => {
//                 if (error) {
//                     // console.error('Error stopping DOS attack:', error);
//                     // io.emit('Dos-stop', JSON.stringify({
//                     //     Information: `Error stopping attack: ${error.message}`
//                     // }));
//                     return;
//                 }
//                 // io.emit('Dos-stop', JSON.stringify({
//                 //     Information: 'DOS attack stopped successfully'
//                 // }));
//             });
//         } catch (error) {
//             // console.error('Exception while stopping DOS attack:', error);
//             // io.emit('Dos-stop', JSON.stringify({
//             //     Information: `Exception: ${error.message}`
//             // }));
//         }
//         return;
//     }

//     try {
//         // Use spawn to execute the DoS attack script
		
//         const D = spawn(`echo ${process.env.ROOT_PASSWORD} | sudo arpspoof -i ${interf} -t ${url} ${urll}`, {
//             cwd: `${directory}/aiocoap/`,
//             shell: true,
//             stdio: ['inherit', 'pipe', 'pipe'] // Capture both stdout and stderr
//         });

//         // Handle standard output
//         D.stdout.on('data', (data) => {
//             // const output = data.toString().trim();
//             // console.log(`DOS attack stdout: ${output}`);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: output,
//             // }));
//         });

//         // Handle error output
//         D.stderr.on('data', (data) => {
//             const error = data.toString();
//             // console.error(`DOS attack stderr: ${error}`);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: error,
//             // }));
//         });

//         // Handle process exit
//         D.on('exit', (code, signal) => {
//             // console.log(`DOS attack process exited with code ${code} and signal ${signal}`);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: `Process exited with code ${code} and signal ${signal}`,
//             // }));
//         });

//         // Handle process errors
//         D.on('error', (error) => {
//             // console.error('DOS attack process error:', error);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: `Process error: ${error.message}`,
//             // }));
//         });

//         // Optional: Send confirmation that the process started
//         // io.emit('Dos-coap', JSON.stringify({
//         //     Information: 'DOS attack process started',
//         // }));

//     } catch (error) {
//         // console.error('Failed to start DOS attack:', error);
//         // io.emit('Dos-coap', JSON.stringify({
//         //     Information: `Failed to start: ${error.message}`,
//         // }));
//     }
// };

exports.sendarp = (directory, type = 'start', interf, url, urll) => {
    const { io } = Constants; // Ensure 'Constants' is properly defined elsewhere
    const { exec, spawn } = require('child_process');

    console.log(`Server ${type}`);

    if (type === 'stop') {
        // Stop arpspoof process
        exec("pkill -f arpspoof", (error, stdout, stderr) => {
            if (error) {
                console.error('Error stopping DOS attack:', error);
                // io.emit('Dos-stop', JSON.stringify({
                //     Information: `Error stopping attack: ${error.message}`
                // }));
                return;
            }
            // io.emit('Dos-stop', JSON.stringify({
            //     Information: 'DOS attack stopped successfully'
            // }));
        });
        return;
    }

    try {
        // Use spawn to execute the DoS attack script
        const command = `echo ${process.env.ROOT_PASSWORD} | sudo -S arpspoof -i ${interf} -t ${url} ${urll}`;
        const D = spawn(command, {
            cwd: `${directory}/aiocoap/`,
            shell: true,
            stdio: ['inherit', 'pipe', 'pipe'] // Capture both stdout and stderr
        });

        // Handle standard output
        D.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`DOS attack stdout: ${output}`);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: output
            // }));
        });

        // Handle error output
        D.stderr.on('data', (data) => {
            const error = data.toString().trim();
            console.error(`DOS attack stderr: ${error}`);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: error
            // }));
        });

        // Handle process exit
        D.on('exit', (code, signal) => {
            // console.log(`DOS attack process exited with code ${code} and signal ${signal}`);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: `Process exited with code ${code} and signal ${signal}`
            // }));
        });

        // Handle process errors
        D.on('error', (error) => {
            // console.error('DOS attack process error:', error);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: `Process error: ${error.message}`
            // }));
        });

        // Send confirmation that the process started
        // io.emit('Dos-coap', JSON.stringify({
        //     Information: 'DOS attack process started'
        // }));

    } catch (error) {
        // console.error('Failed to start DOS attack:', error);
        // io.emit('Dos-coap', JSON.stringify({
        //     Information: `Failed to start: ${error.message}`
        // }));
    }
};




































// const { spawn, exec } = require('child_process');
// cor // latest latest correc

// s















// exports.coaDos = (directory, type = 'start',url) => {
//     const { io } = Constants;
//     console.log(`Server ${type}`);

//     if (type === 'stop') {
//         try {
//             exec("pkill -f 'coap_dos_attack.py'", (error, stdout, stderr) => {
//                 if (error) {
//                     console.error('Error stopping DOS attack:', error);
//                     io.emit('Dos-stop', JSON.stringify({
//                         Information: `Error stopping attack: ${error.message}`
//                     }));
//                     return;
//                 }
//                 io.emit('Dos-stop', JSON.stringify({
//                     Information: 'DOS attack stopped successfully'
//                 }));
//             });
//         } catch (error) {
//             console.error('Exception while stopping DOS attack:', error);
//             io.emit('Dos-stop', JSON.stringify({
//                 Information: `Exception: ${error.message}`
//             }));
//         }
//         return;
//     }

//     try {
//         // Use spawn directly without gnome-terminal to capture output
//         const Dos = spawn('python3', ['coap_dos_attack.py'],${url}, {
//             cwd: `${directory}/aiocoap/`,
//             shell: true,
//             stdio: ['inherit', 'pipe', 'pipe'] // Configure stdio to capture both stdout and stderr
//         });

//         // Handle standard output

// 		//console.log(`DOS attack stdout: ${output}`);
//         // Dos.stdout.on('data', (data) => {
//         //     const output = data.toString().trim();
            
//         //     io.emit('Dos-coap', JSON.stringify({
//         //         Information: output,
//         //         // type: 'stdout'
//         //     }));
//         // });

//         // Handle error output
//         Dos.stderr.on('data', (data) => {
//             const error = data.toString().trim();
//             // console.error(`DOS attack stderr: ${error}`);
//             io.emit('Dos-coap', JSON.stringify({
//                 Information: error,
//             }));
//         });

//         // Handle process exit
//         Dos.on('exit', (code, signal) => {
//             // console.log(`DOS attack process exited with code ${code} and signal ${signal}`);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: `Process exited with code ${code}`,
//             //     type: 'exit'
//             // }));
//         });

//         // Handle process errors
//         Dos.on('error', (error) => {
//             // console.error('DOS attack process error:', error);
//             // io.emit('Dos-coap', JSON.stringify({
//             //     Information: `Process error: ${error.message}`,
//             //     type: 'error'
//             // }));
//         });

//         // Optional: Send confirmation that process started
//         // io.emit('Dos-coap', JSON.stringify({
//         //     Information: 'DOS attack process started',
//         //     type: 'start'
//         // }));

//     } catch (error) {
//         console.error('Failed to start DOS attack:', error);
//         // io.emit('Dos-coap', JSON.stringify({
//         //     Information: `Failed to start: ${error.message}`,
//         //     type: 'error'
//         // }));
//     }
// };





exports.coaDos = (directory, type = 'start', url) => {
    const { io } = Constants;
    const { exec, spawn } = require('child_process');

    console.log(`Server ${type}`);

    if (type === 'stop') {
        try {
            exec("pkill -f 'coap_dos_attack.py'", (error, stdout, stderr) => {
                if (error) {
                    console.error('Error stopping DOS attack:', error);
                    io.emit('Dos-stop', JSON.stringify({
                        Information: `Error stopping attack: ${error.message}`
                    }));
                    return;
                }
                io.emit('Dos-stop', JSON.stringify({
                    Information: 'DOS attack stopped successfully'
                }));
            });
        } catch (error) {
            console.error('Exception while stopping DOS attack:', error);
            io.emit('Dos-stop', JSON.stringify({
                Information: `Exception: ${error.message}`
            }));
        }
        return;
    }

    try {
        // Use spawn to execute the DoS attack script
        const Dos = spawn('python3', ['coap_dos_attack.py', url], {
            cwd: `${directory}/aiocoap/`,
            shell: true,
            stdio: ['inherit', 'pipe', 'pipe'] // Capture both stdout and stderr
        });

        // Handle standard output
        Dos.stdout.on('data', (data) => {
            // const output = data.toString().trim();
            // console.log(`DOS attack stdout: ${output}`);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: output,
            // }));
        });

        // Handle error output
        Dos.stderr.on('data', (data) => {
            const error = data.toString().trim();
            // console.error(`DOS attack stderr: ${error}`);
            io.emit('Dos-coap', JSON.stringify({
                Information: error,
            }));
        });

        // Handle process exit
        Dos.on('exit', (code, signal) => {
            // console.log(`DOS attack process exited with code ${code} and signal ${signal}`);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: `Process exited with code ${code} and signal ${signal}`,
            // }));
        });

        // Handle process errors
        Dos.on('error', (error) => {
            // console.error('DOS attack process error:', error);
            // io.emit('Dos-coap', JSON.stringify({
            //     Information: `Process error: ${error.message}`,
            // }));
        });

        // Optional: Send confirmation that the process started
        // io.emit('Dos-coap', JSON.stringify({
        //     Information: 'DOS attack process started',
        // }));

    } catch (error) {
        // console.error('Failed to start DOS attack:', error);
        // io.emit('Dos-coap', JSON.stringify({
        //     Information: `Failed to start: ${error.message}`,
        // }));
    }
};






















































// const { spawn, execSync, spawnSync, exec } = require('child_process');
// const Constants = require('../utils/constants');

// class CoAPTestingService {
//     constructor(directory) {
//         this.directory = directory;
//         this.serverProcess = null;
//         this.io = Constants.io;
//     }

//     // Server management
//     startServer() {
//         try {
//             this.serverProcess = spawn('./server.py', {
//                 cwd: `${this.directory}/aiocoap/`,
//                 shell: true,
//             });

//             this.serverProcess.stderr.on('data', (data) => {
//                 const dataStr = data.toString();
//                 if (dataStr.includes('ready to receive')) {
//                     this.io.emit('coap-server-started');
//                     Constants.serverRunning = true;
//                     return;
//                 }
//                 console.error(`Server error: ${dataStr}`);
//             });

//             this.serverProcess.on('error', (error) => {
//                 console.error('Failed to start server:', error);
//                 this.io.emit('coap-server-error', error.message);
//             });
//         } catch (error) {
//             console.error('Server start error:', error);
//             this.io.emit('coap-server-error', error.message);
//         }
//     }

//     stopServer() {
//         try {
//             if (this.serverProcess) {
//                 this.serverProcess.kill('SIGINT');
//                 this.io.emit('coap-server-stopped');
//                 Constants.serverRunning = false;
//             }
//         } catch (error) {
//             console.error('Server stop error:', error);
//             this.io.emit('coap-server-error', error.message);
//         }
//     }

//     // Client operations
//     sendRequest(url, type = 'get') {
//         try {
//             console.log(`Handling ${type} request to ${url}`);
//             const result = spawnSync(`./aiocoap-client ${url}`, {
//                 cwd: `${this.directory}/aiocoap/`,
//                 shell: true,
//                 timeout: 5000  // 5 second timeout
//             });

//             if (result.error) {
//                 throw new Error(`Client request failed: ${result.error}`);
//             }

//             return result.stdout.toString();
//         } catch (error) {
//             console.error('Client request error:', error);
//             this.io.emit('coap-client-error', error.message);
//             return null;
//         }
//     }

//     // Security testing methods
//     async performReplayTest(url) {
//         if (!url) {
//             throw new Error('URL is required for replay testing');
//         }

//         console.log(`Starting replay test for ${url}`);
        
//         try {
//             const replayProcess = spawn(`python3 coap_replay_attack.py`, [url], {
//                 cwd: `${this.directory}/aiocoap/`,
//                 shell: true
//             });

//             replayProcess.stderr.on('data', (data) => {
//                 const info = data.toString();
//                 console.error('Replay test output:', info);
//                 this.io.emit('send-Replay', JSON.stringify({ Information: info }));
//             });

//             replayProcess.on('error', (error) => {
//                 console.error('Replay test error:', error);
//                 this.io.emit('replay-error', error.message);
//             });

//             return replayProcess;
//         } catch (error) {
//             console.error('Failed to start replay test:', error);
//             this.io.emit('replay-error', error.message);
//             return null;
//         }
//     }

//     // Load testing capabilities
//     startLoadTest() {
//         try {
//             const loadTestProcess = spawn('gnome-terminal', [
//                 '--',
//                 'bash',
//                 '-c',
//                 'python3 coap_dos_attack.py; exec bash'
//             ], {
//                 cwd: `${this.directory}/aiocoap/`,
//                 shell: true
//             });

//             loadTestProcess.stderr.on('data', (data) => {
//                 const info = data.toString();
//                 console.error('Load test output:', info);
//                 this.io.emit('Dos-coap', JSON.stringify({ Information: info }));
//             });

//             return loadTestProcess;
//         } catch (error) {
//             console.error('Failed to start load test:', error);
//             this.io.emit('load-test-error', error.message);
//             return null;
//         }
//     }

//     stopLoadTest() {
//         try {
//             execSync("pkill -f 'coap_dos_attack.py'");
//             this.io.emit('load-test-stopped');
//         } catch (error) {
//             console.error('Failed to stop load test:', error);
//             this.io.emit('load-test-error', error.message);
//         }
//     }
// }

// // Export factory function
// module.exports = function createCoAPTester(directory) {
//     return new CoAPTestingService(directory);
// };














































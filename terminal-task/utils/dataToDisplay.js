const { getBestServiceSeverityMatch } = require('./severityData');
let port_443 = 0;
let mlos = "";


const HOSTName = (data) => {

	console.log("This is my data " + data);
	const result = {
		title: 'HOST Name',
		value: '',
		severity: 'info',
	};
	result.value = data;

	if (data.includes("Not Found")) {


		result.severity = 'none';
	}
	// else {


	// 	result.value = data;


	// }

	return result;
};








const ttlml = (data) => {
	const result = {
		title: 'Operating System',
		value: '',
		severity: 'Low',
	};

	// Extract clean version from data - handle array-like strings and extract version numbers
	let cleanVersion = '';
	if (data) {
		const dataStr = String(data);
		// Extract version number (e.g., "22" from ":22" or "[':22', 'Linux']")
		const versionMatch = dataStr.match(/:?(\d+(?:\.\d+)*)/);
		if (versionMatch) {
			cleanVersion = versionMatch[1];
		}
	}

	mlos = cleanVersion ? ' ' + cleanVersion : '';
	result.value = mlos;

	return result;
};



const OS = (data) => {
	const result = {
		title: 'Operating System',
		value: '',
		severity: 'Low',
	};

	// Fallback: if mlos (global version) is not set, try to extract it from current data
	if (!mlos && data) {
		const dataStr = String(data);
		const versionMatch = dataStr.match(/:?(\d+(?:\.\d+)*)/);
		if (versionMatch) {
			mlos = ' ' + versionMatch[1];
		}
	}

	if (data.includes('Windows')) {
		result.value = 'Windows' + mlos;
		result.severity = "Medium";
	} else if (data.includes('Linux')) {
		result.value = 'Linux' + mlos;
		//result.value = data.title;
		result.severity = "Medium";

	} else if (data.includes('Mac')) {
		result.value = 'Mac' + mlos;
		result.severity = "Medium";

	} else {
		result.value = 'Unknown' + mlos;
	}

	return result;
};































// = (data) => {
// 	const result = {
// 		title: '',
// 		value: '',
// 		severity: '',
// 	};

// 	if (data.includes('Windows')) {
// 		result.value = 'Windows';
// 		result.severity = "Medium";
// 	} else if (data.includes('Linux')) {


// 		const r = data.replace("'Linux',", '');
// 		result.value = '/Linux'+ r;

// 		//result.value = data.title;
// 		result.severity = "Medium";


// 	} else if (data.includes('Mac')) {
// 		result.value = 'Mac';
// 		result.severity = "Medium";

// 	} else {
// 		result.value = 'Unknown';
// 	}

// 	return result;
// };






const MAC = (data) => {
	const result = {
		title: 'Mac',
		value: '',
		severity: 'info',
	};

	const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
	const match = macAddressRegex.exec(data);

	if (match) {
		result.value = match[0];
	} else {
		result.value = 'Unknown';
		result.severity = 'unknown';
	}

	return result;
};

const SSHDowngrade = (data) => {
	const result = {
		title: 'SSH Downgrade',
		value: '',
		severity: 'none',
	};

	if (data.toLowerCase().includes('not')) {
		result.value = data;
	} else {
		result.value = data;
		result.severity = 'high';
	}

	return result;
};

const Ports = (data) => {
	const result = data
		.split('\n')
		.slice(1)
		.map((portData) => {
			const [port, status, service, ...version] = portData
				.split(' ')
				.filter((el) => el !== '');
			if (port === '443/tcp') {
				// if(port === '8/tcp') {

				port_443 = 1;




				return {
					title: `${port}/${service}`,
					value: version.join(' '),
					severity: 'low',


				};
			}
			if (port === "PORT") {

				return {
					title: `${port}/${service}`,
					value: version.join(' '),
					severity: 'Severity',


				};
			}





			return {
				title: `${port}/${service}`,
				value: version.join(' '),
				severity: getBestServiceSeverityMatch(service) || '',


			};

		});





	// 		// Check if the result array is empty
	if (result.length === 0) {
		return {
			title: 'PORTS',
			value: 'No Ports Found',
			severity: 'Info',
		};
	}






	return result;
};





// const Sslversion = (data) => {
// 	// console.log("hii");
// 	// console.log(port_443);

// 	const result = {
// 		title: 'SSL Version',
// 		value: data,
// 		severity: 'high',
// 	};
// 	var regex = /\bsuccessful\b/;
// 	var isSuccessful = regex.test(data);

// 	if (isSuccessful) {
// 		result.severity = 'low';
// 	}



// 	return result;
// };


const SslTlsCertificate = (data) => {
	// console.log("hii");
	// console.log(port_443);

	const result = {
		title: 'SSL/TLSCertificate',
		value: data,
		severity: 'high',
	};
	var regex = /\bsuccessful\b/;
	var isSuccessful = regex.test(data);

	if (isSuccessful) {
		result.severity = 'low';
	}

	//const issuerRegex = /issuer=([\w\s]+),.*notBefore=(.*GMT).*notAfter=(.*GMT)/s;

	//const matches = issuerRegex.exec(data);
	//console.log(matches);


	// const notBeforeRegex = /notBefore=([A-Za-z]{3}\s+\d{0,9}\s+\d{2}:\d{2}:\d{2}\s+\d{4})/;
	// const notAfterRegex = /notAfter=([A-Za-z]{3}\s+\d{0,9}\s+\d{2}:\d{2}:\d{2}\s+\d{4})/;
	// let issuer = "";


	// function extractInfo(text, regex) {
	// 	const match = text.match(regex);
	// 	return match ? (match[1]) : null;
	// }

	// if (port_443) {
	// 	const notBefore = extractInfo(data, notBeforeRegex);
	// 	const notAfter = extractInfo(data, notAfterRegex);
	// 	if (notAfter) {
	// 		for (let i = 0; i < data.length; i++) {	
	// 			if (data[i] != '\n') issuer += data[i];
	// 			else break;
	// 		}

	// 		const now = new Date();
	// 		const notBeforeDate = new Date(notBefore);
	// 		const notAfterDate = new Date(notAfter);
	// 		let validity = 'Unknown validity';
	// 		if (now < notBeforeDate) {
	// 			result.severity = 'warn';
	// 		} else if (now > notAfterDate) {
	// 			result.severity = 'high';
	// 		} else {
	// 			result.severity = 'none';
	// 		}

	// 		result.value = `${issuer} AND Issue-Date: ${notBefore} AND Expiry-Date: ${notAfter}` ;

	// 	} else {
	// 		result.value = "Unable to fetch!" ;
	// 	}


	// } else {
	// 	result.value = "Port 443 is not open.";
	// 	result.severity = 'warn';
	// }



	// Extracting information

	// if (!matches) {
	// 	result.value = `Unable to extract issuer, notBefore and notAfter.`;
	// 	result.severity = 'warn';
	// 	return result;
	// }

	// console.log("notBefore:", notBefore);
	// console.log("notAfter:", notAfter);
	// console.log("issuer:", issuer);



	return result;
};

const Firewall = (data) => {
	const result = {
		title: 'Firewall',
		value: '',
		severity: 'Low',
	};

	if (data.toLowerCase().includes('not')) {
		result.value = data;
		result.severity = 'High';
	} else {
		result.value = data;
	}

	return result;
};

const Synch = (data) => {
	const result = {
		title: 'Synch Check',
		value: '',
		severity: 'none',
	};

	if (data.toLowerCase().includes('no')) {
		result.value = data;
		result.severity = 'low';
	} else {
		result.value = data;
	}

	return result;
};

const ArpPoisoning = (data) => {
	const result = {
		title: 'ARP Poisoning',
		value: '',
		severity: 'High',
	};

	if (data.toLowerCase().includes('no')) {
		result.value = data;
		result.severity = 'low';
	} else {
		result.value = data;
	}

	return result;
};

const DeviceFingerprinting = (data) => {
	const result = {
		title: 'Device Fingerprinting',
		value: '',
		severity: 'Low',
	};

	const deviceType = data.match(/Device type\s:\s*(.*)/);
	const vendorName = data.match(/Name of the vendor\s:\s*(.*)/);

	result.value = `Device Type: ${deviceType ? deviceType[1] : 'None'
		} \nVendor Name: ${vendorName ? vendorName[1] : 'None'}`;

	if (result.value != '') {
		result.severity = "Medium";
	}

	return result;
};



const Cipher = (data) => {
	const result = {
		title: 'Cipher',
		value: data,
		severity: 'Low',
	};

	// // // Assuming the data contains information about ciphers and their status
	// const cipherInfo = data.match(/Cipher\s*:\s*(.*)/);

	// if (cipherInfo) {
	//     result.value = cipherInfo[1];
	//     // Adjust severity based on some criteria (e.g., weak cipher)
	//     if (result.value.toLowerCase().includes('weak')) {
	//         result.severity = 'High';
	//     }
	// }

	return result;
};




const SshAttempt = (data) => {
	const result = {
		title: 'SSH Attempt',
		value: '',
		severity: 'none',
	};

	if (data.includes('No')) {
		result.value = data;
	} else {
		result.value = 'Successful SSH Attempt' + data;
		result.severity = 'high';
	}

	return result;
};

const CVEFormatter = (data) => {
	const cvesVisited = new Set();
	const result = data.split('\n').map((cve) => {
		try {
			JSON.parse(cve);
		} catch (err) {
			return;
		}

		const { id: title, severity, service: value } = JSON.parse(cve);

		if (!title || !value || !severity) return;
		if (cvesVisited.has(title)) return;

		cvesVisited.add(title);
		return {
			title,
			value,
			severity: severity.toLowerCase(),
		};
	});

	return result;
};

const DataToDisplay = (title, content) => {
	// if(title ==='TTL_ML'){
	if (title === 'OS ') {
		return ttlml(content.text);
	}
	if (!content.text) {
		return {
			title: title,
			value: 'No data',
			severity: 'unknown',
		};
	}


	content = content.text;

	console.log(title);
	console.log(content);

	if (title === 'Host Name') {
		return HOSTName(content);
	}


	if (title === 'OS') {
		return OS(content);
	}

	// if(title ==='TTL_ML'){
	// 	return ttlml(content);
	// }

	if (title === 'MAC') {
		return MAC(content);
	}

	if (title === 'SSH Downgrade') {
		return SSHDowngrade(content);
	}

	if (title === 'PORTS') {
		return Ports(content);
	}

	if (title === 'SSL/TLS Certificate') {
		return SslTlsCertificate(content);
	}

	if (title === 'SSL Version') {
		// Format "TLSv1.2" to "TLS 1.2" for better CVE matching
		let val = content;
		let severity = 'info';

		if (val) {
			// Extract version number like 1.2 from TLSv1.2 or TLS 1.2
			const match = val.match(/v?(\d+\.\d+)/);
			if (match) {
				const versionStr = match[1];
				const version = parseFloat(versionStr);

				if (version <= 1.1) {
					severity = 'High';
				} else if (version === 1.2) {
					severity = 'Medium';
				} else if (version > 1.2) {
					severity = 'Low';
				}
			}

			if (val.includes('v')) {
				val = val.replace(/([a-zA-Z]+)v([\d.]+)/, '$1 $2');
			}
		}

		return {
			title: 'SSL Version',
			value: val,
			severity: severity
		};
	}

	if (title === 'Firewall') {
		return Firewall(content);
	}

	if (title === 'SYNC Check') {
		return Synch(content);
	}

	if (title === 'ARP Poisoning') {
		return ArpPoisoning(content);
	}

	if (title === 'Device Fingerprinting') {
		return DeviceFingerprinting(content);
	}

	if (title === 'SSH ATTEMPT') {
		return SshAttempt(content);
	}

	if (title === 'CVE') {
		return CVEFormatter(content);
	}


	if (title === 'Cipher') {
		return Cipher(content);
	}

	// 	if(title === 'Cipher'){
	// 		return Cipher(content);
	// 	}

	// 	if(title === 'Cipher'){
	// 	return Cipher(content);
	// }

	if (title === 'UDP') {
		return UDP(content);
	}

	return {
		title: title,
		value: content,
		severity: 'unknown',
	};
};

const UDP = (data) => {
	const lines = data.split('\n');
	const result = [];

	// Skip header row if present (PORT STATE SERVICE)
	// Filter out empty lines
	lines.forEach(line => {
		if (!line.trim() || line.includes('PORT') && line.includes('STATE')) return;

		const parts = line.split(/\s+/).filter(p => p);
		if (parts.length >= 3) {
			const port = parts[0];
			const state = parts[1];
			// Join the rest as service name in case it has spaces
			const service = parts.slice(2).join(' ');

			let severity = 'info';
			if (state.includes('OPEN')) {
				severity = 'High'; // Open UDP ports can be risky
			} else if (state.includes('FILTERED')) {
				severity = 'Medium';
			} else {
				severity = 'Low';
			}

			result.push({
				title: `Port ${port} (${service})`,
				value: state,
				severity: severity
			});
		}
	});

	if (result.length === 0) {
		return {
			title: 'UDP Services',
			value: 'No open/filtered UDP ports found.',
			severity: 'Low'
		};
	}

	return result;
};

const port443 = (data) => {


	return port_443;
};

const mlguess = (data) => {


	return mlos;
};


module.exports = {
	DataToDisplay,
	port_443,
	port443,
	mlguess,
};


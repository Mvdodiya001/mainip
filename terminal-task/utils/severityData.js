const serviceSeverities = {
	http: 'high',
	https: 'high',
	ssh: 'high',
	smtp: 'high',
	dns: 'medium',
	ftp: 'high',
	telnet: 'high',
	smb: 'high',
	mssql: 'high',
	mysql: 'high',
	postgresql: 'high',
	mongodb: 'high',
	redis: 'high',
	memcached: 'medium',
	http_proxy: 'medium',
	socks_proxy: 'medium',
	proxy: 'medium',
	rdp: 'high',
	pptp: 'medium',
	imap: 'high',
	pop3: 'high',
	ldap: 'high',
	ntp: 'medium',
	netbios: 'medium',
	snmp: 'high',
	sip: 'medium',
	oracle: 'high',
	db2: 'high',
	nfs: 'medium',
	rpc: 'medium',
	citrix: 'high',
};

exports.getBestServiceSeverityMatch = (service) => {
	if(!service) {
		return 'none';
	}

	service = service.toLowerCase().split('?').join('').split('/');
	console.log("Service: ", service);
	for(let i = 0; i < service.length  ; i++) {
		if(serviceSeverities[service[i]]) {
			return serviceSeverities[service[i]];
		}
	}

	return 'unknown';
}

const specificVulnarabilities = [
	{
		Vulnerability: 'Default password',
		Impact: 'Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Non-secure remote access',
		Impact: 'Account/Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Weak Password',
		Impact: 'Account/Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'SSH port open',
		Impact: 'Attempt to compromise',
		Risk: 'Low',
	},
	{
		Vulnerability: 'Responding to scanners',
		Impact: 'Attempt to compromise and Denial of Service',
		Risk: 'Medium',
	},
	{
		Vulnerability: 'Plain Text Communication',
		Impact: 'Revealing the Data',
		Risk: 'High',
	},
	{
		Vulnerability: 'Using publicly known vulnerable software',
		Impact: 'Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Disclosing OS finger print',
		Impact: 'Attempt to break the system with known vulnerability and focused',
		Risk: 'Medium',
	},
	{
		Vulnerability: 'Downgrading Attack',
		Impact: 'Revealing the Data',
		Risk: 'High',
	},
	{
		Vulnerability: 'Disclosing MAC Id',
		Impact: 'ARP spoofing',
		Risk: 'High',
	},
	{
		Vulnerability: 'Time Synchronization information Leak',
		Impact: 'Confidence to attacker to make successful attempt',
		Risk: 'Medium',
	},
	{
		Vulnerability: 'Remote machine Vulnerability',
		Impact: 'Revealing the Data',
		Risk: 'High',
	},
	{
		Vulnerability: 'Firewall Availability disclosure',
		Impact: 'Accordingly attack will be framed',
		Risk: 'Medium',
	},
	{
		Vulnerability: 'Plain Storage of Credentials',
		Impact: 'Account/Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Brute force attack',
		Impact: 'Attempt to compromise the account',
		Risk: 'Low',
	},
	{
		Vulnerability: 'Reverse Engineering',
		Impact: 'Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Malicious code/component injection',
		Impact: 'Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Hardcoded Password',
		Impact: 'Accidently get disclosed to third party and lead to account/device compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Weak/Guessable Password',
		Impact: 'Device Compromise',
		Risk: 'High',
	},
	{
		Vulnerability: 'Outdated Firmware',
		Impact: 'Publicly known vulnerability will be exploited',
		Risk: 'High',
	},
	{
		Vulnerability: 'FTP',
		Impact: 'Revealing the data. Able to analyze the traffic',
		Risk: 'High',
	},
	{
		Vulnerability: 'Telnet',
		Impact: 'Revealing the data. Able to analyze the traffic',
		Risk: 'High',
	},
];

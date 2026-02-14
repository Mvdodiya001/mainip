/**
 * CVE Matching Keywords Configuration
 * 
 * Whitelist of relevant keywords for IoT/Network Security CVE matching
 * These are service names, protocols, and software relevant to the IoT Security Lab project
 * 
 * Organized by category for easy maintenance and extension
 */

const CVE_KEYWORDS = {
	operatingSystems: [
		'linux', 'windows', 'mac', 'ubuntu', 'debian', 'centos', 'redhat', 'fedora',
		'alpine', 'busybox', 'android', 'ios', 'firmware',
	],

	networkProtocols: [
		'ssh', 'ftp', 'sftp', 'http', 'smtp', 'dns', 'dhcp', 'ntp',
		'snmp', 'telnet', 'tls', 'tlsv1', 'tlsv1.0', 'tlsv1.1', 'tlsv1.2', 'tlsv1.3',
		'vpn', 'openvpn',
		'wpa', 'wpa2', 'wpa3', '802.11', 'ipsec', 'l2tp', 'pptp', 'ipp', 'rpcbind'
	],

	webServers: [
		'apache', 'nginx', 'tomcat', 'jboss', 'jetty', 'nodejs', 'node.js',
		'express', 'flask', 'django', 'rails', 'aspnet', 'iis',
	],

	databases: [
		'mysql', 'postgres', 'postgresql', 'mongodb', 'redis', 'sqlite',
		'mariadb', 'oracle', 'mssql', 'cassandra',
	],

	iotProtocols: [
		'mqtt', 'coap', 'zigbee', 'zwave', 'bluetooth', 'ble', 'lora',
		'modbus', 'profinet', 'ethernet', 'can', 'serial',
	],

	securityAuthentication: [
		'kerberos', 'ldap', 'oauth', 'saml', 'radius', 'tacacs',
		'crl', 'ocsp',
	],

	tools: [
		'openssh', 'openssl', 'curl', 'wget', 'git', 'docker', 'kubernetes',
		'jenkins', 'gitea', 'grafana', 'elasticsearch', 'kibana', 'logstash',
		'influxdb', 'prometheus', 'mosquitto', 'rabbitmq', 'kafka',
	],

	commonSoftware: [
		'vsftpd', 'proftpd', 'binutils', 'bash', 'zsh', 'perl', 'python',
		'ruby', 'php', 'java', 'golang', 'rust', 'c', 'cpp', 'javascript',
	],
};

const PORT_HEURISTICS = {
	21: 'ftp',
	22: 'ssh',
	23: 'telnet',
	25: 'smtp',
	53: 'dns',
	67: 'dhcp',
	68: 'dhcp',
	69: 'tftp',
	80: 'http',
	111: 'rpcbind',
	123: 'ntp',
	143: 'imap',
	161: 'snmp',
	162: 'snmp',
	389: 'ldap',
	443: 'https',
	445: 'smb',
	502: 'modbus',
	554: 'rtsp',
	636: 'ldap',
	993: 'imap',
	1883: 'mqtt',
	2020: 'tcpwrapped',
	3306: 'mysql',
	5432: 'postgresql',
	6379: 'redis',
	8080: 'http',
	8443: 'https',
	27017: 'mongodb',
};

/**
 * Flatten all keywords into a single Set for fast lookup
 * @returns {Set<string>} All relevant keywords
 */
const getAllKeywords = () => {
	const allKeywords = new Set();
	Object.values(CVE_KEYWORDS).forEach((categoryKeywords) => {
		categoryKeywords.forEach((keyword) => {
			allKeywords.add(keyword.toLowerCase());
		});
	});
	return allKeywords;
};

/**
 * Check if a keyword is relevant for CVE matching
 * @param {string} keyword - The keyword to check
 * @returns {boolean} True if keyword is in the whitelist
 */
const isRelevantKeyword = (keyword) => {
	if (!keyword || typeof keyword !== 'string') return false;
	return getAllKeywords().has(keyword.toLowerCase());
};

/**
 * Get keywords by category
 * @param {string} category - The category name (e.g., 'operatingSystems')
 * @returns {string[]} Array of keywords in that category
 */
const getKeywordsByCategory = (category) => {
	return CVE_KEYWORDS[category] || [];
};

/**
 * Extract version string from text
 * Looks for patterns like "5.10", "2.20", "10.15", etc.
 * @param {string} text - The text to search for version
 * @returns {string|null} The extracted version or null
 */
const extractVersion = (text) => {
	if (!text || typeof text !== 'string') return null;

	// Match version patterns like: 5.10, 10.15.7, 2.20, v1.2, 8.9p1, 1:2.4.52, 2-4, etc.
	// Also handles "version 5.10", "v5.10", "5.10.1", etc.
	const versionPatterns = [
		/v?(?:version\s+)?(\d+(?:\.\d+)+[a-z0-9\-\.]*)/i,  // 5.10, 5.10.1-beta, 8.9p1
		/(?:^|\s)(?:v|version\s?)?(\d+(?:\.\d+)*)(?:$|\s)/i, // Catch simple numbers also: "22", "v22"
		/(?:^|\s)(\d+\-\d+)(?:$|\s)/, // "2-4" pattern
	];

	for (const pattern of versionPatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			// Clean up trailing dots or hyphens if any
			return match[1].replace(/[\.\-]+$/, '');
		}
	}

	return null;
};

module.exports = {
	CVE_KEYWORDS,
	getAllKeywords,
	isRelevantKeyword,
	getKeywordsByCategory,
	extractVersion,
	PORT_HEURISTICS,
};

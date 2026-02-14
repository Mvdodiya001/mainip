
const { extractServicesFromReport } = require('./cveService');

const report = [
    {
        title: 'PORTS',
        dataToDisplay: [
            { title: '22/tcp/ssh', value: 'OpenSSH 8.9p1 Ubuntu 3ubuntu0.10' },
            { title: '80/tcp/http', value: 'Apache httpd 2.4.52' }
        ]
    },
    {
        title: 'Other Info',
        value: 'This system uses TCP, UDP, and SSL for secure communication. It has a Certificate.'
    }
];

const services = extractServicesFromReport(report);
console.log('Extracted Services:', JSON.stringify(services, null, 2));

const specificKeywords = ['tcp', 'udp', 'ssl', 'certificate', 'http', 'ssh'];
const foundKeywords = services.map(s => s.service.toLowerCase());

let fail = false;

// Check for noisy keywords
['tcp', 'udp', 'ssl', 'certificate'].forEach(kw => {
    if (foundKeywords.includes(kw)) {
        console.error(`FAIL: Noisy keyword "${kw}" was found.`);
        fail = true;
    }
});

// Check that PORTS logic is disabled (ssh and http should NOT be extracted from PORTS title/value via port heuristics)
// However, 'ssh' and 'http' might still be in the whitelist. 
// The user said: "words extracted from Ports field should not be there example TCP, SSL, RTSP, HTTPS".
// But they also said: "ignore "d. Port heuristics"".
// If I disabled the "D. Port Heuristics" block, then 'ssh' from '22/tcp/ssh' should ONLY be found if 'ssh' is in the whitelist AND it appears in non-port fields OR if the generic scanner picks it up from the value.
// But we SKIP the PORTS entry entirely now: `if (entry.title === 'PORTS') return;`

if (foundKeywords.includes('apache')) {
    console.log('INFO: "apache" found (likely from generic scanner if enabled, or not). Wait, I disabled PORTS section entirely.');
}

// Since I added `if (entry.title === 'PORTS') return;`, NOTHING from the PORTS section should be extracted.
if (foundKeywords.includes('openssh')) {
    console.error('FAIL: "openssh" extracted from PORTS section, but PORTS section should be ignored.');
    fail = true;
}

if (!fail) {
    console.log('PASS: No noisy keywords found, and PORTS section ignored.');
    process.exit(0);
} else {
    process.exit(1);
}

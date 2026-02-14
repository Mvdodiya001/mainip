
const { extractServicesFromReport } = require('./cveService');
const { getAllKeywords } = require('../utils/cveKeywords');

// 1. Check if tp-link is removed from keywords
const keywords = getAllKeywords();
if (keywords.has('tp-link')) {
    console.log('FAIL: tp-link is still in the whitelist.');
} else {
    console.log('PASS: tp-link is REMOVED from whitelist.');
}

const report = [
    {
        title: 'PORTS',
        dataToDisplay: [
            {
                title: '80/tcp/http',
                value: 'TP-LINK TD-W8968 http admin'
            },
            {
                title: '1900/tcp/upnp',
                value: 'Portable SDK for UPnP devices 1.6.19 (Linux 2.6.36; UPnP 1.0)'
            }
        ]
    }
];

const services = extractServicesFromReport(report);
console.log('Extracted Services:', JSON.stringify(services, null, 2));

// Checks
const tplink = services.filter(s => s.service.toLowerCase().includes('tp-link'));
const exactTplink = services.find(s => s.service === 'tp-link');
const fullTplink = services.find(s => s.service === 'TP-LINK TD-W8968');

if (exactTplink) console.log('FAIL: Custom "tp-link" standalone still found.');
else console.log('PASS: Standalone "tp-link" gone.');

if (fullTplink) console.log('PASS: "TP-LINK TD-W8968" found.');
else console.log('FAIL: "TP-LINK TD-W8968" NOT found.');

const linux = services.find(s => s.service.toLowerCase() === 'linux');
if (linux && linux.version === '2.6.36') console.log('PASS: Linux 2.6.36 found.');
else console.log(`FAIL: Linux version is ${linux ? linux.version : 'not found'}`);

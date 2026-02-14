
const { extractServicesFromReport } = require('./cveService');

const report = [
    {
        title: 'Firmware Analysis',
        value: '[-] No firmware or software version found.',
        dataToDisplay: '[-] No firmware or software version found.'
    }
];

const services = extractServicesFromReport(report);
console.log('Extracted Services:', JSON.stringify(services, null, 2));

const hasFirmware = services.some(s => s.service.toLowerCase() === 'firmware');

if (hasFirmware) {
    console.error('FAIL: "firmware" keyword was incorrectly extracted.');
    process.exit(1);
} else {
    console.log('PASS: "firmware" keyword was NOT extracted.');
    process.exit(0);
}


const { extractServicesFromReport } = require('./cveService');

const report = [
    {
        title: 'PORTS',
        dataToDisplay: [
            {
                title: '80/tcp/http',
                value: 'TP-LINK TD-W8968 http admin'
            },
            {
                title: '443/tcp/ssl/http',
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
console.log('TP-LINK entries:', tplink.length);
tplink.forEach(s => console.log(` - ${s.service} : ${s.version}`));

const linux = services.filter(s => s.service.toLowerCase() === 'linux');
console.log('Linux entries:', linux.length);
linux.forEach(s => console.log(` - ${s.service} : ${s.version}`));

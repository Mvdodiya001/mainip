const path = require('path');

module.exports = class Constants {
    static directory = path.join(__dirname, '../final_test');
    static PORT = 8000;
    static scans = {};
    static pidTimestamp = {};
    static getMemoryUsage = {};
    static ipAddressUnderDeviceScan = {};
    static io = undefined;
    static serverRunning = false;
}
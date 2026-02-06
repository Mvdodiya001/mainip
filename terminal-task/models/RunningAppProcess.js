const { spawn } = require('child_process');
const DATA_HEADER = [
    'PID',
    'USER',
    'PR',
    'NI',
    'VIRT',
    'RES',
    'SHR',
    'S',
    'CPU_USAGE',
    'MEM_USAGE',
    'TIME',
    'PACKAGE_NAME',
];

class Package {
	constructor(data) {
		// this.package_data_dict = Object.fromEntries(
		// 	DATA_HEADER.map((header, index) => [header, data[index]])
		// );
		// this.package_name = this.package_data_dict['PACKAGE_NAME'];
		// this.cpu_usage = parseFloat(this.package_data_dict['CPU']);
		// this.mem_usage = parseFloat(this.package_data_dict['MEM']);
        // this.time = this.package_data_dict['TIME'];
		// this.pid = this.package_data_dict['PID'];
        Object.assign(this, Object.fromEntries(
            DATA_HEADER.map((header, index) => [header.toLowerCase(), data[index]])
        ));
	}
}

class ProcessManager{
    constructor(packagesToManage, displayError = false){
        this.displayError = displayError;
        this.THIRD_PARTY_APPS_LIST_COSTOME = packagesToManage;
        this.packages = {}
    }
}

module.exports = {
    ProcessManager,
    Package,
};
const { networkInterfaces } = require('os');
const Constants = require('../utils/constants');

exports.getCurrentNetworkInterface = async (req, res) => {
	try {
		const currentInterface = Constants.currentInterface;
		const status = currentInterface ? 'success' : 'error';
		return res.status(200).json({
			currentInterface,
			status,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
} 

exports.getNetworkInterfaces = async (req, res) => {
	try {
		const interfaces = networkInterfaces();
		const ipv4Interfaces = [];
		Object.entries(interfaces).forEach(([key, value]) => {
			const interfacesArray = [];
			value.forEach((el) => {
				interfacesArray.push({
					...el,
					interface: key,
				});
			});

			ipv4Interfaces.push(
				...interfacesArray.filter((el) => {
					return el.family === 'IPv4';
				})
			);
		});
		return res.status(200).json(ipv4Interfaces);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.setNetworkInterface = async (req, res) => {
	try {
		const { interfaceName } = req.body;
        Constants.currentInterface = interfaceName;
        return res.status(200).json({ message: `Interface set to ${interfaceName}` });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

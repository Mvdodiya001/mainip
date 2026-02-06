const path = require('path');
const Constants = require('../utils/constants');
const cameraObserver = require('../utils/cameraObserver');

const cameraUsage = (type, mode, time) => {
	const { io } = Constants;
	let cameraObserverInterval = null;

	console.log('cameraUsage', type, mode, time);

	if (type === 'stop') {
		if(cameraObserverInterval) {
			clearInterval(cameraObserverInterval);
		}
		return;
	}

	console.log('ending');

	switch (mode) {
		case 0:
			cameraObserver.to_get_service_data();
			break;

		case 1:
			cameraObserver.to_get_service_history();
			break;

		case 2:
			cameraObserver.to_get_apps_service_history();

		default:
			break;
	}

	const currtime = Date.now();
	cameraObserverInterval = setInterval(() => {
		try {
			cameraObserver.look();
			io.emit('cameraObserverData', cameraObserver.get_data());
		} catch (e) {
			// console.log('Error)))): ', e.message);
			io.emit('error', JSON.stringify({
				errorType: 'cameraObserverError',
				message: e.message,
				code: 500,
			}));
			clearInterval(cameraObserverInterval);
		}

		if (Date.now() - currtime >= time * 1000) {
			if (cameraObserverInterval) {
				clearInterval(cameraObserverInterval);
			}
			io.emit('cameraObserverEnd');
			console.log('cameraObserverEnd');
		}
	}, 1000);
};

module.exports = cameraUsage;

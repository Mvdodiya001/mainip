const path = require('path');
const Constants = require('../utils/constants');
const audioObserver = require('../utils/audioObserver');

const audioUsage = (type, mode, time) => {
	const { io } = Constants;
	let audioObserverInterval = null;

	console.log('audioUsage', type, mode, time);

	if (type === 'stop') {
		console.log('ending audioObserver');
		if(audioObserverInterval) {
			clearInterval(audioObserverInterval);
		}
		return;
	}


	switch (mode) {
		case 0:
			audioObserver.to_get_service_data();
			break;

		case 1:
			audioObserver.to_get_service_history();
			break;

		case 2:
			audioObserver.to_get_apps_service_history();

		default:
			break;
	}

	const currtime = Date.now();
	audioObserverInterval = setInterval(() => {
		try {
			audioObserver.look();
			io.emit('audioObserverData', audioObserver.get_data());
		} catch (e) {
			// console.log('Error)))): ', e.message);
			io.emit('error', JSON.stringify({
				errorType: 'audioObserverError',
				message: e.message,
				code: 500,
			}));
			clearInterval(audioObserverInterval);
		}

		if (Date.now() - currtime >= time * 1000) {
			if (audioObserverInterval) {
				clearInterval(audioObserverInterval);
			}
			io.emit('audioObserverEnd');
			console.log('audioObserverEnd');
		}
	}, 1000);
};

module.exports = audioUsage;

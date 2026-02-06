import React, { useLayoutEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';

const CameraObservationContext = createContext();

const CameraObservationProvider = ({ children }) => {
	// const modeDatails = {
	// 	0: 'Camera Data',
	// 	1: 'Camera History',
	// 	2: 'App Service History',
	// };
	const { addError } = useErrorHandler();

	const [cameraObservation, setCameraObservation] = useState({});
	const [cameraObservationMode, setCameraObservationMode] = useState(
		+localStorage.getItem('cameraObservationMode') || 0
	);
	const [isRunning, setIsRunning] = useState(false);
	const [time, setTime] = useState(1);

	useLayoutEffect(() => {
		handleStopCameraObservation();
		setCameraObservation({});
		localStorage.setItem('cameraObservationMode', cameraObservationMode);
	}, [cameraObservationMode, isRunning]);

	const getFormattedTime = (time) => {
		if (time === '-1') return new Date().getTime();

		const startTime = time
			.split(' ')[0]
			.split('-')
			.concat(time.split(' ')[1].split(':'));
		const year = new Date().getFullYear();

		return new Date(
			year,
			startTime[0] - 1,
			startTime[1],
			startTime[2],
			startTime[3],
			startTime[4]
		).getTime();
	};

	const handleCameraObservationData = (data) => {
		const cameraHistory = {};
		try {
			Object.entries(data).forEach(([key, value]) => {
				if (cameraObservationMode === 0) {
					const startTime = getFormattedTime(value.start);
					const endTime = getFormattedTime(value.end);
					cameraHistory[key] = {
						start: new Date(startTime).toLocaleString(),
						end: new Date(endTime).toLocaleString(),
						duration: endTime - startTime,
					};
				} else if (cameraObservationMode === 1) {
					const startTime = getFormattedTime(value[1]);
					const endTime = getFormattedTime(value[2]);
					cameraHistory[key] = [
						value[0],
						new Date(startTime).toLocaleString(),
						new Date(endTime).toLocaleString(),
						endTime - startTime,
					];
				} else if (cameraObservationMode === 2) {
					cameraHistory[key] = value.map((el) => {
						const startTime = getFormattedTime(el.start);
						const endTime = getFormattedTime(el.end);

						return {
							start: new Date(startTime).toLocaleString(),
							end: new Date(endTime).toLocaleString(),
							duration: endTime - startTime,
						};
					});
				}
			});
		} catch (err) {
			addError({
				errorType: `cameraObserverError Mode${cameraObservationMode}`,
				message: err.toString(),
				code: 500,
			});
		}

		setCameraObservation(cameraHistory);
	};

	socket.on('cameraObserverData', handleCameraObservationData);

	socket.on('cameraObserverEnd', () => {
		setIsRunning(false);
	});

	const handleStartCameraObservation = () => {
		// setIsRunning(true);
		socket.emit('cameraObserver', 'start', cameraObservationMode, 100);
	};

	const handleStopCameraObservation = () => {
		socket.emit('cameraObserver', 'stop');
		setIsRunning(false);
	};

	return (
		<CameraObservationContext.Provider
			value={{
				cameraObservation,
				handleStartCameraObservation,
				handleStopCameraObservation,
				cameraObservationMode,
				setCameraObservationMode,
				isRunning,
				time,
				setTime,
			}}
		>
			{children}
		</CameraObservationContext.Provider>
	);
};

const useCameraObservation = () => {
	const context = useContext(CameraObservationContext);
	if (context === undefined) {
		throw new Error(
			'useCameraObservation must be used within a CameraObservationProvider'
		);
	}
	return context;
};

export { CameraObservationProvider, useCameraObservation };

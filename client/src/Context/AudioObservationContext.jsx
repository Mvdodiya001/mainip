import React, { useLayoutEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';

const AudioObservationContext = createContext();

const AudioObservationProvider = ({ children }) => {
	const { addError } = useErrorHandler();

	const [AudioObservation, setAudioObservation] = useState({});
	const [AudioObservationMode, setAudioObservationMode] = useState(
		+localStorage.getItem('audioObservationMode') || 0
	);
	const [isRunning, setIsRunning] = useState(false);
	const [time, setTime] = useState(1);

	useLayoutEffect(() => {
		handleStopAudioObservation();
		setAudioObservation({});
		localStorage.setItem('audioObservationMode', AudioObservationMode);
	}, [AudioObservationMode, isRunning]);

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

	const handleAudioObservationData = (data) => {
		const AudioHistory = {};
		try {
			Object.entries(data).forEach(([key, value]) => {
				if (AudioObservationMode === 0) {
					const startTime = getFormattedTime(value.start);
					const endTime = getFormattedTime(value.end);
					AudioHistory[key] = {
						start: new Date(startTime).toLocaleString(),
						end: new Date(endTime).toLocaleString(),
						duration: endTime - startTime,
						current: value.end === '-1',
					};
				} else if (AudioObservationMode === 1) {
					const startTime = getFormattedTime(value[1]);
					const endTime = getFormattedTime(value[2]);
					AudioHistory[key] = [
						value[0],
						new Date(startTime).toLocaleString(),
						new Date(endTime).toLocaleString(),
						endTime - startTime,
						value.end === '-1',
					];
				} else if (AudioObservationMode === 2) {
					AudioHistory[key] = value.map((el) => {
						const startTime = getFormattedTime(el.start);
						const endTime = getFormattedTime(el.end);

						return {
							start: new Date(startTime).toLocaleString(),
							end: new Date(endTime).toLocaleString(),
							duration: endTime - startTime,
							current: el.end === '-1',
						};
					});
				}
			});
		} catch (err) {
			addError({
				errorType: `AudioObserverError Mode${AudioObservationMode}`,
				message: err.toString(),
				code: 500,
			});
		}

		setAudioObservation(AudioHistory);
	};

	socket.on('audioObserverData', handleAudioObservationData);

	socket.on('audioObserverEnd', () => {
		setIsRunning(false);
	});

	const handleStartAudioObservation = () => {
		// setIsRunning(true);
		socket.emit('audioObserver', 'start', AudioObservationMode, 100);
	};

	const handleStopAudioObservation = () => {
		socket.emit('audioObserver', 'stop');
		setIsRunning(false);
	};

	return (
		<AudioObservationContext.Provider
			value={{
				AudioObservation,
				handleStartAudioObservation,
				handleStopAudioObservation,
				AudioObservationMode,
				setAudioObservationMode,
				isRunning,
				time,
				setTime,
			}}
		>
			{children}
		</AudioObservationContext.Provider>
	);
};

const useAudioObservation = () => {
	const context = useContext(AudioObservationContext);
	if (context === undefined) {
		throw new Error(
			'useAudioObservation must be used within a AudioObservationProvider'
		);
	}
	return context;
};

export { AudioObservationProvider, useAudioObservation };

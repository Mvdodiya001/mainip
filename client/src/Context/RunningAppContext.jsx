import React, { createContext, useContext, useState } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';

const RunningAppContext = createContext();

const RunningAppUtility = ({ children }) => {
	const { addError } = useErrorHandler();
	const [thirdPartyApps, setThirdPartyApps] = useState([]);
	const [displayList, setDisplayList] = useState(false);
	const [displayRunningAppStatus, setDisplayRunningAppStatus] =
		useState(false);
	const [selectedAppList, setSelectedAppList] = useState([]);
	const [runningApps, setRunningApps] = useState({});
	const [showRunningApps, setShowRunningApps] = useState(false);
	const [gettingStatus, setGettingStatus] = useState(false);
	const [gettingThirdPartyApps, setGettingThirdPartyApps] = useState(false);

	const getThirdPartyApps = async () => {
		setDisplayRunningAppStatus(false);
		setDisplayList(false);
		setGettingThirdPartyApps(true);
		setThirdPartyApps([]);
		if (gettingStatus) {
			handleStopRunningAppStatus();
		}

		const response = await fetch(
			'http://localhost:8000/get-third-party-apps'
		);
		if (!response.ok) {
			console.log('Error in fetching third party apps');
			return;
		}

		const data = await response.json();

		if (!data.data || data.data.length === 0 || data.data[0].length === 0) {
			addError({
				message:
					'No third party apps found. Check connection to your phone.',
				errorType: 'Connection Error',
				code: 500,
			});
			setThirdPartyApps([]);
			return;
		}

		setThirdPartyApps(data.data);
		setGettingThirdPartyApps(false);
		setDisplayList(true);
	};

	const handleStartRunningAppStatus = async () => {
		if (gettingStatus) {
			addError({
				message: 'Running app status already started',
				errorType: 'Running App Status Error',
				code: 500,
			});
			return;
		}
		const response = await fetch(
			'http://localhost:8000/get-running-apps-status',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ selectedApps: selectedAppList }),
			}
		);
		if (!response.ok) {
			console.log('Error in starting running app status');
			return;
		}

		console.log('Running app status started');
		console.log(await response.json());

		setGettingStatus(true);
		setDisplayList(false);
		setDisplayRunningAppStatus(true);
	};

	const handleStopRunningAppStatus = async () => {
		setDisplayRunningAppStatus(false);
		setGettingStatus(false);
		setRunningApps({});

		const response = await fetch(
			'http://localhost:8000/stop-running-apps-status'
		);
		if (!response.ok) {
			console.log('Error in stopping running app status');
			return;
		}

		console.log('Running app status stopped');
	};

	socket.on('running-apps-status', async (data) => {
		try {
			data = JSON.parse(data);
		} catch (err) {
			addError({
				message: 'Error in parsing running apps status',
				errorType: 'Parsing Error',
				code: 500,
			});
			return;
		}

		// const response = await fetch(
		// 	'http://localhost:8000/check-running-apps',
		// 	{
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 		},
		// 		body: JSON.stringify({
		// 			listOfPid: Object.entries(data)
		// 				.map(([_, value]) => {
		// 					return Object.keys(value).map((key) => {
		// 						return key;
		// 					});
		// 				})
		// 				.flat(1),
		// 		}),
		// 	}
		// );
		// if (!response.ok) {
		// 	console.log('Error in getting running apps');
		// 	return;
		// }

		// const runningApps = await response.json();
		// console.log(runningApps);

		setRunningApps(data);
	});

	return (
		<RunningAppContext.Provider
			value={{
				getThirdPartyApps,
				thirdPartyApps,
				setThirdPartyApps,
				displayList,
				setDisplayList,
				displayRunningAppStatus,
				setDisplayRunningAppStatus,
				selectedAppList,
				setSelectedAppList,
				handleStartRunningAppStatus,
				runningApps,
				setRunningApps,
				handleStopRunningAppStatus,
				showRunningApps,
				setShowRunningApps,
				gettingThirdPartyApps,
			}}
		>
			{children}
		</RunningAppContext.Provider>
	);
};

const useRunningAppContext = () => {
	return useContext(RunningAppContext);
};

export { RunningAppUtility, useRunningAppContext };

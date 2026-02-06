import React, { createContext, useContext, useState } from 'react';
import { socket } from './Socket';

const DeauthContext = createContext();

const useDeauth = () => {
	const context = useContext(DeauthContext);
	if (!context) {
		throw new Error('useDeauth must be used within a DeauthProvider');
	}
	return context;
};

const DeauthProvider = ({ children }) => {
	const [deauthData, setDeauthData] = useState({});
	const [ipAddress, setIpAddress] = useState('');
	const [ipStatus, setIpStatus] = useState(true);

	const isDeauthRunning = async (ipAddress) => {
		const response = await fetch(
			`http://localhost:8000/api/deauth/check`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ipAddress }),
			}
		);
		if (!response.ok) {
			window.alert(
				'Error checking deauth status. Please try again later.'
			);
			return { isRunning: false, ipAddress: '' };
		}
		const data = await response.json();
		return {
			isRunning: data.isRunning,
			ipAddress: data.ipAddress,
		};
	};

	const performDeauth = (deauthData) => {
		setDeauthData({});
		socket.emit('start_deauth', deauthData);
	};

	socket.on('deauth_1', (data) => {
		data = JSON.parse(data);
		console.log("deauth_1", data);
		handleDeauthData(data);
	});

	// Function for deauth_2
	socket.on('deauth_2', (data) => {
		data = JSON.parse(data);
		console.log("deauth_2", data);
		handleDeauthData(data);
	});

	// Function for deauth_3
	socket.on('deauth_3', (data) => {
		data = JSON.parse(data);
		console.log("deauth_3", data);
		handleDeauthData(data);
	});

	// Function for deauth_4
	socket.on('deauth_4', (data) => {
		data = JSON.parse(data);
		console.log("deauth_4", data);
		handleDeauthData(data);
	});

	// Function for deauth_5
	socket.on('deauth_5', (data) => {
		data = JSON.parse(data);
		console.log("deauth_5", data);
		handleDeauthData(data);
	});

	// Function for deauth_6
	socket.on('deauth_6', (data) => {
		data = JSON.parse(data);
		console.log("deauth_6", data);
		handleDeauthData(data);
	});

	// Function for deauth_7
	socket.on('deauth_7', (data) => {
		data = JSON.parse(data);
		console.log("deauth_7", data);
		handleDeauthData(data);
	});

	// Function for deauth_8
	socket.on('deauth_8', (data) => {
		data = JSON.parse(data);
		console.log("deauth_8", data);
		handleDeauthData(data);
	});

	// Function for deauth_9
	socket.on('deauth_9', (data) => {
		data = JSON.parse(data);
		console.log("deauth_9", data);
		handleDeauthData(data);
	});

	// Function for deauth_10
	socket.on('deauth_10', (data) => {
		data = JSON.parse(data);
		console.log("deauth_10", data);
		handleDeauthData(data);
	});

	// Function for deauth_11
	socket.on('deauth_11', (data) => {
		data = JSON.parse(data);
		console.log("deauth_11", data);
		handleDeauthData(data);
	});

	// Function for deauth_12
	socket.on('deauth_12', (data) => {
		data = JSON.parse(data);
		console.log("deauth_12", data);
		handleDeauthData(data);
	});

	// Function for deauth_13
	socket.on('deauth_13', (data) => {
		data = JSON.parse(data);
		console.log("deauth_13", data);
		handleDeauthData(data);
	});

	// Function for deauth_14
	socket.on('deauth_14', (data) => {
		data = JSON.parse(data);
		console.log("deauth_14", data);
		handleDeauthData(data);
	});

	// Function for deauth_15
	socket.on('deauth_15', (data) => {
		data = JSON.parse(data);
		console.log("deauth_15", data);
		handleDeauthData(data);
	});

	// Function for deauth_16
	socket.on('deauth_16', (data) => {
		data = JSON.parse(data);
		console.log("deauth_16", data);
		handleDeauthData(data);
	});

	// Function for deauth_17
	socket.on('deauth_17', (data) => {
		data = JSON.parse(data);
		console.log("deauth_17", data);
		handleDeauthData(data);
	});

	// Function for deauth_18
	socket.on('deauth_18', (data) => {
		data = JSON.parse(data);
		console.log("deauth_18", data);
		handleDeauthData(data);
	});

	// Function for deauth_19
	socket.on('deauth_19', (data) => {
		data = JSON.parse(data);
		console.log("deauth_19", data);
		handleDeauthData(data);
	});

	// Function for deauth_20
	socket.on('deauth_20', (data) => {
		data = JSON.parse(data);
		console.log("deauth_20", data);
		handleDeauthData(data);
	});

	// Function for deauth_21
	socket.on('deauth_21', (data) => {
		data = JSON.parse(data);
		console.log("deauth_21", data);
		handleDeauthData(data);
	});

	// Function for deauth_22
	socket.on('deauth_22', (data) => {
		data = JSON.parse(data);
		console.log("deauth_22", data);
		handleDeauthData(data);
	});

	socket.on('deauth_j_1', (data) => {
		console.log("deauth_j_1", data);
		handleDeauthData(data);
	});

	// Function for deauth_2
	socket.on('deauth_j_2', (data) => {
		console.log("deauth_j_2", data);
		handleDeauthData(data);
	});

	// Function for deauth_3
	socket.on('deauth_j_3', (data) => {
		console.log("deauth_j_3", data);
		handleDeauthData(data);
	});

	// Function for deauth_4
	socket.on('deauth_j_4', (data) => {
		console.log("deauth_j_4", data);
		handleDeauthData(data);
	});

	// Function for deauth_5
	socket.on('deauth_j_5', (data) => {
		console.log("deauth_j_5", data);
		handleDeauthData(data);
	});

	// Function for deauth_6
	socket.on('deauth_j_6', (data) => {
		console.log("deauth_j_6", data);
		handleDeauthData(data);
	});

	// Function for deauth_7
	socket.on('deauth_j_7', (data) => {
		console.log("deauth_j_7", data);
		handleDeauthData(data);
	});

	// Function for deauth_8
	socket.on('deauth_j_8', (data) => {
		console.log("deauth_j_8", data);
		handleDeauthData(data);
	});

	// Function for deauth_9
	socket.on('deauth_j_9', (data) => {
		console.log("deauth_j_9", data);
		handleDeauthData(data);
	});

	// Function for deauth_10
	socket.on('deauth_j_10', (data) => {
		console.log("deauth_j_10", data);
		handleDeauthData(data);
	});

	// Function for deauth_11
	socket.on('deauth_j_11', (data) => {
		console.log("deauth_j_11", data);
		handleDeauthData(data);
	});

	socket.on('deauth_j_12', (data) => {
		console.log("deauth_j_12", data);
		handleDeauthData(data);
	});

	const handleDeauthData = (data) => {
		if (data.ipAddress !== '') {
			setIpAddress(data.ipAddress);
		}
		setIpStatus(data.ipStatus);
		// if (!data.status) {
		// 	return window.alert(data.message);
		// }
		setDeauthData((prevData) => {
			if (!data) {
				return prevData;
			}

			if (!prevData[data.checkId]) {
				return {
					...prevData,
					[data.checkId]: {
						isRunning: data.isRunning,
						success: data.success,
						message: data.message,
					},
				};
			}

			return {
				...prevData,
				[data.checkId]: {
					isRunning: data.isRunning,
					success: data.success,
					message: prevData[data.checkId].message + data.message,
				},
			};
		});
	}

	return (
		<DeauthContext.Provider
			value={{
				ipAddress,
				setIpAddress,
				deauthData,
				ipStatus,
				isDeauthRunning,
				performDeauth,
			}}
		>
			{children}
		</DeauthContext.Provider>
	);
};

export { DeauthProvider, useDeauth };

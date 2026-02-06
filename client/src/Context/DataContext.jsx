import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { socket } from './Socket';

const DataContext = createContext();

const DataProvider = ({ children }) => {
	const [IPsData, setIPsData] = useState([]);
	const [MemoryUsageData, setMemoryUsageData] = useState([
		{
			heading: 'Start',
			value: 'Start process by entering packet name in input and click start.',
			detail: 'No process started',
		},
	]);
	const [packetNameEditable, setPacketNameEditable] = useState(true);
	const [networkInterfaces, setNetworkInterfaces] = useState([]);
	const [editNetworkInterfaces, setEditNetworkInterfaces] = useState(true);
	const [currentNetworkInterface, setCurrentNetworkInterface] = useState('');

	const addIPsData = (data) => {
		const scanData = [];

		Object.entries(data).forEach((el) => {
			scanData.unshift(el[1].formatted);
		});

		setIPsData(scanData);
	};

	socket.on('IPScanData', function (data) {
		data = JSON.parse(data);
		addIPsData(data);
	});

	socket.on('memory-usage-data', function (data) {
		try {
			setMemoryUsageData(JSON.parse(data));
		} catch (err) {
			setPacketNameEditable(true);
			setMemoryUsageData([
				{
					heading: 'Stopped',
					value: data,
					detail: data,
				},
			]);
		}
	});

	const handleScanRequest = (ipAddress) => {
		console.log('ashutosh: ', ipAddress);
		socket.emit('scanIPAddress', ipAddress);
	};
	const handleMultipleIPScan = (listOfIPs) => {
		console.log('List of IPs: ', listOfIPs);
		socket.emit('scanMultipleIP', listOfIPs);
	};

	const handleScanRequestAll = (type) => {
		if (type === 'single') {
			socket.emit('scanRouterSingleThreaded');
		} else if (type === 'multiple') {
			socket.emit('scanRouterMultiThreaded');
		}
	};

	const handleStartMemoryUsage = (packetName) => {
		setPacketNameEditable(false);
		socket.emit('memory-usage', packetName);
	};

	const handleStopMemoryUsage = () => {
		fetch('http://localhost:8000/stop-memory-usage')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				if (!data.ok) {
					setMemoryUsageData([
						{
							heading: 'Error',
							value: data.message,
							detail: data.message,
						},
					]);
					return;
				}

				setPacketNameEditable(true);
				setMemoryUsageData([
					{
						heading: 'Stopped',
						value: data.message,
						detail: data.message,
					},
				]);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const handleUpdateReportData = (id, key) => {
		fetch('http://localhost:8000/cve-report-data', {
			method: 'PATCH',
			body: JSON.stringify({
				id: id,
				key: key,
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				if (!data.ok) {
					console.error(data);
					return;
				}

				// setIPsData(data);
				fetchAndSetIPsData();
				console.log('Update successful');
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const fetchAndSetIPsData = () => {
		fetch('http://localhost:8000/ipscandata')
			.then((response) => {
				if (!response.ok) {
					console.log('Error in response');
					return new Error('Error in response');
				}
				return response.json();
			})
			.then((data) => {
				const scanData = [];
				console.log(data);
				Object.entries(data).forEach((el) => {
					scanData.unshift(el[1].formatted);
				});

				setIPsData(scanData);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	useEffect(() => {
		fetchAndSetIPsData();
		handleGetCurrentNetworkInterface();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDeleteScanData = async (scanId) => {
		console.log(scanId);
		const response = await fetch(
			`http://localhost:8000/ipscandata/${scanId}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				params: {
					id: scanId,
				},
			}
		);

		if (!response.ok) {
			console.log(response);
			console.error('Error in response');
			return;
		}
	};

	const handleGetCurrentNetworkInterface = async () => {
		const response = await fetch('http://localhost:8000/get-current-network-interface');

		if (!response.ok) {
			console.error('Error in response');
			return;
		}

		await handleGetNetworkInterfaces();

		const data = await response.json();
		console.log(data);
		if (data.status === 'success') {
			setCurrentNetworkInterface(data.currentInterface);
			setEditNetworkInterfaces(false);
		} else {
			setEditNetworkInterfaces(true);
			console.error('Error in getting current network interface');
		}
	}

	const handleGetNetworkInterfaces = async () => {
		const response = await fetch(
			'http://localhost:8000/get-network-interfaces'
		);

		if (!response.ok) {
			console.error('Error in response');
			return;
		}

		setCurrentNetworkInterface('');
		const data = await response.json();
		setNetworkInterfaces(() => {
			return data.map((el) => {
				return el.interface;
			});
		});
	};

	const handleSetNetworkInterface = async (selectedInterface) => {
		const response = await fetch(
			'http://localhost:8000/set-network-interface',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					interfaceName: selectedInterface,
				}),
			}
		);

		if (!response.ok) {
			console.error('Error in response');
			return;
		}

		const data = await response.json();
		console.log(data);
	};

	return (
		<DataContext.Provider
			value={{
				IPsData,
				MemoryUsageData,
				packetNameEditable,
				handleScanRequest,
				handleMultipleIPScan,
				handleScanRequestAll,
				handleDeleteScanData,
				handleStartMemoryUsage,
				handleStopMemoryUsage,
				handleUpdateReportData,
				networkInterfaces,
				setNetworkInterfaces,
				editNetworkInterfaces,
				setEditNetworkInterfaces,
				currentNetworkInterface,
				setCurrentNetworkInterface,
				handleGetNetworkInterfaces,
				handleSetNetworkInterface,
			}}
		>
			{children}
		</DataContext.Provider>
	);
};

const useData = () => {
	const context = useContext(DataContext);
	return context;
};

export { useData, DataProvider };

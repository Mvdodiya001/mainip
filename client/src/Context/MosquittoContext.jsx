import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';
import API from '../Utils/axios.config.js';
const MosquittoContext = createContext();

const MosquittoProvider = ({ children }) => {
	const { addError } = useErrorHandler();
	const [mosquittoType, setMosquittoType] = useState('Subscribe');
	const [mosquittoSubs, setMosquittoSubs] = useState({});

	const [mosquittoPubs, setMosquittoPubs] = useState({});
    const [mosquittoDos, setMosquittoDos] = useState({});
	const [mosquittoSubsData, setMosquittoSubsData] = useState({});
	const [mosquittoPubsData, setMosquittoPubsData] = useState({});
    const [mosquittoDosData, setMosquittoDosData] = useState({});
	const [activeSubTabIndex, setActiveSubTabIndex] = useState(null);
	const [activePubTabIndex, setActivePubTabIndex] = useState(null);
    const [activeDosTabIndex, setActiveDosTabIndex] = useState(null);

	const handleSubTabIndex = (index) => {
		setActiveSubTabIndex(index);
	};
	const handlePubTabIndex = (index) => {
		setActivePubTabIndex(index);
	};
	const handleDosTabIndex = (index) => {
		setActiveDosTabIndex(index);
	}
	const handleSubscribe = async () => {
		if (
			Object.values(mosquittoSubs).some(
				(value) => value === undefined || value.trim() === ''
			) ||
			Object.values(mosquittoSubs).length === 0
		) {
			addError({
				errorType: 'mosquittoSubsError',
				message: 'Please fill in all the fields',
				code: 500,
			});
			return;
		}
		try {
			await API.post('/api/mosquitto/subscribe', {
				subs: mosquittoSubs,
			}).then((res) => {
				if (res.status === 200) {
					const { username, ip, topic } = mosquittoSubs;
					handleSubTabIndex(`${username}-${ip}-${topic}`);
				}
			});
		} catch (error) {
			addError({
				errorType: 'mosquittoSubsError',
				message: 'Subscribe Error',
				code: 500,
			});
		}
	};
	const handlePublish = async () => {
		if (
			Object.values(mosquittoPubs).some(
				(value) => value === undefined || value.trim() === ''
			) ||
			Object.values(mosquittoPubs).length === 0
		) {
			addError({
				errorType: 'mosquittoPubsError',
				message: 'Please fill in all the fields',
				code: 500,
			});
			return;
		}

		try {
			await API.post('/api/mosquitto/publish', {
				pubs: mosquittoPubs,
			}).then((res) => {
				if (res.status === 200) {
					const { username, ip, topic } = mosquittoPubs;
					handlePubTabIndex(`${username}-${ip}-${topic}`);
				}
			});
		} catch (error) {
			addError({
				errorType: 'mosquittoPubsError',
				message: 'Publish Error',
				code: 500,
			});
		}
	};
	const handleDosAttack = async () => {
		if (
			Object.values(mosquittoDos).some(
				(value) => value === undefined || value.trim() === ''
			) ||
			Object.values(mosquittoDos).length === 0
		) {
			addError({
				errorType: 'mosquittoDosError',
				message: 'Please fill in all the fields',
				code: 500,
			});
			return;
		}

		try {
			await API.post('/api/mosquitto/Dos', {
				dos: mosquittoDos,
			}).then((res) => {
				if (res.status === 200) {
					const { username, ip, topic } = mosquittoDos;
					handleDosTabIndex(`${username}-${ip}-${topic}`);
				}
			});
		} catch (error) {
			addError({
				errorType: 'mosquittoDosError',
				message: 'Server Error',
				code: 500,
			});
		}
	}
	const handleUnsubscribe = (subs) => {
		socket.emit('killSubs', subs);
	};
	const handleStopPublish = (pubs) => {
		socket.emit('killPubs', pubs);
	};
	const handleStopDosAttack = (dos) => {
		socket.emit('killDos', dos);
	}
	const handleSubsOutputConsole = (newData) => {
		setMosquittoSubsData({ ...newData });
	};
	const handlePubsOutputConsole = (newData) => {
		setMosquittoPubsData({ ...newData });
	};
	const handleDosOutputConsole = (newData) => {
		setMosquittoDosData({ ...newData });
	}
	useEffect(() => {
		socket.on('mosquittoSubsData', (data) => {
			const { msg, id } = data;
			const [username, ip, topic] = id.split('-');
			setMosquittoSubsData((prevData) => {
				const newData = {
					...prevData,
					[id]: {
						username: username,
						topic: topic,
						ipAddress: ip,
						dashboardData: prevData[id]
							? prevData[id].dashboardData + '\n' + msg
							: msg,
					},
				};
				return newData;
			});
		});
		socket.on('mosquittoPubsData', (data) => {
			const { msg, id } = data;
			const [username, ip, topic] = id.split('-');
			setMosquittoPubsData((prevData) => {
				const newData = {
					...prevData,
					[id]: {
						username: username,
						topic: topic,
						ipAddress: ip,
						dashboardData: prevData[id]
							? prevData[id].dashboardData + '\n' + msg
							: msg,
					},
				};
				return newData;
			});
		});
		socket.on('mosquittoDosData', (data) => {
			const { msg, id } = data;
			const [username, ip, topic] = id.split('-');
			setMosquittoDosData((prevData) => {
				const newData = {
					...prevData,
					[id]: {
						username: username,
						topic: topic,
						ipAddress: ip,
						dashboardData: prevData[id]
							? prevData[id].dashboardData + '\n' + msg
							: msg,
					},
				};
				return newData;
			});
		});

		return () => {
			socket.off('mosquittoSubsData'); // Remove the event listener
			socket.off('mosquittoPubsData'); // Remove the event listener
			socket.off('mosquittoDosData'); // Remove the event listener
		};
	}, []);

	return (
		<MosquittoContext.Provider
			value={{
				mosquittoType,
				setMosquittoType,
				mosquittoSubs,
				setMosquittoSubs,
				mosquittoPubs,
				setMosquittoPubs,
				mosquittoDos,
				setMosquittoDos,
				mosquittoSubsData,
				mosquittoPubsData,
				mosquittoDosData,
				handleSubscribe,
				handlePublish,
				handleDosAttack,
				handleUnsubscribe,
				handleStopPublish,
				handleStopDosAttack,
				handleSubsOutputConsole,
				handlePubsOutputConsole,
				handleDosOutputConsole,
				activeSubTabIndex,
				activePubTabIndex,
				activeDosTabIndex,
				handlePubTabIndex,
				handleSubTabIndex,
				handleDosTabIndex,
			}}
		>
			{children}
		</MosquittoContext.Provider>
	);
};

const useMosquitto = () => {
	return useContext(MosquittoContext);
};

export { MosquittoProvider, useMosquitto };

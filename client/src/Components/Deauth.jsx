import React, { useEffect } from 'react';
import { useDeauth } from '../Context/DeauthContext';

import '../Styles/deauth.css';
import DeauthProgressCheckList from './DeauthProgressCheckList';

export default function Deauth(props) {
	const { ipAddress, deauthData, ipStatus } = useDeauth();

	const checkList = [
		['check_commands', 'Checking for required commands'],
		['check_existing_monitor_mode', 'Checking for existing monitor mode'],
		// ['restart_network_manager_1', 'Restarting network manager for cleanup'],
		['check_ip_status', 'Checking IP connectivity status'],
		['get_access_point_mac', 'Getting access point MAC address'],
		['get_device_mac', 'Getting device MAC address'],
		['start_monitor_mode', 'Starting monitor mode'],
		// ['get_access_point_channel', 'Fetching access point channel'],
		['start_deauth_attack', 'Starting deauthentication attack'],
		['stop_monitor_mode', 'Stopping monitor mode'],
		['restart_network_manager_2', 'Restarting network manager for cleanup'],
	];

	useEffect(() => {
		console.log(deauthData);
	}, [deauthData]);

	return (
		<div className='container-deauth'>
			<h1 className='deauth-heading'>Deauthentication Attack Output</h1>
			<div className='details'>
				{
					ipAddress ? (
						<div className='ip'>{JSON.stringify(ipAddress)}</div>
					): (
						<div className='ip'>IP Address</div>
					)
				}
				<span
					className={
						'status-tag ' + (ipStatus ? 'active' : 'inactive')
					}
				>
					{ipStatus ? 'Reachable' : 'Unreachable'}
				</span>
			</div>
			<div className='deauth-output'>
				{
					<DeauthProgressCheckList
						checkList={checkList}
						deauthData={deauthData}
					/>
				}
			</div>
		</div>
	);
}

import React from 'react';
import { Container } from 'react-bootstrap';
import { useRunningAppContext } from '../Context/RunningAppContext';
import ThirdPartyAppsList from './ThirdPartyAppsList';
import RunningAppsTable from './RunningAppsTable';

import './../Styles/runningAppStatus.css';

const RunningAppStatus = () => {
	const {
		displayList,
		getThirdPartyApps,
		handleStartRunningAppStatus,
		handleStopRunningAppStatus,
		displayRunningAppStatus,
		gettingThirdPartyApps,
	} = useRunningAppContext();

	const handleDisplayThirdPartyApps = () => {
		console.log('Displaying third party apps');
		getThirdPartyApps();
	};

	return (
		<div className='running-app-status'>
			<Container>
				<div
					className='report-container-heading'
					style={{ display: 'flex' }}
				>
					<div className='report-container-heading-text'>
						Third Party Apps
					</div>
					<div className='report-addr'>
						<div
							className='report-addr-inner'
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								flexDirection: 'row',
							}}
						>
							<div className='report-addr-left'></div>
							<div className='app-running-status-inputs'>
								<div className='app-running-status-buttons'>
									<button
										className='app-running-status-see-apps'
										onClick={handleDisplayThirdPartyApps}
									>
										Third Party Apps
									</button>
									<button
										className='app-running-status-start'
										onClick={handleStartRunningAppStatus}
									>
										Start Running Status
									</button>
									<button
										className='app-running-status-stop'
										onClick={handleStopRunningAppStatus}
									>
										Stop Running Status
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					className='report-container--table-div'
					style={{ background: '#FFFFFF' }}
				>
					{gettingThirdPartyApps && (
						<div className='running-apps-loader'>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
						</div>
					)}
					{displayList && <ThirdPartyAppsList />}
					{displayRunningAppStatus && <RunningAppsTable />}
				</div>
			</Container>
		</div>
	);
};

export default RunningAppStatus;

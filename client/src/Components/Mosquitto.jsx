import React from 'react';
import { Container } from 'react-bootstrap';

import { useMosquitto } from '../Context/MosquittoContext';
import MosquittoCard from './MosquittoCard';
import BruteForce from './BruteForce';
import Dos from './Dos';
import './../Styles/mosquitto.css';

export default function Mosquitto(props) {
	const {
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
		handleDosTabIndex

	} = useMosquitto();
	return (
		<div className='mosquitto-container'>
			<Container>
				<div
					className='report-container-heading'
					style={{ display: 'flex' }}
				>
					<div className='report-container-heading-text'>
						Mosquitto
					</div>
				</div>
				<div
					className='report-container--table-div'
					style={{ background: '#FFFFFF' }}
				>
					<div className='mosquitto-type-select-buttons'>
						<button
							type='button'
							className={
								'mosquitto-type-select-button ' +
								(mosquittoType === 'Subscribe' ? 'active' : '')
							}
							onClick={() => setMosquittoType('Subscribe')}
						>
							Subscribe
						</button>
						<button
							type='button'
							className={
								'mosquitto-type-select-button ' +
								(mosquittoType === 'Publish' ? 'active' : '')
							}
							onClick={() => setMosquittoType('Publish')}
						>
							Publish
						</button>
						<button
							type='button'
							className={
								'mosquitto-type-select-button ' +
								(mosquittoType === 'BruteForce' ? 'active' : '')
							}
							onClick={() => setMosquittoType('BruteForce')}
						>
							Brute Force
						</button>
						<button
							type='button'
							className={
								'mosquitto-type-select-button ' +
								(mosquittoType === 'DOS' ? 'active' : '')
							}
							onClick={() => setMosquittoType('DOS')}
						>
							DOS Attack
						</button>
					</div>
					{mosquittoType === 'Subscribe' && (
						<MosquittoCard
							dashboardData={mosquittoSubsData}
							setFormData={setMosquittoSubs}
							formData={mosquittoSubs}
							type='subs'
							handleClick={handleSubscribe}
							handleOutputConsole={handleSubsOutputConsole}
							handleTabClose={handleUnsubscribe}
							index={activeSubTabIndex}
							handleIndex={handleSubTabIndex}
						/>
					)}
					{mosquittoType === 'Publish' && (
						<MosquittoCard
							dashboardData={mosquittoPubsData}
							setFormData={setMosquittoPubs}
							formData={mosquittoPubs}
							type='pubs'
							handleClick={handlePublish}
							handleOutputConsole={handlePubsOutputConsole}
							handleTabClose={handleStopPublish}
							index={activePubTabIndex}
							handleIndex={handlePubTabIndex}
						/>
					)}
					{mosquittoType === 'BruteForce' && <BruteForce />}
					{mosquittoType === 'DOS' && <Dos
						dashboardData={mosquittoDosData}
						setFormData={setMosquittoDos}
						formData={mosquittoDos}
						type='dos'
						handleClick={handleDosAttack}
						handleOutputConsole={handleDosOutputConsole}
						handleTabClose={handleStopDosAttack}
						index={activeDosTabIndex}
						handleIndex={handleDosTabIndex}
					/>}
				</div>
			</Container>
		</div>
	);
}

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import MemoryUsageTable from './MemoryUsageTable';
import { useData } from '../Context/DataContext';

import './../Styles/memoryUsage.css';

export default function MemoryUsage() {
	const [packetName, setPacketName] = useState('PACKET-NAME');

	const {
		packetNameEditable,
		MemoryUsageData,
		handleStartMemoryUsage,
		handleStopMemoryUsage,
	} = useData();

	const handleStartMemoryUsageUtil = () => {
		handleStartMemoryUsage(packetName);
	};

	const handlePacketNameChange = (event) => {
		setPacketName(event.target.value);
	};

	return (
		<div className='memory-usage'>
			<Container>
				<div
					className='report-container-heading'
					style={{ display: 'flex' }}
				>
					<div className='report-container-heading-text'>
						Memory Usage
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
							<div className='report-addr-left'>
								<div
									className='ip'
									style={{
										display: 'block',
										maxWidth: '500px',
										overflow: 'hidden',
										whiteSpace: 'nowrap',
										textOverflow: 'ellipsis',
									}}
								>
									<span className='ip-text'>
										{MemoryUsageData.length > 1 ? MemoryUsageData[
											MemoryUsageData.length - 1
										]?.value : 'com.PACKET_NAME.iot'}
									</span>
								</div>
								<div className='addr'>
									<span className='addr-text'>
										PID: {MemoryUsageData ? MemoryUsageData[0].value : '12345'}
									</span>
								</div>
							</div>
							<div className='memory-usage-inputs'>
								<input
									type='text'
									className='memory-usage-packet-name-input'
									placeholder='Enter App Name'
									onChange={handlePacketNameChange}
									disabled={!packetNameEditable}
								/>
								<div className='memory-usage-buttons'>
									<button
										className='memory-usage-start'
										onClick={handleStartMemoryUsageUtil}
									>
										Start
									</button>
									<button
										className='memory-usage-stop'
										onClick={handleStopMemoryUsage}
									>
										Stop
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
					<MemoryUsageTable />
				</div>
			</Container>
		</div>
	);
}

import React, { useEffect, useState } from 'react';
import { useRunningAppContext } from '../Context/RunningAppContext';

const RunningAppsTable = () => {
	const { runningApps } = useRunningAppContext();
	const [aggregateData, setAggregateData] = useState({});
	const [collapsed, setCollapsed] = useState({});

	useEffect(() => {
		Object.entries(runningApps).forEach(([key, value]) => {
			let cpu = 0;
			let memory = 0;

			setCollapsed((prevState) => {
                return {
                    ...prevState,
					[key]: prevState[key] === undefined ? true : prevState[key],
                }
			});

			Object.entries(value).forEach(([pid, detail]) => {
				cpu += isNaN(Number(detail.cpu_usage)) ? 0 : Number(detail.cpu_usage);
				memory += isNaN(Number(detail.mem_usage)) ? 0 : Number(detail.mem_usage);
			});

			setAggregateData((prevState) => {
				return {
					...prevState,
					[key]: {
						cpu: cpu.toFixed(2),
						memory: memory.toFixed(2),
					},
				};
			});
		});

		// console.log(runningApps);
	}, [runningApps]);

	return (
		<table className='table'>
			<thead>
				<tr>
					<th scope='col'>App Name</th>
					<th scope='col' style={{opacity: '0%'}} >PID</th>
					<th scope='col' style={{textAlign: 'right'}}>%CPU</th>
					<th scope='col' style={{textAlign: 'right'}}>%Memory</th>
					<th scope='col' style={{opacity: '0%'}}>CPU Time</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(runningApps).map(([key, value]) => {
					return (
						<React.Fragment key={key}>
							<tr
								onClick={() => {
									setCollapsed((prevState) => {
										return {
											...prevState,
											[key]: !prevState[key],
										};
									});
								}}
								aria-controls='collapseContent'
								aria-expanded={collapsed[key]}
								style={{
									cursor: 'pointer',
                                    fontSize: '1.1rem',
									backgroundColor: '#f5f5f5',
                                    height: '30px',
								}}
							>
								<td>
								<i
									className='fa fa-chevron-down'
									style={{
										transform: `rotate(${
											collapsed[key] ? -90 : 0
										}deg)`,
										transition: 'transform 0.2s ease-in-out',
									}}
								></i>&nbsp;&nbsp;
									{key}
								</td>
								<td
                                    style={{
                                        opacity: `${collapsed[key] ? 0 : 100}%`,
                                    }}
                                >PID</td>
								<td
                                    style={{
                                        textAlign: 'right',
                                    }}
                                >{aggregateData[key]?.cpu}</td>
								<td
                                    style={{
                                        textAlign: 'right',
                                    }}
                                >{aggregateData[key]?.memory}</td>
								<td
                                    style={{
                                        opacity: `${collapsed[key] ? 0 : 100}%`,
										textAlign: 'right',
                                    }}
                                >CPU TIME</td>
							</tr>

							{Object.entries(value).map(([pid, detail]) => {
								if (!pid || pid === 'aggergate' || pid === 'undefined') {
									return null;
								}

								return (
                                    (!collapsed[key]) && <tr
										key={pid}
									>
										<td></td>
										<td>{pid}</td>
										<td style={{textAlign: 'right'}}>{detail.cpu_usage}</td>
										<td style={{textAlign: 'right'}}>{detail.mem_usage}</td>
										<td style={{textAlign: 'right'}}>{detail.time}</td>
									</tr>
								);
							})}
						</React.Fragment>
					);
				})}
			</tbody>
		</table>
	);
};

export default RunningAppsTable;

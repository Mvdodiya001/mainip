import React, { useEffect, useState } from 'react';
import { ButtonGroup, Button, Dropdown } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import ScanModalSingle from './ScanModalSingle';
import ScanModalMultiple from './ScanModalMultiple';
import WorkSpace from './WorkSpace';
import YearDropdown from './YearDropdown';

import { useData } from '../Context/DataContext';
import { useModalContext } from '../Context/ModalContext';
import { useScanGraph } from '../Context/ScanGraphContext';

import './../Styles/home.css';

export default function Home(props) {
	const { IPsData } = useData();
	const {
		yearly,
		setYearly,
		monthNames,
		yearlyData,
		monthlyData,
		scanFilter,
		setScanFilter,
		todayScan,
	} = useScanGraph();
	const { showModal, modalType } = useModalContext();

	const [chartYearData, setChartYearData] = useState(
		Array.from({ length: 12 }, () => {
			let index = -1;
			return Array.from({ length: 12 }, () => {
				index++;
				return {
					month: monthNames[index].slice(0, 3),
					count: 0,
				};
			});
		})
	);
	const [chartMonthData, setChartMonthData] = useState(
		Array.from({ length: 31 }, () => {
			let index = 0;
			return Array.from({ length: 31 }, () => {
				index++;
				return {
					date: index,
					count: 0,
				};
			});
		})
	);

	useEffect(() => {
		setChartYearData(yearlyData[scanFilter.year - 2000]);
		setChartMonthData(
			monthlyData[scanFilter.year - 2000][scanFilter.month - 1]
		);
	}, [yearlyData, monthlyData, scanFilter]);

	return (
		<div className='home'>
			<div className='stat-container p-2'>
				<div>
					<h1 className='text-dark'>Overview</h1>
				</div>
				<div className='overview-container'>
					<div className='left-container'>
						<p className='fs-3 text-bodym m-2'>Total Scans</p>
						<div className='top overviewBoxes'>
							<div className='first overviewBox rounded m-1 d-flex flex-column justify-content-evenly'>
								<h2 className='text-center'>
									{IPsData.length}
								</h2>
								<p className='text-center'>IP scanned</p>
							</div>
							<div className='second overviewBox rounded m-1 d-flex flex-column justify-content-evenly'>
								<h2 className='text-center'>0</h2>
								<p className='text-center'>
									Vulnerabilities <br /> Found
								</p>
							</div>
						</div>
						<p className='fs-3 text-body m-2'>Today Scans</p>
						<div className='bottom overviewBoxes'>
							<div className='first overviewBox rounded m-1 d-flex flex-column justify-content-evenly'>
								<h2 className='text-center'>{todayScan}</h2>
								<p className='text-center'>IP scanned</p>
							</div>
							<div className='second overviewBox rounded m-1 d-flex flex-column justify-content-evenly'>
								<h2 className='text-center'>0</h2>
								<p className='text-center'>
									Vulnerabilities <br /> Found
								</p>
							</div>
						</div>
					</div>

					<div className='right-container p-3 rounded'>
						<div>
							<ButtonGroup>
								<Button
									variant={yearly ? 'primary' : 'secondary'}
									onClick={() => {
										setYearly(true);
									}}
									className='my-3 ml-3'
								>
									Year
								</Button>
								<Button
									variant={!yearly ? 'primary' : 'secondary'}
									onClick={() => {
										setYearly(false);
									}}
									className='my-3 mr-3'
								>
									Month
								</Button>
								<div className='my-3 mx-3'>
									<YearDropdown
										selectedYear={scanFilter.year}
										onSelectYear={(selectedValue) => {
											setScanFilter({
												...scanFilter,
												year: Number(selectedValue),
											});
										}}
									/>
								</div>
								<div className='my-3 '>
									{!yearly && (
										<Dropdown
											onSelect={(selectedValue) => {
												setScanFilter({
													...scanFilter,
													month: Number(
														selectedValue
													),
												});
											}}
										>
											<Dropdown.Toggle
												variant='secondary'
												className='ms-3'
											>
												{scanFilter.month === 0
													? 'Select Month'
													: monthNames[
															scanFilter.month *
																1 -
																1
													  ]}
											</Dropdown.Toggle>
											<Dropdown.Menu>
												{monthNames.map(
													(item, index) => (
														<Dropdown.Item
															key={index}
															eventKey={index + 1}
														>
															{item}
														</Dropdown.Item>
													)
												)}
											</Dropdown.Menu>
										</Dropdown>
									)}
								</div>
							</ButtonGroup>
						</div>
						{yearly ? (
							<div className='graph-container p-2'>
								<h2 className='text-end p-2'>Yearly</h2>
								<LineChart
									width={600}
									height={400}
									data={chartYearData}
								>
									{/* <CartesianGrid strokeDasharray="5 5" /> */}
									<XAxis tickCount={6} dataKey='month' />
									<YAxis
										tickLine={false}
										tickFormatter='5'
									></YAxis>

									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='count'
										stroke='#8884d8'
									/>
								</LineChart>
							</div>
						) : (
							<div className='graph-container p-2'>
								<h2 className='text-end p-2'>Monthly</h2>
								<LineChart
									width={600}
									height={400}
									data={chartMonthData}
								>
									{/* <CartesianGrid strokeDasharray="5 5" /> */}
									<XAxis dataKey='date' />
									<YAxis tickCount={6} />
									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='count'
										stroke='#8884d8'
									/>
								</LineChart>
							</div>
						)}
					</div>
				</div>
			</div>
			{showModal && (
				<div className='scan-modal--div'>
					{modalType === 'single' ? (
						<ScanModalSingle />
					) : (
						<ScanModalMultiple />
					)}
				</div>
			)}
			<WorkSpace />
		</div>
	);
}

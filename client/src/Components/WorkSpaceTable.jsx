import React, { useState, useEffect } from 'react';
import WorkSpaceTableEntry from './WorkSpaceTableEntry';
import { useData } from '../Context/DataContext';
import { useErrorHandler } from '../Context/ErrorContext';
import { useWorkSpace } from '../Context/WorkSpaceContext';

export default function WorkSpaceTable(props) {
	const { IPsData } = useData();
	const { addError } = useErrorHandler();
  
	const {
		workSpaceTablePage,
		setWorkSpaceTablePage,
		workSpaceTableFilter,
		setWorkSpaceTableFilter,
	} = useWorkSpace();
	const [displayData, setDisplayData] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [pages, setPages] = useState([]);

	useEffect(() => {
		const start = (workSpaceTablePage - 1) * 10;
		const end = start + 10;

		setDisplayData(
			IPsData.filter(
				(entry) =>
					entry.ip.includes(workSpaceTableFilter.ip) &&
					entry.timestamp >= workSpaceTableFilter.startDate &&
					entry.timestamp <= workSpaceTableFilter.endDate
			).slice(start, end)
		);
		setTotalPages(
			Math.ceil(
				IPsData.filter(
					(entry) =>
						entry.ip.includes(workSpaceTableFilter.ip) &&
						entry.timestamp >= workSpaceTableFilter.startDate &&
						entry.timestamp <= workSpaceTableFilter.endDate
				).length / 10
			)
		);
	}, [workSpaceTablePage, IPsData, workSpaceTableFilter]);

	useEffect(() => {
		if (totalPages < workSpaceTablePage) {
			setWorkSpaceTablePage(totalPages);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalPages]);

	useEffect(() => {
		const tempPages = [];
		let minPage = Math.max(1, workSpaceTablePage - 2);
		let maxPage = Math.min(workSpaceTablePage + 2, totalPages);

		if (maxPage - minPage < 4) {
			if (maxPage === totalPages) {
				minPage = Math.max(1, maxPage - 4);
			} else {
				maxPage = Math.min(totalPages, minPage + 4);
			}
		}

		for (let i = minPage; i <= maxPage; i++) {
			tempPages.push(i);
		}
		setPages(tempPages);
	}, [workSpaceTablePage, totalPages]);

	try {
		return (
			<div className='workspace-div'>
				<div className='workspace-filters'>
					<label> Filters: &nbsp;&nbsp;&nbsp;&nbsp;</label>
					<div>
						IP Address:
						<input
							type='text'
							name='ip-address'
							placeholder='IP Address'
							value={workSpaceTableFilter.ip || ''}
							onChange={(e) => {
								setWorkSpaceTableFilter({
									...workSpaceTableFilter,
									ip: e.target.value,
								});
							}}
						/>
					</div>
					<div>
						<label> Date Range: </label>
						<input
							type='date'
							name='start-date'
							placeholder='Start Date'
							value={workSpaceTableFilter.startDate}
							onChange={(e) => {
								if (
									e.target.value >
									workSpaceTableFilter.endDate
								) {
									return;
								}
								if (
									e.target.value >
									new Date().toISOString().slice(0, 10)
								) {
									return;
								}
								setWorkSpaceTableFilter({
									...workSpaceTableFilter,
									startDate: e.target.value,
								});
							}}
						/>
						<input
							type='date'
							name='end-date'
							placeholder='End Date'
							value={workSpaceTableFilter.endDate}
							onChange={(e) => {
								const time = new Date(e.target.value).getTime();
								if (
									new Date(time).toISOString().slice(0, 10) <
									workSpaceTableFilter.startDate
								) {
									return;
								}
								if (
									new Date(time).toISOString().slice(0, 10) >
									new Date(Date.now() + 24 * 60 * 60 * 1000)
										.toISOString()
										.slice(0, 10)
								) {
									return;
								}
								setWorkSpaceTableFilter({
									...workSpaceTableFilter,
									endDate: e.target.value,
								});
							}}
						/>
					</div>
					<button
						className='btn btn-danger'
						onClick={() => {
							setWorkSpaceTableFilter({
								ip: '',
								startDate: new Date('2021-01-01')
									.toISOString()
									.slice(0, 10),
								endDate: new Date(
									Date.now() + 24 * 60 * 60 * 1000
								)
									.toISOString()
									.slice(0, 10),
							});
						}}
					>
						{' '}
						Reset Filters{' '}
					</button>
				</div>
				<>
					{displayData?.map((entry, index) => {
						const data = {
							end: entry.end,
							endt:entry.endtime,
							coun:entry.coun,
							timestamp: entry.timestamp,
							target: entry.ip,
							host_name: entry.host_name,
							index: index + 1,
							summaryTags: entry.summary ? entry.summary : [],
							details: [
								{
									link: `/reports/${entry.id}`,
									title: 'Reports',
									count: entry.report?.length,
								},
							],
							rawReport: entry.rawReport,
							reportDownloadLink: `/download/report/${entry.timestamp}`,
							report: entry.report,
							id: entry._id,
						};
						return (
							<WorkSpaceTableEntry scan_data={data} key={index} />
						);
					})}
				</>
				<div className='workspace-pagination'>
					<div className='workspace-pagination-buttons'>
						<button
							className='btn btn-primary'
							onClick={() => {
								workSpaceTablePage > 1 &&
									setWorkSpaceTablePage(
										workSpaceTablePage - 1
									);
							}}
						>
							{'<'}
						</button>

						{pages.map((page, index) => {
							return (
								<button
									className={`btn ${
										workSpaceTablePage === page
											? 'btn-primary'
											: 'btn-secondary'
									}`}
									onClick={() => {
										setWorkSpaceTablePage(page);
									}}
									key={index}
								>
									{page}
								</button>
							);
						})}

						<button
							className='btn btn-primary'
							onClick={() => {
								workSpaceTablePage < totalPages &&
									setWorkSpaceTablePage(
										workSpaceTablePage + 1
									);
							}}
						>
							{'>'}
						</button>
					</div>

					<div className='workspace-pagination-info'>
						<p>
							Showing {workSpaceTablePage} of {totalPages} pages
						</p>

						<select
							className='form-select'
							value={workSpaceTablePage}
							onChange={(e) => {
								setWorkSpaceTablePage(parseInt(e.target.value));
							}}
						>
							{Array.from(
								{ length: totalPages },
								(_, i) => i + 1
							).map((page, index) => {
								return (
									<option value={page} key={index}>
										{page}
									</option>
								);
							})}
						</select>
					</div>
				</div>
			</div>
		);
	} catch (err) {
		addError({
			errorType: 'Rendering Error',
			message: err.message,
			code: err.code,
		});
		return <></>;
	}
}

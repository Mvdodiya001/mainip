/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useModalContext } from '../Context/ModalContext';
import { useData } from '../Context/DataContext';
import { useParams } from 'react-router-dom';

export default function ReportTableEntry(props) {
	const { handleUpdateReportData } = useData();
	const { handleRawFileOpen } = useModalContext();
	let { id } = useParams();

	const handleRawFileOpenClick = (event) => {
		handleRawFileOpen(
			JSON.parse(event.target.getAttribute('data_to_display'))
		);
	};

	const handleUpdateReport = (event) => {
		const key = event.target.getAttribute('title');
		console.log(id, key);
		handleUpdateReportData(id, key);
	};

	return (
		<tr>
			<td>{props.title}</td>
			<td>
				{typeof props.data === 'object' ? (
					<>
						<a
							className='report-data-link'
							data_to_display={JSON.stringify(
								props.data_to_display
							)}
							onClick={handleRawFileOpenClick}
						>
							{props.data.link_title} &nbsp;&nbsp;
							<i className='fa-solid fa-external-link'></i>
						</a>
						{props.data.link_title === 'CVE Raw Report' ? (
							<button
								className='report-data-update-button report-data-link'
								onClick={handleUpdateReport}
								title={props.title}
							>
								<i className="fa fa-refresh"></i> &nbsp;
								Update Data
							</button>
						) : (
							<></>
						)}
					</>
				) : (
					<span className='report-value'>
						{JSON.stringify(props.data)?.slice(1, -1)}
					</span>
				)}
			</td>
		</tr>
	);
}

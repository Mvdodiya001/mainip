import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../Context/DataContext';
import { useModalContext } from '../Context/ModalContext';
import ReportTable from './ReportTable';
import ReportRawFile from './ReportRawFile';
import './../Styles/reportRawFile.css';
import './../Styles/report.css';

export default function Report(props) {

	const { IPsData } = useData();
	const { showReport, rawReportData } = useModalContext();

	let { id: currID } = useParams();
	const navigate = useNavigate();

	const [ipAddress, setIpAddress] = useState('');
	const [report, setReport] = useState([]);
	useEffect(() => {

		try {
			let data = IPsData.filter((IPData) => IPData.id === currID);
			if (data.length > 0) {
				data = data[0];
			}
			if (data.ip) {
				setIpAddress(data.ip);
			}
			if (data.report) {
				setReport(data.report)
			}
		} catch (err) {
			console.log(err);
		}

	}, [IPsData, currID])

	return (
		<div className='report'>
			{
				showReport && (
					<div className="report-raw-file--div">
						<ReportRawFile data={rawReportData} />
					</div>
				)
			}
			<div className='workspace-heading-circle'>
				<span className='workspace-heading'>IoT SECURITY LAB - IIIT Allahabad</span>
			</div>
			<Container className='report-container'>
				<div className='report-container-heading d-flex justify-content-between align-items-start flex-wrap'>
					<div>
						<div className='report-container-heading-text'>REPORT</div>
						<div className='report-addr'>
							<div className='ip'>
								<span className='ip-text'>{ipAddress}</span>
							</div>
							<div className='addr'>
								<span className='addr-text'>
									/IoT-SECURITY-LAB/{ipAddress}
								</span>
							</div>
						</div>
					</div>
					<div className='mt-2'>
						<button
							onClick={() => navigate(`/cve/${currID}`)}
							className='btn btn-primary'
						>
							View CVE Analysis
						</button>
					</div>
				</div>
				<div className='report-container--table-div'>
					<ReportTable report={report} />
				</div>
			</Container>
		</div>
	);
}

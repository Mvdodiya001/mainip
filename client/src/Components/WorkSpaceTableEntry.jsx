/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useData, currentNetworkInterface } from '../Context/DataContext';
import moment from 'moment';
import FormattedReport from './FormattedReport';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { useDeauth } from '../Context/DeauthContext';
import { socket } from '../Context/Socket';
import { Dropdown } from 'react-bootstrap';

export default function WorkSpaceTableEntry(props) {
	const ref = useRef(null);
	const navigate = useNavigate();
	const { handleDeleteScanData } = useData();
	const { isDeauthRunning, performDeauth } = useDeauth();
	const [open, setOpen] = useState(false);
	const handleDownloadLogFile = (scanData) => {
		const anchor = document.createElement('a');

		anchor.download = `${scanData.target}-${moment(
			scanData.timeStamp
		).format('DD-MM-YY-HH-mm-ss')}-log-file.txt`;

		const file = new Blob([scanData.rawReport], { type: 'text/plain' });

		anchor.href = URL.createObjectURL(file);
		anchor.style.display = 'none';

		document.body.append(anchor);
		anchor.click();
		console.log('Ready to download');
	};

	const handleDeleteScanDataUtils = (scanData) => {
		console.log(scanData);
		handleDeleteScanData(scanData.id);
	};

	const handleDeauthAttack = async () => {
		const confirmBox = window.confirm(
			'Initiating a deauthentication attack will cause WiFi disruption and potentially violate network access policies. Are you certain you want to proceed?'
		);
		if (confirmBox === false) {
			return;
		}
		const deauthRunningData = await isDeauthRunning(props.scan_data.target);
		if (deauthRunningData === null) {
			window.alert('Error checking deauth status. Please try again later.');
			return;
		}
		if (deauthRunningData && deauthRunningData.isRunning) {
			window.alert(
				'Deauth attack already running on ' +
				deauthRunningData.ipAddress +
				'. Please wait for it to finish before starting another attack.'
			);
			return;
		}
		if (!deauthRunningData.isRunning && deauthRunningData.ipAddress === '') {
			window.alert('Error checking deauth status. Please try again later.');
			return;
		}

		const newtowkInterface = window.prompt(
			'Enter the network interface to use for the attack.',
			'default'
		);
		const duration = window.prompt(
			'Enter the duration of the attack in seconds.',
			'10'
		);
		const deauthData = {
			ip_address: props.scan_data.target,
			timeout: duration,
			network_interface: newtowkInterface,
		};

		performDeauth(deauthData);
		navigate('/deauth');
	};

	const handleUrlDetection = () => {
		// const networkInterface = window.prompt('Enter the network interface', 'wlp0s20f3');
		// if (!networkInterface) return; // Exit if no input

		// const urlData = { ip_address: props.scan_data.target, network_interface: networkInterface };
		// socket.emit('url_detection', urlData);

		// Construct the URL to open in a new tab
		const url = `/url-detection`;
		window.open(url, '_blank');
	};


	const handle_communication = async () => {
		const networkInterface = window.prompt(
			'enter the network interface',
			'wlp0s20f3'
		);

		const communicationData = {
			ip_address: props.scan_data.target,
			network_interface: networkInterface,
		};


		console.log("communication data", communicationData);
		socket.emit('communication_data', communicationData);

		navigate('/communication-data');

	};


	const handleAnalysis = () => {
		const networkInterface = window.prompt('Enter the network interface', 'wlp0s20f3');
		if (!networkInterface) return; // Exit if no input

		const communicationData = {
			ip_address: props.scan_data.target,
			network_interface: networkInterface,
		};



		socket.emit('communication_data', communicationData);

		// Navigate to /analysis
		navigate('/analysis');
	};
































	// const handleUrlDetection = async () => {
	// 	console.log('prods', props);
	// 	const newtowkInterface = window.prompt(
	// 	  'Enter the network interface',
	// 	  'wlp0s20f3'
	// 	);
	// 	const urlData = {
	// 	  ip_address: props.scan_data.target,
	// 	  network_interface: newtowkInterface,
	// 	};
	// 	console.log('url data', urlData);
	// 	socket.emit('url_detection', urlData);

	// 	// Open a new tab/window with the specified URL
	// 	window.open('http://localhost:3000/', '_blank', 'noopener,noreferrer');
	//   };


	//   const Communica = async () => {
	// 	console.log('prods', props);
	// 	const sourceip = window.prompt(
	// 	  'Enter the sourceip',
	// 	  '192.168.1.100'
	// 	);
	// 	const communication_data = {
	// 	  ip_address: props.scan_data.target,
	// 	  network_interface: newtowkInterface,
	// 	};
	// 	console.log('communication_da', communication_data);
	// 	socket.emit('communicat_ion', communication_data);

	// 	// Open a new tab/window with the specified URL
	// 	window.open('http://localhost:3000/', '_blank', 'noopener,noreferrer');
	//   };


















	// href='http://localhost:3001/' target="_blank" rel="noopener noreferrer";


	// const handleUrlDetection = async () => {
	// 	console.log('prods', props);

	// 	const networkInterface = window.prompt(
	// 		'Enter the network interface',
	// 		'wlp0s20f3'
	// 	);

	// 	const urlData = {
	// 		ip_address: props.scan_data.target,
	// 		network_interface: networkInterface,
	// 	};

	// 	console.log("url data", urlData);

	// 	socket.emit('url_detection', urlData);

	// 	// Open the new page or tab
	// 	const newWindow = window.open('/url-detection', '_blank');
	// 	if (newWindow) {
	// 		newWindow.focus();
	// 	} else {
	// 		alert('Please allow popups for this website');
	// 	}
	// };


	return (
		<div className='container workspace-div-entry rounded'>
			<div className='row justify-content-between'>
				<div className='col workspace-div-entry-ip'>
					{props.scan_data.target ? (
						`${props.scan_data.target} (${props.scan_data.host_name
							? props.scan_data.host_name
								// ?.replace(useData.currentNetworkInterface,'')
								?.replace('wlp0s20f3', '')
								?.replace('Hostname:', '')
								?.replace('undefined', '')
								?.replace('.local', '')
							:
							props.scan_data.report[0]?.data?.text
								//?.replace(useData.currentNetworkInterface,'')
								?.replace('wlp0s20f3', '')
								?.replace('Hostname: ', '')
								?.replace('.local', '')
								?.replace('undefined', '') || 'Unknown'
						})`
					) : (
						<Spinner size='xs' />
					)}
				</div>
				<div className='col workspace-div-entry-report'>
					<Button variant='light'>
						{props.scan_data.details.map((detail, index) => (
							<Link
								to={detail.link}
								rel='noreferrer noopener'
								className='report-link'
								key={index}
							>
								{/* {detail.title}({detail.count ? detail.count : 0} */}
								{detail.title}({isNaN(props.scan_data.coun) ? detail.count : detail.count - props.scan_data.coun}
								)&nbsp;
								{/* <i className='fa-solid fa-external-link'></i> */}
							</Link>
						))}
					</Button>
				</div>
				<div className='workspace-div-entry-timestamp col text-end'>
					{props.scan_data.timestamp ? (
						props.scan_data.timestamp
					) : (
						<Spinner size='xs' />
					)}
				</div>
				<div className='col workspace-div-entry-drpbtn text-end'>
					<Button
						className='btn py-0'
						variant='none'
						onClick={() => setOpen(!open)}
						aria-controls='collapseContent'
						aria-expanded={open}
					>
						<i
							className={open ? 'arrow up ' : 'arrow'}
							ref={ref}
						></i>
					</Button>
				</div>
				<div className='col-md-auto m-auto workspace-div-entry-spinner '>
					{props.scan_data.end ? <></> : <Spinner size='xs' />}
				</div>
			</div>
			<Collapse in={open}>
				<div className='collapseContent row'>
					<div className='col workspace-div-entry-summary'>
						<p>
							<b>Summary</b>
						</p>
						{props.scan_data.summaryTags.map((tag, index) => (
							<span
								className={`workspace-container--table-summary-tag wc-tst-${tag.severity}`}
								key={index}
							>
								{tag.name}
							</span>
						))}
					</div>
					<div className='col-1'></div>
					<div className="col-md-auto workspace-div-entry-logfile d-flex justify-content-end">
						{props.scan_data.end ? (
							<div className="d-flex flex-column align-items-end">
								<div className="d-flex mb-2">
									<div className="workspace-container--entry-dropdown me-2">
										<FormattedReport report={props.scan_data.report} />

										<a
											href="#"
											className="btn btn-primary analysis-scan-button"
											onClick={(e) => {
												e.preventDefault();
												handleAnalysis();
											}}
										>
											Analysis
										</a>

										<Dropdown>
											<Dropdown.Toggle
												split
												variant="primary"
												id="dropdown-split-basic"
												className="new-scan-button"
											>
												<span className="caret"></span>
											</Dropdown.Toggle>

											<Dropdown.Menu>
												<Dropdown.Item as="a" href="/pacp-uploader" target="_blank" rel="noopener noreferrer">
													Encryption
												</Dropdown.Item>
												<Dropdown.Item onClick={handleUrlDetection}>Get Link</Dropdown.Item>
												<Dropdown.Item onClick={handle_communication}>Communication</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>

									<a href={props.scan_data.logFileLink} className='workspace-div-entry-a' onClick={() => handleDownloadLogFile(props.scan_data)}>
										<i className='fa-solid fa-file-lines mx-3'></i>
									</a>
									<a className='workspace-div-entry-a' onClick={() => handleDeleteScanDataUtils(props.scan_data)}>
										<i className='fa-solid fa-trash mx-3'></i>
									</a>
									<button style={{ background: '#7147D7' }} className='btn btn-dark rounded' onClick={handleDeauthAttack}>
										<span className='button-download'>Perform Deauth</span>
									</button>
								</div>

								<div className='total-time-scan'>
									Total Scan Time: {props.scan_data.endt}
								</div>
							</div>
						) : (
							<></>
						)}
					</div>




				</div>

			</Collapse>
		</div>
	);













































	// return (
	// 	<tr
	// 		className={
	// 			'workspace-table--entry' +
	// 			(props.scan_data.end ? '' : ' scanning')
	// 		}
	// 	>
	// 		<td className='workspace-table--entry-index'>
	// 			{props.scan_data.index ? (
	// 				props.scan_data.index
	// 			) : (
	// 				<Spinner size='xs' />
	// 			)}
	// 		</td>
	// 		<td className='workspace-table--entry-ip'>
	// 			{props.scan_data.target ? (
	// 				props.scan_data.target
	// 			) : (
	// 				<Spinner size='xs' />
	// 			)}
	// 		</td>
	// 		<td className='workspace-table--entry-report'>
	// 			{props.scan_data.details.map((detail, index) => (
	// 				<Link
	// 					to={detail.link}
	// 					rel='noreferrer noopener'
	// 					className='report-link'
	// 					key={index}
	// 				>
	// 					{detail.title}({detail.count ? detail.count : 0})&nbsp;
	// 					<i className='fa-solid fa-external-link'></i>
	// 				</Link>
	// 			))}
	// 		</td>
	// 		<td className='workspace-table--entry-summary'>
	// 			{props.scan_data.summaryTags.map((tag, index) => (
	// 				<span
	// 					className={`workspace-container--table-summary-tag wc-tst-${tag.severity}`}
	// 					key={index}
	// 				>
	// 					{tag.name}
	// 				</span>
	// 			))}
	// 		</td>
	// 		<td className='workspace-table--entry-timestamp' style={{ whiteSpace: 'nowrap' }}>
	// 			{props.scan_data.timestamp ? (
	// 				moment(props.scan_data.timestamp).format(
	// 					'DD/MM/YYYY, hh:mm a'
	// 				)
	// 			) : (
	// 				<Spinner size='xs' />
	// 			)}
	// 		</td>
	// 		<td className='workspace-table--entry-download-report'>
	// 			{props.scan_data.end ? (
	// 				<FormattedReport report={props.scan_data.report} />
	// 			) : (
	// 				<span className='button-download'>Scanning...</span>
	// 			)}
	// 		</td>
	// 		<td className='workspace-table--entry-logfile'>
	// 			{props.scan_data.end ? (
	// 				<div>
	// 					<a
	// 						href={props.scan_data.logFileLink}
	// 						className='workspace-container--table-button'
	// 						onClick={handleDownloadLogFile.bind(
	// 							this,
	// 							props.scan_data
	// 						)}
	// 					>
	// 						<i className='fa-solid fa-file-lines'></i>
	// 					</a>
	// 					<button
	// 						className='workspace-container--table-button'
	// 						onClick={handleDeleteScanDataUtils.bind(this, props.scan_data)}
	// 					>
	// 						<i className='fa-solid fa-trash'></i>
	// 					</button>
	// 				</div>
	// 			) : (
	// 				<Spinner size='xs' />
	// 			)}
	// 		</td>
	// 	</tr>
	// );
}













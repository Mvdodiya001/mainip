import React, { useState } from 'react';
import { useModalContext } from '../Context/ModalContext';
import { useData } from '../Context/DataContext';
import '../Styles/ScanModal.css';

export default function ScanModalMultiple(props) {
	const [csvFile, setCsvFile] = useState(null);
	const [csvFileName, setCsvFileName] = useState(null);
	const { handleMultipleIPScan } = useData();
	const { handleModalClose } = useModalContext();

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = function (event) {
			setCsvFileName(file.name);
			setCsvFile(event.target.result);
		};

		reader.readAsText(file);
	}

	const handleSubmit = async (event) => {
		event.preventDefault();

		const response = await fetch('http://localhost:8000/uploadMultipleIP', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ipList: csvFile }),
		});
		
		if(!response.ok) {
			console.error(response);
			return;
		}

		const data = await response.json();
		
		const listOfIPs = data.results;
		console.log(listOfIPs);
		handleMultipleIPScan(listOfIPs);
		handleModalClose();
	}

	return (
		<div className='IPscan'>
			<div className='modal-top'>
				<span className='heading'>Multiple IP Scan</span>
				<i
					className='fa-light fa-xmark close-icon'
					onClick={handleModalClose}
				></i>
			</div>
			<div className='IP-upload'>
				<i className='fa-light fa-file-csv upload-icon'></i>
				<span className='upload-text'>{csvFileName ? csvFileName : 'Select a CSV file to upload'}</span>
				<input type="file" id="csvFile" className='file-upload' onChange={handleFileChange} accept='text/csv' />
			</div>
			<button className='IP-input-button button' onClick={handleSubmit}>Start Scan</button>
		</div>
	);
}

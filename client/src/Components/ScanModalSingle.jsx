import React from 'react';
import { useState } from 'react';
import { useData } from '../Context/DataContext';
import { useModalContext } from '../Context/ModalContext';

export default function ScanModalSingle(props) {
	const [ipAddress, setIpAddress] = useState('');
	const { handleScanRequest } = useData();
	const { handleModalClose } = useModalContext();

	const handleSubmitIP = () => {
		handleScanRequest(ipAddress);
		// console.log(ipAddress, "test")
		handleModalClose();
	};

	const handleIpChange = (event) => {
		setIpAddress(event.target.value);
		// console.log(event.target.value);
	};

	return (
		<div className='IPscan'>
			<div className='modal-top'>
				<span className='heading'>Single IP Scan</span>
				<i
					className='fa-light fa-xmark close-icon'
					onClick={handleModalClose}
				></i>
			</div>
			<div className='IP-input'>
				<span className='text'>IP Address:</span>
				<input
					className='IP-input-box'
					type='text'
					onChange={handleIpChange}
					value={ipAddress}
				></input>
			</div>
			<button className='IP-input-button button' onClick={handleSubmitIP}>
				Submit
			</button>
		</div>
	);
}

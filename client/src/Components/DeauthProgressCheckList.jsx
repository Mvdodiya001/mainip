import React from 'react';
import { Spinner } from 'react-bootstrap';

import '../Styles/deauth.css';

const PrefixIcon = ({ deauthData }) => {
	if (!deauthData) {
		return <i className='fa-solid fa-circle-check'></i>;
	}

	if (deauthData.isRunning) {
		return <Spinner size='xs' />;
	}

	if (deauthData.success) {
		return (
			<i
				className='fa-solid fa-circle-check'
				style={{ color: 'green' }}
			></i>
		);
	}

	return <i className='fa-solid fa-times' style={{ color: 'red' }}></i>;
};

export default function DeauthProgressCheckList({ checkList, deauthData }) {
	return (
		<div className='deauth-checks'>
			<h3 className='deauth-check-heading'>Deauth Progress Check List</h3>
			<div className='deauth-check-list'>
				{checkList.map((checkListItem, index) => (
					<div className='deauth-check-list-item' key={index}>
						<PrefixIcon deauthData={deauthData[checkListItem[0]]} />
						<div className='check-list-text'>
							{checkListItem[1]}
						</div>
						<div className='check-list-suffix-icon'>
							<i className='fa-solid fa-chevron-down'></i>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

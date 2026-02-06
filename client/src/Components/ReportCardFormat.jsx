import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

export default function ReportCardFormat({ severity, heading, data }) {
	console.log(data);
	return (
		<Card style={{ height: 'fit-content' }}>
			<Card.Header className={`report-data-${severity}`}>
				{heading}
			</Card.Header>
			<ListGroup variant='flush'>
				{!data || data.length === 0 ? (
					<ListGroup.Item>No Data</ListGroup.Item>
				) : (
					data
						.join('\n')
						.split('\n')
						.map((el, index) => (
							<ListGroup.Item key={index}>{el}</ListGroup.Item>
						))
				)}
			</ListGroup>
		</Card>
	);
}

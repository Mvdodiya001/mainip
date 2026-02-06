import React, { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

import { useScanGraph } from '../Context/ScanGraphContext';

function YearDropdown(props) {
	const { scanFilter } = useScanGraph();

	const years = [];
	const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
        years.unshift(i);
    }

	useEffect(() => {
		console.log(scanFilter);
	}, [scanFilter]);

	return (
		<Dropdown>
			<Dropdown.Toggle variant='light' id='dropdown-year'>
				{props.selectedYear}
			</Dropdown.Toggle>
			<Dropdown.Menu
				style={{
					maxHeight: '200px',
					overflowY: 'auto',
					'--bs-dropdown-min-width': 'fit-content',
				}}
			>
				{years.map((year) => (
					<Dropdown.Item
						key={year}
						onClick={() => props.onSelectYear(year)}
						style={{
							backgroundColor:
								year === scanFilter.year ? '#007bff' : '',
							color: year === scanFilter.year ? 'white' : '',
						}}
					>
						{year}
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
}

export default YearDropdown;

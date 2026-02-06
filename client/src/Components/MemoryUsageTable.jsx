import React from 'react';
import MemoryUsageEntry from './MemoryUsageEntry';
import { useData } from '../Context/DataContext';

export default function MemoryUsageTable() {
	const { MemoryUsageData } = useData();

	return (
		<table
			className='report-container--table'
			style={{ maxWidth: '50%', margin: 'auto' }}
		>
			<thead>
				<tr>
					<th className='memory-usage-row-heading'>Title</th>
					<th className='memory-usage-row-heading'>Value</th>
				</tr>
			</thead>
			<tbody className='report-container--table-body'>
				{
					MemoryUsageData?.map((data, index) => (
						<MemoryUsageEntry
							heading={data.heading}
							value={data.value}
							detail={data.detail}
							key={index}
						/>
					))
				}
			</tbody>
		</table>
	);
}

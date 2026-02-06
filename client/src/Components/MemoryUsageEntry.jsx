import React from 'react';

export default function MemoryUsageEntry(props) {
	return (
		<tr>
			<td className='memory-usage-row-heading'>
				{props.heading} &nbsp;
				<i className='fa-solid fa-circle-info' title={props.detail}></i>
			</td>
			<td className='memory-usage-row-value'>{props.value}</td>
		</tr>
	);
}

import React from 'react';
import ReportTableEntry from './ReportTableEntry';
import ReportTableDropdown from './ReportTableDropdown';

export default function ReportTable(props) {
	return (
		<>
			{/* <table className='report-container--table'>
				<thead className='report-container--table-header'>
					<tr>
						<th>Module</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody className='report-container--table-body'>
					{
						props.report.map((entry, index) =>
							<ReportTableEntry title={entry.title} data={entry.data} data_to_display={entry.dataToDisplay} key={index} />
						)
					}
				</tbody>
			</table> */}
			<div>





			{
					props.report.map((entry, index) => 
						entry.title !== " " ? (
							<ReportTableDropdown 
								title={entry.title} 
								data={entry.data} 
								data_to_display={entry.dataToDisplay} 
								key={index} 
							/>
						) : null
					)
				}
					{/* {
						props.report.map((entry,index) => 
						     //entry.dataToDisplay[0].severity = 'severity' ;
							 if(entry.title !== " "){
							
							<ReportTableDropdown title={entry.title} data={entry.data} data_to_display={entry.dataToDisplay} key={index} />
							 }
						)
					} */}
					
	{/* {
		props.report.map((entry, index) => {
			
			entry.dataToDisplay[0].severity = 'Severity';

			
			return (
				<ReportTableDropdown 
					title={entry.title} 
					data={entry.data} 
					data_to_display={entry.dataToDisplay} 
					key={index} 
				/>
			);
		})
	} */}


			</div>
		</>
	);
}

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import html2pdf from 'html2pdf.js';
import ReportCardFormat from './ReportCardFormat';
import { processDataForDisplay } from '../Utils/UtilityFunctions';

import './../Styles/FormattedReport.css';

function FormattedReport(props) {
	const pdfJSX = () => {
		return (
			<>
				<div className='page'>
					<div className='Heading'>Summary</div>
					<div className='cards' id='FormattedData'>
						{processDataForDisplay(props.report).map((el, index) => {
														if(el.title === " " || el.title === "PORT/SERVICE"){
														}
else {
							return (
								<ReportCardFormat
									severity={el.severity}
									heading={el.title}
									data={[el.value]}
									key = {index}
								/>
							); }
						})}
					</div>
				</div>
			</>
		);
	};
	const printHandler = () => {
		const printElement = ReactDOMServer.renderToString(pdfJSX());
		// console.log(printElement);

		const options = {
			margin: 10,
			padding: 10,
			filename: `report.pdf`,
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
		};		  

		html2pdf()
			.from(printElement)
			.outputPdf('dataurlnewwindow', options)
			.get('pdf')
	};

	return (
		<button onClick={printHandler} style={{background: '#7147D7'}} className='btn btn-dark rounded'>
			<span className='button-download'>Report</span>
			<i className='fa-solid fa-cloud-arrow-down'></i>
		</button>
	);
}

export default FormattedReport;
// href={'/download/report/' + props.scan_data.timestamp}

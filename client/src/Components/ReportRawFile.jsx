import React from 'react';
import Format from '../Utils/Format';
import ReportCardFormat from './ReportCardFormat';
import { processDataForDisplay } from '../Utils/UtilityFunctions';
import { useModalContext } from '../Context/ModalContext';
import '../Styles/FormattedReport.css';

export default function ReportRawFile(props) {
    const { rawFileData : data_to_display, handleRawFileClose } = useModalContext();

    return (
        <div className='report-raw-file'>
            <div className="report-raw-file--top">
                <span className='heading'>{props.title}</span>
                <i className='fa-light fa-xmark close-icon' onClick={handleRawFileClose}></i>
            </div>
            {
                data_to_display ? (
                    <div className='cards' id='FormattedData' style={{width: '100%', height: '80%', overflow: 'auto'}}>
                        {processDataForDisplay([data_to_display]).map((el, index) => {
                            return (
                                <ReportCardFormat
                                    severity={el.severity}
                                    heading={el.title}
                                    data={[el.value]}
                                    key = {index}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <Format rawData={data_to_display} title={data_to_display} />
                )
            }
        </div>
    );
}





// import React from 'react';
// import Format from '../Utils/Format';
// import ReportCardFormat from './ReportCardFormat';
// import { processDataForDisplay } from '../Utils/UtilityFunctions';
// import { useModalContext } from '../Context/ModalContext';
// import '../Styles/FormattedReport.css';

// export default function ReportRawFile(props) {
//     const { rawFileData: data_to_display, handleRawFileClose } = useModalContext();

//     return (
//         <div className='report-raw-file'>
//             <div className="report-raw-file--top">
//                 <span className='heading'>{props.title}</span>
//                 <i className='fa-light fa-xmark close-icon' onClick={handleRawFileClose}></i>
//             </div>
//             {
//                 data_to_display ? (
//                     <div className='cards' id='FormattedData' style={{ width: '100%', height: '80%', overflow: 'auto' }}>
//                         {processDataForDisplay([data_to_display]).map((el, index) => {
//                             // Check if the title is "PORTS" and value is empty or null
//                             if (el.title === "" && (!el.value || el.value.length === 0)) {
//                                 // Set value to "no ports open" if empty
//                                 el.value = "No data";
//                                 el.title="PORTS"
//                                 el.severity="Info"
                                
//                             }

//                             return (
//                                 <ReportCardFormat
//                                     severity={el.severity}
//                                     heading={el.title}
//                                     data={[el.value]}
//                                     key={index}
//                                 />
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <Format rawData={data_to_display} title={data_to_display} />
//                 )
//             }
//         </div>
//     );
// }
// const  {DataToDisplay,port_443} = require('./dataToDisplay');
// const generateSummary = require('./generateSummary');

// const formatData = async (buffer, {formatted, currentIndex, tempstr}) => {
// 	const processReportLine = (str) => {
// 		if (currentIndex > -1) {
// 			formatted.report[currentIndex]['data']['text'] = tempstr.trim();
// 			if (tempstr.includes('Guess:')) {
// 				const index = tempstr.indexOf('Guess:') + 7;
// 				const linkTitle = tempstr.slice(index);
// 				formatted.report[currentIndex]['data']['link_title'] =
// 					linkTitle.trim();
// 				formatted.summary.push({
// 					name: linkTitle.split(' ')[0],
// 					severity: 'none',
// 				});
// 			} else {
// 				formatted.report[currentIndex]['data'][
// 					'link_title'
// 				] = `${formatted.report[currentIndex].title} Raw Report`;
// 			}

// 			if (formatted.report[currentIndex].title.toLowerCase() === 'mac') {
// 				formatted['MAC'] += tempstr.trim();
// 			}

// 			if (formatted.report[currentIndex].title.toLowerCase() === 'host name') {
// 				formatted['host_name'] += tempstr.trim();
// 			}






// 			if (!port_443) {
//                 // Remove the report with the title "Cipher"   report => report.title !== "Cipher"
// 				if(formatted.report[currentIndex].title === ("Cipher" || "SSL/TLS Certificate" ||"Certificate Weaknesses" || "SSL Version")){
//                 //formatted.report = formatted.report.filter(formatted.report[currentIndex]);
// 				formatted.report[currentIndex].title =" "
// 				formatted.report[currentIndex].data =" "
// 				// formatted.report
// 				}
				



// 				else{

// 					formatted.report[currentIndex].dataToDisplay = DataToDisplay(
// 						formatted.report[currentIndex].title,
// 						formatted.report[currentIndex].data
// 					); 
// 				}
//             }
// 			else{

// 			formatted.report[currentIndex].dataToDisplay = DataToDisplay(
// 				formatted.report[currentIndex].title,
// 				formatted.report[currentIndex].data
// 			); 
// 		}



// 			// if (!port_443) {
//             //     // Remove the report with the title "Cipher"   report => report.title !== "Cipher"
// 			// 	if(formatted.report[currentIndex].title === "Cipher"){
//             //     //formatted.report = formatted.report.filter(formatted.report[currentIndex]);
// 			// 	// formatted.report[currentIndex].title =" "
// 			// 	// formatted.report[currentIndex].data =" "
// 			// 	formatted.report
// 			// 	}
//             // }





// 			// if(!port_443){
				
// 			// 		if(formatted.report[currentIndex].title === "Cipher"){ 
// 			// 			$pull: { report: { title: "Cipher" } } 
// 			// 		}
// 			// 		//formatted.report[currentIndex].data
			
// 			// }




// 		// 	IPData.updateOne(
// 		// 	{ id: "66be71e24a7aeaff0e7219f7" },
// 		// 	{ $pull: { report: { title: "Cipher" } } }
// 		//   )













// 			if (
// 				['ports'].includes(
// 					formatted.report[currentIndex].title.toLowerCase()
// 				)
// 			) {
// 				formatted.summary.push(
// 					...generateSummary(
// 						formatted.report[currentIndex].title,
// 						formatted.report[currentIndex].dataToDisplay
// 					)
// 				);
// 			}

// 			tempstr = '';
// 		}
// 	};

// 	const data = String(buffer)
// 		.split('\n')
// 		.filter((el) => el !== '');

// 	data.forEach((str) => {
// 		if (!str) {
// 			return;
// 		}

// 		formatted['rawReport'] = formatted['rawReport'] + str + '\n';

// 		if (str.toLowerCase().includes('testing started for')) {
// 			const fip = str.split(' ');
// 			formatted['ip'] = fip[fip.length - 1];
// 			return;
// 		}

// 		if (str.startsWith('#')) {
// 			// console.log('text:', str);
// 			str = str.split('*').join('').split('#').join('');
// 			processReportLine(str)
// 			currentIndex = currentIndex + 1;
// 			return formatted.report.push({
// 				title: str === 'TTL' ? 'OS' : str.trim(),
// 				data: {},
// 			});
// 		}

// 		if (str.startsWith('-')) {
// 			// console.log('text:', str);
// 			processReportLine(str.split('-').join(''));
// 			return;
// 		}

// 		tempstr += str;
// 		tempstr += '\n';
// 	});

// 	return { formatted, currentIndex, tempstr };
// };

// module.exports={
// 	formatData,
// 	port_443,

// };







const { DataToDisplay, port_443,port443,mlguess} = require('./dataToDisplay');
const generateSummary = require('./generateSummary');

const formatData = async (buffer, { formatted, currentIndex, tempstr }) => {
    
    const processReportLine = (str) => {
        if (currentIndex > -1) {
            const currentReport = formatted.report[currentIndex];
            currentReport.data.text = tempstr.trim();

            if (tempstr.includes('Guess:')) {
                const index = tempstr.indexOf('Guess:') + 7;
                const linkTitle = tempstr.slice(index).trim();
                currentReport.data.link_title = linkTitle;
                formatted.summary.push({ name: linkTitle.split(' ')[0] + mlguess(10), severity: 'none' });
            } else {
                currentReport.data.link_title = `${currentReport.title} Raw Report`;
            }

            const title = currentReport.title.toLowerCase();
            if (title === 'mac') {
                formatted.MAC += tempstr.trim();
            }
            if (title === 'host name') {
                formatted.host_name += tempstr.trim();
            }

            if (formatted.port === 0 ) {

                
                // Remove specific reports based on their title
                const removableTitles = ['Cipher', 'SSL/TLS Certificate', 'Certificate Weaknesses', 'SSL Version'];
                if (removableTitles.includes(currentReport.title)) {
                    formatted.coun = formatted.coun + 1;
                    currentReport.title = " ";
                    currentReport.data = " ";
                } else {
                    if(currentReport.title ==='OS '){
                        // formatted.report[currentIndex-1].dataToDisplay.value = formatted.report[currentIndex-1].dataToDisplay.value  + DataToDisplay(currentReport.title, currentReport.data);
                        formatted.coun = formatted.coun + 1;
                        let variable = currentReport.title;
                        currentReport.title = " ";

                        DataToDisplay(variable, currentReport.data);
                        

                        
                        //currentReport.data = " ";
                    }
                    else{
                              currentReport.dataToDisplay = DataToDisplay(currentReport.title, currentReport.data);
                               if ( title === 'ports') {
                                    if(port443(10)){
                                         formatted.port =  port443(10);
                                    }
                                // currentReport.dataToDisplay[1].title.includes('443/tcp')
                                }
                    }
                }
            } else {
                currentReport.dataToDisplay = DataToDisplay(currentReport.title, currentReport.data);
            }

            // if (port_443 === 0 ) {
            //     // Remove specific reports based on their title
            //     const removableTitles = ['Cipher', 'SSL/TLS Certificate', 'Certificate Weaknesses', 'SSL Version'];
            //     if (removableTitles.includes(currentReport.title)) {
            //         currentReport.title = " ";
            //         currentReport.data = " ";
            //     } else {
            //         currentReport.dataToDisplay = DataToDisplay(currentReport.title, currentReport.data);
            //     }
            // } else {
            //     currentReport.dataToDisplay = DataToDisplay(currentReport.title, currentReport.data);
                
            // }





            if (title === 'ports') {
                
                formatted.summary.push(...generateSummary(currentReport.title, currentReport.dataToDisplay));
            }

            tempstr = '';
        }
    };

    const data = String(buffer)
        .split('\n')
        .filter((el) => el !== '');

    data.forEach((str) => {
        if (!str) {
            return;
        }

        formatted.rawReport += str + '\n';

        if (str.toLowerCase().includes('testing started for')) {
            const fip = str.split(' ');
            formatted.ip = fip[fip.length - 1];
            return;
        }

        if (str.startsWith('#')) {
            str = str.replace(/[*#]/g, '').trim();
            processReportLine(str);
            currentIndex++;
            //return formatted.report.push({ title: str === 'TTL'||'TTL_ML' ? 'OS' : str, data: {} });
            if(str === 'TTL_ML'){
                return formatted.report.push({ title: str === 'TTL_ML' ? 'OS ' : str, data: {} });
            }
            return formatted.report.push({ 
                title: (str === 'TTL' ) ? 'OS' : str, 
                data: {} 
              });
              
        }

        if (str.startsWith('-')) {
            processReportLine(str.replace(/-/g, ''));
            return;
        }

        tempstr += str + '\n';
    });

    return { formatted, currentIndex, tempstr };
};

module.exports = {
    formatData,
    port_443,
};

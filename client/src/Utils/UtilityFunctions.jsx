export function processDataForDisplay(report) {
	const processedDataToDisplay = [];

	report.forEach((el) => {
		if (!el) {
			return;
		}

		el = el.dataToDisplay || el;

		if (!Array.isArray(el)) {
			processedDataToDisplay.push({
				...el,
				value: el.value && el.value.length > 0 ? el.value : 'No Data',
			});
			return;
		}

		el.forEach((data) => {
			if(!data) {
				return;
			}
			
			processedDataToDisplay.push({
				...data,
				value: data.value && data.value.length > 0 ? data.value : 'No Data',
			});
		});
	});

	return processedDataToDisplay;
}

const Ports = (data) => {
	const result = [];

	try {
		data.forEach((portData) => {
			const { title, severity, value } = portData;

			if (
				severity === 'unknown' ||
				severity === 'info' ||
				severity === 'none'
			) {
				return;
			}


			if (title !== "PORT/SERVICE") {
				result.push({ name: `${title}/${value}`, severity });
			}







			// result.push({ name: `${title}/${value}`, severity });
		});
	} catch (err) {
		console.log(err, data);
	}

	return result;
};

const CVEFormatter = (data) => {
	const result = [];

	console.log(data);

	data.forEach((cveData) => {
		if (!cveData) {
			return;
		}

		const { title, severity, value } = cveData;

		if (
			severity === 'unknown' ||
			severity === 'info' ||
			severity === 'none'
		) {
			return;
		}

		result.push({ name: `${title}/${value}`, severity });
	});

	return result;
};

module.exports = (title, data) => {
	if (!data) {
		return [];
	}

	if (title === 'PORTS') {
		return Ports(data);
	}

	if (title === 'CVE') {
		return CVEFormatter(data);
	}

	return [];
};

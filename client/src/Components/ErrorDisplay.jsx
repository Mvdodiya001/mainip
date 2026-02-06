import React from 'react';
import { useErrorHandler } from '../Context/ErrorContext';
import ErrorCard from './ErrorCard';

import '../Styles/error.css';

const ErrorDisplay = () => {
	const { error } = useErrorHandler();

	return (
		<div className='error-container'>
			{error.map((err, index) => {
				return (
					<ErrorCard
						key={index}
						title={err.errorType}
						message={err.message}
					/>
				);
			})}
		</div>
	);
};

export default ErrorDisplay;

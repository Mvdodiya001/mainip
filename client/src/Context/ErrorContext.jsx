import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from './Socket';

const ErrorHandlerContext = createContext();

const ErrorHandlerUtility = ({ children }) => {
    const [error, setError] = useState([]);

    socket.on('error', (data) => {
        data = JSON.parse(data);
        addError(data);
    });

    const addError = (err) => {
        setError([
            ...error,
            err,
        ]);
        setTimeout(() => {
            setError(error.slice(1));
        }, 10000);
    }
    
    useEffect(() => {
        console.log(error);
    }, [error]);
    
	return (
		<ErrorHandlerContext.Provider 
            value={{ error, setError, addError }}
        >
			{children}
		</ErrorHandlerContext.Provider>
	);
};

const useErrorHandler = () => {
	return useContext(ErrorHandlerContext);
};

export { useErrorHandler, ErrorHandlerUtility };

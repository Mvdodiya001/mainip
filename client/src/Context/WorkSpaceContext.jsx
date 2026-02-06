import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

const WorkSpaceContext = createContext();

const WorkSpaceProvider = ({ children }) => {
	const [workSpaceTablePage, setWorkSpaceTablePage] = useState(1);
	const [workSpaceTablePageSize, setWorkSpaceTablePageSize] = useState(10);
	const [workSpaceTableFilter, setWorkSpaceTableFilter] = useState({
		ip: '',
		startDate: new Date('2021-01-01').toISOString().slice(0, 10),
		endDate: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
	});

	useEffect(() => {
		console.log('workSpaceTablePage', workSpaceTablePage);
		if(workSpaceTablePage < 1) setWorkSpaceTablePage(1);
	}, [workSpaceTablePage]);

	return (
		<WorkSpaceContext.Provider
			value={{ workSpaceTablePage, setWorkSpaceTablePage, workSpaceTablePageSize, setWorkSpaceTablePageSize, workSpaceTableFilter, setWorkSpaceTableFilter }}
		>
			{children}
		</WorkSpaceContext.Provider>
	);
};

const useWorkSpace = () => {
	const context = useContext(WorkSpaceContext);
	return context;
};

export { useWorkSpace, WorkSpaceProvider };

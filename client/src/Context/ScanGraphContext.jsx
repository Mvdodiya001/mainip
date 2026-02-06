import React, { createContext, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { useData } from './DataContext';

const ScanGraphContext = createContext();

const ScanGraphProvider = ({ children }) => {
	const { IPsData } = useData();
	const [scanFilter, setScanFilter] = useState({
		year: Number(moment(Date.now()).format('YYYY')),
		month: Number(moment(Date.now()).format('M')),
	});
	const [yearly, setYearly] = useState(true);
    const [todayScan, setTodayScan] = useState(0);
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	const [yearlyData, setYearlyData] = useState(
		Array.from({ length: new Date().getFullYear() - 2000 + 1 }, () => {
            let index = -1;
			return Array.from({ length: 12 }, () => {
                index++;
                return {
                    month: monthNames[index].slice(0, 3),
                    count: 0,
                }
            });
		})
	);

	const [monthlyData, setMonthlyData] = useState(
		Array.from({ length: new Date().getFullYear() - 2000 + 1 }, () => {
            return Array.from({ length: 12 }, () => {
                let index = 0;
                return Array.from({ length: 31 }, () => {
                        index++;
                        return {
                            date: index,
                            count: 0,
                        }
                    });
				});
		})
	);

	useEffect(() => {
		if (!IPsData) return;

        let todayScan = 0;
		IPsData.forEach((el) => {
			const temp = moment(moment(el.timestamp).format('YYYYMMDD'));
			const tempYear = Number(temp.format('YYYY'));
			const tempMonth = Number(temp.format('M'));
			const tempDate = Number(temp.format('D'));

			const yearIndex = tempYear - 2000;
			const monthIndex = tempMonth - 1;
			const dateIndex = tempDate - 1;

			setYearlyData((prevYearlyData) => {
                prevYearlyData[yearIndex][monthIndex].count++;
				// prevYearlyData[yearIndex][monthIndex].count = todayScan;
                return prevYearlyData;
            });

            setMonthlyData((prevMonthlyData) => {
                prevMonthlyData[yearIndex][monthIndex][dateIndex].count++;
				// prevMonthlyData[yearIndex][monthIndex][dateIndex].count = todayScan;
                return prevMonthlyData;
            });

            if(el.timestamp.slice(0, 10) === moment(Date.now()).format('YYYY-MM-DD')) {
                todayScan++;
            }
		});

        setTodayScan(todayScan);
	}, [IPsData]);

	return (
		<ScanGraphContext.Provider
			value={{
				scanFilter,
				setScanFilter,
				yearly,
				setYearly,
				monthNames,
				yearlyData,
				monthlyData,
                todayScan
			}}
		>
			{children}
		</ScanGraphContext.Provider>
	);
};

const useScanGraph = () => useContext(ScanGraphContext);

export { ScanGraphProvider, useScanGraph };

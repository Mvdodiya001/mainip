import React from 'react';
import { useRunningAppContext } from '../Context/RunningAppContext';
import { Form } from 'react-bootstrap';

const ThirdPartyAppsList = () => {
	const {
		thirdPartyApps,
		selectedAppList,
		setSelectedAppList,
		showRunningApps,
		setShowRunningApps,
	} = useRunningAppContext();

	const handleAppSelection = (e) => {
		if (e.target.checked) {
			setSelectedAppList([...selectedAppList, e.target.id]);
		} else {
			setSelectedAppList(
				selectedAppList.filter((el) => el !== e.target.id)
			);
		}
	};

	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedAppList(thirdPartyApps.map(([pkg, running]) => pkg));
		} else {
			setSelectedAppList([]);
		}
	};

	const handleChange = (e) => {
		// console.log(e.target.value);
	};

	return (
		<div className='third-party-apps'>
			<div className='third-party-apps-header'>
				<Form.Check 
                    type='switch' 
                    label={'Third Party Apps' + (showRunningApps ? ' (Running)' : ' (Installed)')}
                    id='third-party-apps'
                    onClick={() => setShowRunningApps(!showRunningApps)}
                    checked={showRunningApps}
                    onChange={handleChange}
                />
			</div>
			<div className='third-party-apps-list'>
				<Form.Check
					type='checkbox'
					label='Select All'
					className='third-party-apps-list-item'
					id='select-all'
					onClick={handleSelectAll}
				/>
				{thirdPartyApps.map(([pkg, running], index) => {
					if(showRunningApps) {
                        if(running) {
                            return (
                                <Form.Check
                                    type='checkbox'
                                    label={pkg}
                                    className='third-party-apps-list-item'
                                    id={pkg}
                                    onClick={handleAppSelection}
                                    key={index}
                                    checked={selectedAppList.includes(pkg)}
                                    onChange={handleChange}
                                />
                            );
                        }
                        return null;
                    }

                    return (
                        <Form.Check
							type='checkbox'
							label={pkg}
							className='third-party-apps-list-item'
							id={pkg}
							onClick={handleAppSelection}
							key={index}
							checked={selectedAppList.includes(pkg)}
							onChange={handleChange}
						/>
                    );
				})}
			</div>
		</div>
	);
};

export default ThirdPartyAppsList;

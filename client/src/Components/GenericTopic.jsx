import React from 'react';
import { useMosquitto } from '../Context/MosquittoContext';

export default function GenericTopic(props) {
	const {
		mosquittoSubs,
		setMosquittoSubs,
		mosquittoPubs,
		setMosquittoPubs,
		mosquittoSubsData,
		mosquittoPubsData,
	} = useMosquitto();

	const handleChangeValues = (e, type) => {
		if (type === 'subs') {
			setMosquittoSubs({
				...mosquittoSubs,
				[e.target.name]: e.target.value,
			});
		} else if (type === 'pubs') {
			setMosquittoPubs({
				...mosquittoPubs,
				[e.target.name]: e.target.value,
			});
		}
	};

	return (
		<div className='mosquitto-generic-topic'>
			<div className='mosquitto-input'>
				<form className='mosquitto-input-subs'>
					<div className='form-input'>
						<label>Username: </label>
						<input
							type='text'
							name='username'
							value={mosquittoSubs.username}
							onChange={(e) => handleChangeValues(e, 'subs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Password: </label>
						<input
							type='text'
							name='password'
							value={mosquittoSubs.password}
							onChange={(e) => handleChangeValues(e, 'subs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Topic: </label>
						<input
							type='text'
							name='topic'
							value={mosquittoSubs.topic}
							onChange={(e) => handleChangeValues(e, 'subs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Message: </label>
						<input
							type='text'
							name='message'
							value={mosquittoSubs.message}
							onChange={(e) => handleChangeValues(e, 'subs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>IP Address: </label>
						<input
							type='text'
							name='ip'
							value={mosquittoSubs.ip}
							onChange={(e) => handleChangeValues(e, 'subs')}
							required
						/>
					</div>
				</form>
				<form className='mosquitto-input-pubs'>
					<div className='form-input'>
						<label>Username: </label>
						<input
							type='text'
							name='username'
							value={mosquittoPubs.username}
							onChange={(e) => handleChangeValues(e, 'pubs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Password: </label>
						<input
							type='text'
							name='password'
							value={mosquittoPubs.password}
							onChange={(e) => handleChangeValues(e, 'pubs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Topic: </label>
						<input
							type='text'
							name='topic'
							value={mosquittoPubs.topic}
							onChange={(e) => handleChangeValues(e, 'pubs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>Message: </label>
						<input
							type='text'
							name='message'
							value={mosquittoPubs.message}
							onChange={(e) => handleChangeValues(e, 'pubs')}
							required
						/>
					</div>
					<div className='form-input'>
						<label>IP Address: </label>
						<input
							type='text'
							name='ip'
							value={mosquittoPubs.ip}
							onChange={(e) => handleChangeValues(e, 'pubs')}
							required
						/>
					</div>
				</form>
			</div>
			<div className='mosquitto-output'>
				<div className='mosquitto-output-sub'>
					{mosquittoSubsData.split('\n').map((line, index) => {
						return <div key={index}>{line}</div>;
					})}
				</div>
				<div className='mosquitto-output-pub'>
					{mosquittoPubsData.split('\n').map((line, index) => {
						return <div key={index}>{line}</div>;
					})}
				</div>
			</div>
		</div>
	);
}

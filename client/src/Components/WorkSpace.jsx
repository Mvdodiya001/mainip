import React from 'react';
import { Container, NavDropdown, Button } from 'react-bootstrap';

import WorkSpaceTable from './WorkSpaceTable';
import { useData } from '../Context/DataContext';
import { useModalContext } from '../Context/ModalContext';
import '../Styles/workspace.css';

export default function WorkSpace(props) {
	const {
		handleScanRequestAll,
		networkInterfaces,
		editNetworkInterfaces,
		setEditNetworkInterfaces,
		currentNetworkInterface,
		setCurrentNetworkInterface,
		handleGetNetworkInterfaces,
		handleSetNetworkInterface,
	} = useData();
	const { handleModalOpen } = useModalContext();

	return (
		<Container className='workspace-container--outside my-3'>
			<div className='workspace-heading-circle'>
				<span className='workspace-heading'>
					IoT SECURITY LAB - IIIT Allahabad
				</span>
			</div>
			<Container className='workspace-container--inside-top rounded p-2'>
				<Container className='workspace-container--buttons'>
					<Container className='workspace-container--buttons-left'>
						<NavDropdown
							title={
								<>
									<span>New Scan</span>
									&nbsp;&nbsp;
									<i className='fa-solid fa-add'></i>
								</>
							}
							id='collasible-nav-dropdown'
							className='new-scan-button'
							drop='down-centered'
						>
							<NavDropdown.Item
								onClick={handleScanRequestAll.bind(
									this,
									'single'
								)}
							>
								Scan Router (Single Threaded)
							</NavDropdown.Item>
							<NavDropdown.Item
								onClick={handleScanRequestAll.bind(
									this,
									'multiple'
								)}
							>
								Scan Router (Multi Threaded)
							</NavDropdown.Item>
							<NavDropdown.Item
								onClick={handleModalOpen.bind(this, 'single')}
							>
								Single IP Scan
							</NavDropdown.Item>
							<NavDropdown.Item
								onClick={handleModalOpen.bind(this, 'multiple')}
							>
								Multiple IP Scan
							</NavDropdown.Item>
						</NavDropdown>
					</Container>
					<Container className='workspace-container--buttons-right'>
						<select
							name='network-'
							id='network-interface'
							className='form-select interface-select'
							disabled={!editNetworkInterfaces}
							onChange={(e) => {
								setCurrentNetworkInterface(e.target.value);
							}}
							value={currentNetworkInterface}
							required={true}
						>
							<option value=''>Select Network Interface</option>
							{networkInterfaces.map((interfaceName, index) => {
								return (
									<option key={index} value={interfaceName}>
										{interfaceName}
									</option>
								);
							})}
						</select>
						{editNetworkInterfaces ? (
							<Button
								variant='outline-primary'
								onClick={(e) => {
									if (currentNetworkInterface === '') {
										return;
									}
									setEditNetworkInterfaces(false);
									handleSetNetworkInterface(
										currentNetworkInterface
									);
								}}
							>
								<span>Save</span>
							</Button>
						) : (
							<Button
								variant='outline-primary'
								onClick={(e) => {
									setEditNetworkInterfaces(true);
									handleGetNetworkInterfaces();
								}}
							>
								<span>Edit</span>
							</Button>
						)}
					</Container>
				</Container>
				<Container className='workspace-container--inside'>
					<div className='workspace-container--table-div '>
						<WorkSpaceTable />
					</div>
				</Container>
			</Container>
		</Container>
	);
}




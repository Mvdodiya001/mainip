import React from 'react';
import './../Styles/navbar.css';
import { Navbar, Nav } from 'react-bootstrap';
import NavDropdown from 'react-bootstrap/NavDropdown';






function ColorSchemesExample() {


	const handleNucleiClick = async () => {
		try {
			const response = await fetch('http://127.0.0.1:3000/run-app', {  // Make sure this URL is correct
				method: 'POST',
			});

			if (!response.ok) { // Check if the response is OK (status in the range 200-299)
				const errorText = await response.text(); // Get the error response as text
				throw new Error(errorText);
			}

			const data = await response.json();
			alert(data.message); // Show success or error message
		} catch (error) {
			alert('Error: ' + error.message);
		}
	};



	return (
		<Navbar collapseOnSelect expand='lg' className='nav'>
			<Navbar.Toggle aria-controls='responsive-navbar-nav' />
			<Navbar.Collapse id='responsive-navbar-nav'>
				<Nav className='me-auto'>
					<Nav.Link href='/' className='nav-links'>
						Workspace
					</Nav.Link>
					<Nav.Link href='#Progress' className='nav-links'>
						Progress
					</Nav.Link>
					<Nav.Link href='#Execute' className='nav-links'>
						Execute
					</Nav.Link>
					<NavDropdown
						title='Utility'
						id='basic-nav-dropdown'
						className='nav-links'
					>
						<NavDropdown.Item href='/memory-usage'>
							App Memory Usage
						</NavDropdown.Item>
						<NavDropdown.Item href='/network-graph'>
							Network Graph
						</NavDropdown.Item>
						<NavDropdown.Item href='/running-app-status'>
							Running App Status
						</NavDropdown.Item>
						<NavDropdown.Item href='/mosquitto'>
							Mosquitto
						</NavDropdown.Item>
						<NavDropdown.Item href='/coap'>
							CoAP
						</NavDropdown.Item>
						<NavDropdown.Item onClick={() => window.open('http://127.0.0.1:5000', '_blank')}>
							Nuclei
						</NavDropdown.Item>
						<NavDropdown.Item href='/serverfingerprint'>
						Server Finger Printing

							
						</NavDropdown.Item>



						{/* <NavDropdown.Item href='/Mobile-Monitoring-Services'> */}
						{/* <NavDropdown.Item href='http://localhost:3001/' target="_blank" rel="noopener noreferrer">
						
							Mobile Monitoring Services
						</NavDropdown.Item> */}
					</NavDropdown>
				</Nav>
				<Nav className='nav-buttons'>
					<div className='nav-button'>
						<button className='sign-in-button'> Sign-in </button>
					</div>
					<div className='nav-button'>
						<button className='sign-up-button'> Sign-up </button>
					</div>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}

export default ColorSchemesExample;
import React from 'react';
import { useLocation } from 'react-router-dom';
import '../Styles/footer.css';

export default function Footer() {
	const location = useLocation();

	// Hide footer on CVE Analysis page
	if (location.pathname.startsWith('/cve/')) {
		return null;
	}

	return (
		<footer className='footer'>
			<span className='footer-text'>
				Funded by C3iHUB Lab, IIT Kanpur
			</span>
		</footer>
	);
}

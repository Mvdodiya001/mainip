// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import './App.css';
// import Home from './Components/Home';
// import Report from './Components/Report';
// import FormattedReport from './Components/FormattedReport';
// import MemoryUsage from './Components/MemoryUsage';
// import NetworkGraph from './Components/NetworkGraph';
// import RunningAppStatus from './Components/RunningAppStatus';
// import Mosquitto from './Components/Mosquitto';
// import CoAP from './Components/CoAP';
// import Deauth from './Components/Deauth';

// import Navbar from './Components/Navbar';
// import Footer from './Components/Footer';
// import ErrorDisplay from './Components/ErrorDisplay';
// function App() {
// 	return (
// 		<div className='App'>
// 			{/* < onClick={handleClick}>Click me</button> */}
// 			<ErrorDisplay />
// 			<Navbar />
// 			<Router>
// 				<Routes>
// 					<Route path='/' element={<Home />} />
// 					<Route path='/reports/:id' element={<Report />} />
// 					<Route path='/memory-usage' element={<MemoryUsage />} />
// 					<Route path='/network-graph' element={<NetworkGraph />} />
// 					<Route path='/running-app-status' element={<RunningAppStatus />} />
// 					<Route path='/mosquitto' element={<Mosquitto />} />
// 					<Route path='/coap' element={<CoAP />} />
// 					<Route path='/temp' element={<FormattedReport />} />
// 					<Route path='/deauth' element={<Deauth/>} />
// 				</Routes>
// 			</Router>
// 			<Footer />
// 		</div>
// 	);
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Components/Home';
import Report from './Components/Report';
import FormattedReport from './Components/FormattedReport';
import MemoryUsage from './Components/MemoryUsage';
import NetworkGraph from './Components/NetworkGraph';
import RunningAppStatus from './Components/RunningAppStatus';
import Mosquitto from './Components/Mosquitto';
import CoAP from './Components/CoAP';
import Deauth from './Components/Deauth';

import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import ErrorDisplay from './Components/ErrorDisplay';
// import MobileMonitoringServices from './Components/MobileMonitoringServices';
// import CameraObservation from './Components/CameraObservation';
// import AudioObservation from './Components/AudioObservation';
// import APKScanner from './Components/APKScanner';
import UrlDetection from './Components/UrlDetection';
import Communication from './Components/Communication';
import CveAnalysis from './Components/CveAnalysis';
import CveDetail from './Components/CveDetail';
import PcapUploader from './Components/PacpUploader';
import UrlAndPacketSummary from './Components/UrlAndPacketSummary';
import ServerFingerprinting from './Components/serverfinger';
import FirmwareAnalyzer from './Components/FirmwareAnalyzer';

function App() {
	return (
		<div className='App'>
			{/* <button onClick={handleClick}>Click me</button> */}
			<ErrorDisplay />
			<Navbar />
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/reports/:id' element={<Report />} />
					<Route path='/memory-usage' element={<MemoryUsage />} />
					<Route path='/network-graph' element={<NetworkGraph />} />
					<Route path='/running-app-status' element={<RunningAppStatus />} />
					<Route path='/mosquitto' element={<Mosquitto />} />
					<Route path='/coap' element={<CoAP />} />

					<Route path='/temp' element={<FormattedReport />} />
					<Route path='/deauth' element={<Deauth />} />
					<Route path='/serverfingerprint' element={<ServerFingerprinting />} />
					<Route path='/firmware-analyzer' element={<FirmwareAnalyzer />} />




					{/* <Route path="/Mobile-Monitoring-Services" element={<MobileMonitoringServices />} />
                    <Route path="/memory-usage" element={<MemoryUsage />} />
                    <Route path="/running-app-status" element={<RunningAppStatus />} />
                    <Route path="/camera-observation" element={<CameraObservation />} />
                    <Route path="/audio-observation" element={<AudioObservation />} />
                    <Route path="/apk-scanner" element={<APKScanner />} />*/}
					<Route path='/url-detection' element={<UrlDetection />} />
					<Route path='/communication-data' element={<Communication />} />
					<Route path='/cve/:id' element={<CveAnalysis />} />
					<Route path='/cve-detail/:cveId' element={<CveDetail />} />
					<Route path='/pacp-uploader' element={<PcapUploader />} />
					<Route path="/analysis" element={<UrlAndPacketSummary />} />


				</Routes>
			</Router>
			<Footer />
		</div>
	);
}

export default App;

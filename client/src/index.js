// import React from 'react';
// import ReactDOM from 'react-dom/client';

// import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css';
// import App from './App';

// import Compose from './Context/Compose';
// import { DataProvider } from './Context/DataContext';
// import { ModalUtility } from './Context/ModalContext';
// import { NetworkGraphUtility } from './Context/NetworkGraphContext';
// import { ErrorHandlerUtility } from './Context/ErrorContext';
// import { RunningAppUtility } from './Context/RunningAppContext';
// import { WorkSpaceProvider } from './Context/WorkSpaceContext';
// import { ScanGraphProvider } from './Context/ScanGraphContext';
// import { MosquittoProvider } from './Context/MosquittoContext';
// import { CoAPProvider } from './Context/CoAPContext';
// import { DeauthProvider } from './Context/DeauthContext';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
// 	<Compose
// 		components={[
// 			ErrorHandlerUtility,
// 			DataProvider,
// 			DeauthProvider,
// 			RunningAppUtility,
// 			NetworkGraphUtility,
// 			ModalUtility,
// 			ScanGraphProvider,
// 			WorkSpaceProvider,
// 			MosquittoProvider,
// 			CoAPProvider,
// 		]}
// 	>
// 		<App />
// 	</Compose>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';

import Compose from './Context/Compose';
import { DataProvider } from './Context/DataContext';
import { ModalUtility } from './Context/ModalContext';
import { NetworkGraphUtility } from './Context/NetworkGraphContext';
import { ErrorHandlerUtility } from './Context/ErrorContext';
import { RunningAppUtility } from './Context/RunningAppContext';
import { WorkSpaceProvider } from './Context/WorkSpaceContext';
import { ScanGraphProvider } from './Context/ScanGraphContext';
import { MosquittoProvider } from './Context/MosquittoContext';
import { CoAPProvider } from './Context/CoAPContext';
import { DeauthProvider } from './Context/DeauthContext';
// import { CameraObservationProvider } from './Context/CameraObservationContext';
// import { AudioObservationProvider } from './Context/AudioObservationContext';
// import { ScannerUtility } from './Context/ScannerContext';
// import { MobileMonitoringServices } from './components/MobileMonitoringServices';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<Compose
		components={[
			ErrorHandlerUtility,
			DataProvider,
			DeauthProvider,
			RunningAppUtility,
			NetworkGraphUtility,
			ModalUtility,
			ScanGraphProvider,
			WorkSpaceProvider,
			MosquittoProvider,
			CoAPProvider,

			// ScannerUtility,
			// RunningAppUtility,
			// CameraObservationProvider,
			// AudioObservationProvider,
			// MobileMonitoringServices,

			
		]}
	>
		<App />
	</Compose>
);

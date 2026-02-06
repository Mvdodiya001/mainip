// import React, { useEffect, useState } from 'react';
// import { Container } from 'react-bootstrap';
// import { socket } from '../Context/Socket';
// import '../Styles/url.css';

// const UrlDetection = ({ ip, InterF }) => {
//     const [dataList, setDataList] = useState([]);

//     useEffect(() => {
//         // Set up the socket listener
//         socket.on('urls', (data) => {
//             console.log(data);
//             setDataList((prevDataList) => [...prevDataList, JSON.parse(data)]);
//         });

//         // Cleanup the listener on unmount
//         return () => {
//             socket.off('urls');
//         };
//     }, []);

//     return (
//         <div className='url-container'>
//             <Container>
//                 <div className='report-container-heading' style={{ display: 'flex' }}>
//                     <div className='report-container-heading-text'>URL Detection</div>
//                 </div>
                
//                 <div className='url-display'>
//                     {/* <div className='coap-entity coap-client'>
//                         {dataList.map((data, idx) => (
//                             <h6 key={idx}>{data}</h6>
//                         ))}
//                     </div> */}
//                 </div>
//             </Container>
//         </div>
//     );
// };

// export default UrlDetection;






// import React, { useState } from 'react';
// import axios from 'axios';
// import '../Styles/urldetection.css';

// const UrlDetection = () => {
//     const [file, setFile] = useState(null);
//     const [urlData, setUrlData] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             setError('Please select a file first.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('pcapFile', file);
//               console.log("hola");
//         try {
//             setLoading(true);
//             setError(null);
//             const response = await axios.post('http://localhost:8000/upload-pcap', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 },
//                 responseType: 'text'
//             });
//             setUrlData(response.data);
//         } catch (err) {
//             console.error(err);
//             setError('Error uploading and processing the PCAP file. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="pcap-uploader">
//             <h2>PCAP File Upload and Analysis</h2>
//             <input type="file" onChange={handleFileChange} accept=".pcap" />
//             <button onClick={handleUpload} disabled={loading}>
//                 {loading ? 'Processing...' : 'Upload and Analyze'}
//             </button>
//             {error && <p className="error">{error}</p>}
//             {urlData && (
//                 <div className="url-container">
//                     <h4>URL Detection Results</h4>
//                     <div className="coap-entity coap-client">
//                         {urlData}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default UrlDetection;






import React, { useState, useRef } from 'react';
import '../Styles/urldetection.css';

const UrlDetection = () => {
    const [file, setFile] = useState(null);
    const [urlData, setUrlData] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.pcap')) {
            setFile(droppedFile);
            setError(null);
            setSuccess(false);
        } else {
            setError('Please drop a valid .pcap file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('pcapFile', file);

        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:8000/upload-pcap', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }

            const data = await response.text();
            setUrlData(data);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Error uploading and processing the PCAP file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="random-uploader">
        <h2>PCAP File Analysis</h2>
        <div 
            className="drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <div className="icon-placeholder"></div>
            <p>{file ? file.name : 'Drag & drop your PCAP file here or click to browse'}</p>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept=".pcap"
                style={{ display: 'none' }}
            />
        </div>
        <button onClick={handleUpload} disabled={loading || !file} className="submit-button">
            {loading ? 'Processing...' : 'Analyze PCAP'}
        </button>
        {error && (
            <div className="notification error">
                <strong>Error:</strong> {error}
            </div>
        )}
        {success && (
            <div className="notification success">
                <strong>Success:</strong> PCAP file analyzed successfully.
            </div>
        )}
        {urlData && (
            <div className="result-container">
                <h4>URL Detection Results</h4>
                <div className="data-display client">
                    <pre>{urlData}</pre>
                </div>
            </div>
        )}
    </div>
    
    );
};

export default UrlDetection;
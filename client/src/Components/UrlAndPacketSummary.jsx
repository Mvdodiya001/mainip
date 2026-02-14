import React, { useEffect, useState } from 'react';
import { socket } from '../Context/Socket';
import axios from 'axios';
import '../Styles/UrlAndPacketSummary.css';

const ComprehensiveNetworkAnalysis = () => {
    // States for Communication component
    const [outputList, setOutputList] = useState([]);
    const [communicatingIP, setCommunicatingIP] = useState("Please Wait!");
    const [sourceIP, setSourceIP] = useState("");

    // States for UrlAndPacketSummary component
    const [dataList, setDataList] = useState([]);
    const [encryptedCount, setEncryptedCount] = useState(0);
    const [unencryptedCount, setUnencryptedCount] = useState(0);
    const [undeterminedCount, setUndeterminedCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [urlData, setUrlData] = useState('');


    const handleFetchAndDetectUrl = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/detect-url', { responseType: 'text' });

            // Process the response as needed
            console.log(response.data); // Output from the script
            // You can update your state or handle the data as necessary
            // const ud = response.data;
            setUrlData(response.data);

        } catch (err) {
            console.error(err);
            setError('Error fetching or detecting URLs. Please try again.');

        } finally {
            setLoading(false);
        }
    };


    const handleFetchAndProcess = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/process-pcap', { responseType: 'json' });
            console.log(response);
            // setDataList(response.data);

            // Calculate summary metrics
            const encryptedCount = response.data.filter(packet => packet.encryption_score >= 0.8).length;
            const unencryptedCount = response.data.filter(packet => packet.encryption_score <= 0.5).length;
            const undeterminedCount = response.data.length - encryptedCount - unencryptedCount;
            console.log('encrypt value', encryptedCount, unencryptedCount, undeterminedCount);
            setEncryptedCount(encryptedCount);
            setUnencryptedCount(unencryptedCount);
            setUndeterminedCount(undeterminedCount);
            console.log('hii');

        } catch (err) {
            console.error(err);
            setError('Error fetching or processing PCAP file. Please try again.');
            // setTimeout(() => {
            //     setError(null);
            // }, 5000);
        } finally {
            setLoading(false);
        }
    };



    // State for firmware analysis results
    const [firmwareData, setFirmwareData] = useState(null);

    useEffect(() => {
        const handleCommunication = (data) => {
            console.log('Received data:', data);
            try {
                const parsedData = JSON.parse(data);
                console.log('parsed data:', parsedData);
                setOutputList((prevOutputList) => [...prevOutputList, parsedData]);

                if (parsedData.type === 'success') {
                    setCommunicatingIP(parsedData.message);
                    handleFetchAndProcess();
                    // const urlData = { ip_address: sourceIP, network_interface: "dfsdf" };
                    // socket.emit('url_detection', urlData);

                    // UrlDetection();
                    // console.log("bye");
                    handleFetchAndDetectUrl();
                }

                if (parsedData.type === 'source_ip') {
                    setSourceIP(parsedData.message);
                }
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        };

        const handleFirmwareReport = (data) => {
            console.log('Received firmware report:', data);
            setFirmwareData(data);
        };

        socket.on('comm', handleCommunication);
        socket.on('firmware_report', handleFirmwareReport);

        return () => {
            socket.off('comm', handleCommunication);
            socket.off('firmware_report', handleFirmwareReport);
        };
    }, []);

    // //     return (
    // //         <div className="comprehensive-network-analysis">
    // //             <h1 className="main-title">Comprehensive Network Analysis Dashboard</h1>

    // //             {loading && <p>Loading data...</p>}
    // //             {error && <p className="error">{error}</p>}

    // //             <section className="communication-section">
    // //                 <h2>Communication Data</h2>
    // //                 <h3>Source IP: {sourceIP}</h3>
    // //                 <div className="communication-container">
    // //                     <div className="horizontal-boxes">
    // //                         <div className="box communicating-ip">
    // //                             <h5>Communicating IP</h5>
    // //                             <p>{communicatingIP}</p>
    // //                         </div>
    // //                         <div className="box spoofing-ip">
    // //                             <h5>Spoofing IP</h5>
    // //                             <div className="output-container">
    // //                                 {outputList.map((data, idx) => (
    // //                                     <pre key={idx}>{data.message}</pre>
    // //                                 ))}
    // //                             </div>
    // //                         </div>
    // //                     </div>
    // //                 </div>
    // //             </section>

    // //             <section className="url-packet-summary-section">
    // //                 <h2>URL and Packet Summary</h2>
    // //                 <div className="packet-summary">
    // //                     <h4>Packet Summary</h4>
    // //                     <ul>
    // //                         <li>Encrypted Packets: {encryptedCount}</li>
    // //                         <li>Unencrypted Packets: {unencryptedCount}</li>
    // //                         <li>Undetermined Packets: {undeterminedCount}</li>
    // //                     </ul>
    // //                 </div>
    // //                 <div className='url-display'>
    // //                     <div className='coap-entity coap-client'>
    // //                     {urlData}
    // //                     </div>
    // //                 </div>
    // //             </section>
    // //         </div>
    // //     );
    // // };

    //export default ComprehensiveNetworkAnalysis;


    return (
        <div className="dashboard-container">
            <h1 className="main-title">Network Analysis Dashboard</h1>

            {loading && <p>Loading data...</p>}
            {error && <p className="error-notification">{error}</p>}

            <section className="communication-data-section">
                <h2 className='cdata'>Communication Data</h2>
                <h3>Source IP: {sourceIP}</h3>
                <div className="communication-data-wrapper">
                    <div className="card source-ip-card">
                        <h5 className='hfive'>Communicating IP</h5>
                        <p>{communicatingIP}</p>
                    </div>
                    <div className="card spoofed-ip-card">
                        <h5 className='hfive'>Spoofing IPs</h5>
                        <div className="output-area">
                            {outputList.map((data, idx) => (
                                <pre key={idx}>{data.message}</pre>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="summary-section">
                <div className='summary-wrapper'>
                    <div className="encryption-summary-box">
                        <h4 className='hfour'>Encryption Summary</h4>
                        <ul>
                            <li>Encrypted Packets: {encryptedCount}</li>
                            <li>Unencrypted Packets: {unencryptedCount}</li>
                            <li>Undetermined Packets: {undeterminedCount}</li>
                        </ul>
                    </div>
                    <div className='url-summary-box'>
                        <h4 className='hfour'>Url Detection</h4>
                        <div className='coap-entity coap-client'>
                            {urlData}
                        </div>
                    </div>

                </div>

                {/* Firmware Analysis Section - Moved to bottom full width */}
                <div className='firmware-summary-box' style={{ width: '100%', marginTop: '30px', backgroundColor: '#e9ecef', borderRadius: '8px', padding: '15px' }}>
                    <h4 className='hfour'>Firmware Analysis</h4>
                    <div className='firmware-content' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {firmwareData ? (
                            <>
                                {firmwareData.versions && firmwareData.versions.length > 0 ? (
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {firmwareData.versions.map((ver, idx) => (
                                            <li key={idx} style={{ wordBreak: 'break-all' }}>{ver}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No firmware versions found.</p>
                                )}
                                <small className="text-muted" style={{ display: 'block', marginTop: '10px', fontSize: '0.8em', color: '#6c757d' }}>
                                    Hash: {firmwareData.integrity_hash?.substring(0, 16)}...
                                </small>
                            </>
                        ) : (
                            <p style={{ fontStyle: 'italic', color: '#666' }}>Waiting for analysis...</p>
                        )}
                    </div>
                </div>
            </section>
        </div>

    );
};

export default ComprehensiveNetworkAnalysis;











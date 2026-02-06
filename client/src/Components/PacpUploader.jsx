import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/PcapUploader.css'; // Import the CSS file

const PcapUploader = () => {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedPacket, setExpandedPacket] = useState(null); // Track expanded packet
    const [summary, setSummary] = useState({ encrypted: 0, unencrypted: 0, undetermined: 0 }); // Summary state

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResponse(null);
        setError(null);
        setSummary({ encrypted: 0, unencrypted: 0, undetermined: 0 }); // Reset summary on new file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a PCAP file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('pcap', file);

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse(res.data); // Assume res.data is an array of packets

            // Calculate summary metrics
            const encryptedCount = res.data.filter(packet => packet.encryption_score >= 0.8).length;
            const unencryptedCount = res.data.filter(packet => packet.encryption_score <= 0.5).length;
            const undeterminedCount = res.data.length - encryptedCount - unencryptedCount;

            setSummary({ encrypted: encryptedCount, unencrypted: unencryptedCount, undetermined: undeterminedCount });
        } catch (err) {
            setError('Error uploading file. Please try again.');
            // Remove the error message after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const togglePacketDetails = (packetNumber) => {
        setExpandedPacket(expandedPacket === packetNumber ? null : packetNumber);
    };

    const getPacketStatus = (encryptionScore) => {
        if (encryptionScore >= 0.8) {
            return 'Encrypted';
        } else if (encryptionScore <= 0.5) {
            return 'Unencrypted';
        } else {
            return 'Undetermined';
        }
    };

    // Separate packets by their status
    const separatedPackets = {
        encrypted: [],
        unencrypted: [],
        undetermined: []
    };

    if (response) {
        response.forEach(packet => {
            const status = getPacketStatus(packet.encryption_score);
            separatedPackets[status.toLowerCase()].push(packet);
        });
    }

    return (
        <div className="pcap-container">
            <h2>Upload PCAP File</h2>
            <div className='summary-container'>
                <form onSubmit={handleSubmit} className="upload-section">
                    <input type="file" accept=".pcap" onChange={handleFileChange} />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
                <div className="summary-section">
                    <h3>Summary</h3>
                    <p>Encrypted Packets: {summary.encrypted}</p>
                    <p>Unencrypted Packets: {summary.unencrypted}</p>
                    <p>Undetermined Packets: {summary.undetermined}</p>
                </div>
            </div>

            <div className="main-content">
                <div className="left-half">
                    <h3>Unencrypted Packets</h3>
                    {separatedPackets.unencrypted.length > 0 ? (
                        separatedPackets.unencrypted.map((packet, index) => (
                            <div key={index} className="packet-container">
                                <div className="packet-summary" onClick={() => togglePacketDetails(packet.packet_number)}>
                                    <h4>Packet #{packet.packet_number}</h4>
                                    <p>Protocol: {packet.protocol}</p>
                                    <p>Payload Length: {packet.payload_length}</p>
                                    <p>Encryption Score: {packet.encryption_score }</p>
                                    <p>Status: {getPacketStatus(packet.encryption_score)}</p>
                                </div>

                                {expandedPacket === packet.packet_number && (
                                    <div className="packet-details">
                                        <h5>Packet Details</h5>
                                        {packet.payload_length === 0 ? (
                                            <p>No payload available</p>
                                        ) : (
                                            <>
                                                <pre>Payload: {packet.payload ? packet.payload : 'No payload available'}</pre>
                                                <h6>Results</h6>
                                                <ul>
                                                    <li>Byte Entropy: {packet.results?.byte_entropy ? 'True' : 'False'}</li>
                                                    <li>Bigram Entropy: {packet.results?.bigram_entropy ? 'True' : 'False'}</li>
                                                    <li>Trigram Entropy: {packet.results?.trigram_entropy ? 'True' : 'False'}</li>
                                                    <li>Chi Square: {packet.results?.chi_square ? 'True' : 'False'}</li>
                                                    <li>Low Printable Ratio: {packet.results?.low_printable_ratio ? 'True' : 'False'}</li>
                                                </ul>
                                                <h6>Method Values</h6>
                                                <ul>
                                                    <li>Byte Entropy Value: {packet.method_values?.byte_entropy !== null ? packet.method_values.byte_entropy.toFixed(3) : 'N/A'}</li>
                                                    <li>Bigram Entropy Value: {packet.method_values?.bigram_entropy !== null ? packet.method_values.bigram_entropy.toFixed(3) : 'N/A'}</li>
                                                    <li>Trigram Entropy Value: {packet.method_values?.trigram_entropy !== null ? packet.method_values.trigram_entropy.toFixed(3) : 'N/A'}</li>
                                                    <li>Chi Square Value: {packet.method_values?.chi_square !== null ? packet.method_values.chi_square.toFixed(2) : 'N/A'}</li>
                                                    <li>Printable Ratio: {packet.method_values?.printable_ratio !== null ? packet.method_values.printable_ratio.toFixed(2) : 'N/A'}</li>
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No unencrypted packets to display</p>
                    )}
                </div>

                <div className="right-half">
                    <div className="top-right">
                        <h3>Encrypted Packets</h3>
                        {separatedPackets.encrypted.length > 0 ? (
                            separatedPackets.encrypted.map((packet, index) => (
                                <div key={index} className="packet-container">
                                    <div className="packet-summary" onClick={() => togglePacketDetails(packet.packet_number)}>
                                        <h4>Packet #{packet.packet_number}</h4>
                                        <p>Protocol: {packet.protocol}</p>
                                        <p>Payload Length: {packet.payload_length}</p>
                                        <p>Encryption Score: {packet.encryption_score}</p>
                                        <p>Status: {getPacketStatus(packet.encryption_score)}</p>
                                    </div>
                                    {expandedPacket === packet.packet_number && (
                                        <div className="packet-details">
                                            <h5>Packet Details</h5>
                                            {packet.payload_length === 0 ? (
                                                <p>No payload available</p>
                                            ) : (
                                                <>
                                                    <pre>Payload: {packet.payload ? packet.payload : 'No payload available'}</pre>
                                                    <h6>Results</h6>
                                                    <ul>
                                                        <li>Byte Entropy: {packet.results?.byte_entropy ? 'True' : 'False'}</li>
                                                        <li>Bigram Entropy: {packet.results?.bigram_entropy ? 'True' : 'False'}</li>
                                                        <li>Trigram Entropy: {packet.results?.trigram_entropy ? 'True' : 'False'}</li>
                                                        <li>Chi Square: {packet.results?.chi_square ? 'True' : 'False'}</li>
                                                        <li>Low Printable Ratio: {packet.results?.low_printable_ratio ? 'True' : 'False'}</li>
                                                    </ul>
                                                    <h6>Method Values</h6>
                                                    <ul>
                                                        <li>Byte Entropy Value: {packet.method_values?.byte_entropy !== null ? packet.method_values.byte_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Bigram Entropy Value: {packet.method_values?.bigram_entropy !== null ? packet.method_values.bigram_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Trigram Entropy Value: {packet.method_values?.trigram_entropy !== null ? packet.method_values.trigram_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Chi Square Value: {packet.method_values?.chi_square !== null ? packet.method_values.chi_square.toFixed(2) : 'N/A'}</li>
                                                        <li>Printable Ratio: {packet.method_values?.printable_ratio !== null ? packet.method_values.printable_ratio.toFixed(2) : 'N/A'}</li>
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No encrypted packets to display</p>
                        )}
                    </div>

                    <div className="bottom-right">
                        <h3>Undetermined Packets</h3>
                        {separatedPackets.undetermined.length > 0 ? (
                            separatedPackets.undetermined.map((packet, index) => (
                                <div key={index} className="packet-container">
                                    <div className="packet-summary" onClick={() => togglePacketDetails(packet.packet_number)}>
                                        <h4>Packet #{packet.packet_number}</h4>
                                        <p>Protocol: {packet.protocol}</p>
                                        <p>Payload Length: {packet.payload_length}</p>
                                        <p>Encryption Score: {packet.encryption_score}</p>
                                        <p>Status: {getPacketStatus(packet.encryption_score)}</p>
                                    </div>
                                    {expandedPacket === packet.packet_number && (
                                        <div className="packet-details">
                                            <h5>Packet Details</h5>
                                            {packet.payload_length === 0 ? (
                                                <p>No payload available</p>
                                            ) : (
                                                <>
                                                    <pre>Payload: {packet.payload ? packet.payload : 'No payload available'}</pre>
                                                    <h6>Results</h6>
                                                    <ul>
                                                        <li>Byte Entropy: {packet.results?.byte_entropy ? 'True' : 'False'}</li>
                                                        <li>Bigram Entropy: {packet.results?.bigram_entropy ? 'True' : 'False'}</li>
                                                        <li>Trigram Entropy: {packet.results?.trigram_entropy ? 'True' : 'False'}</li>
                                                        <li>Chi Square: {packet.results?.chi_square ? 'True' : 'False'}</li>
                                                        <li>Low Printable Ratio: {packet.results?.low_printable_ratio ? 'True' : 'False'}</li>
                                                    </ul>
                                                    <h6>Method Values</h6>
                                                    <ul>
                                                        <li>Byte Entropy Value: {packet.method_values?.byte_entropy !== null ? packet.method_values.byte_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Bigram Entropy Value: {packet.method_values?.bigram_entropy !== null ? packet.method_values.bigram_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Trigram Entropy Value: {packet.method_values?.trigram_entropy !== null ? packet.method_values.trigram_entropy.toFixed(3) : 'N/A'}</li>
                                                        <li>Chi Square Value: {packet.method_values?.chi_square !== null ? packet.method_values.chi_square.toFixed(2) : 'N/A'}</li>
                                                        <li>Printable Ratio: {packet.method_values?.printable_ratio !== null ? packet.method_values.printable_ratio.toFixed(2) : 'N/A'}</li>
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No undetermined packets to display</p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default PcapUploader;















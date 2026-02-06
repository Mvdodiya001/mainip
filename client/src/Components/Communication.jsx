import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { socket } from '../Context/Socket';
import '../Styles/communication.css';

const Communication = () => {
    const [outputList, setOutputList] = useState([]);
    const [packetList, setPacketList] = useState([]); // New state for captured packets
    const [communicatingIP, setCommunicatingIP] = useState("Please Wait!"); // Default message
    const [sourceIP, setSourceIP] = useState(""); // New state for source IP

    useEffect(() => {
        // Set up the socket listener for incoming messages
        socket.on('comm', (data) => {
            console.log('Received data:', data); 
            try {
                const parsedData = JSON.parse(data); 
                setOutputList((prevOutputList) => [...prevOutputList, parsedData]);

                // Check if it's a success message and update the communicating IP
                if (parsedData.type === 'success') {
                    setCommunicatingIP(parsedData.message); // Set the successful IP
                }

                // If the type is related to the source IP, set the sourceIP state
                if (parsedData.type === 'source_ip') {
                    setSourceIP(parsedData.message); // Update source IP
                }

            } catch (error) {
                console.error('Error parsing data:', error);
            }
        });

        // Set up the socket listener for packet capture data
        socket.on('packet_capture', (packetData) => {
            console.log('Captured Packet:', packetData);
            setPacketList((prevPacketList) => [...prevPacketList, packetData]); // Append new packet data
        });

        // Cleanup the listener on unmount
        return () => {
            socket.off('comm');
            socket.off('packet_capture'); // Cleanup for packet capture listener
        };
    }, []);

//     return (
//         <div className='com'>
//             <h2 className='he'>Source IP: {sourceIP}</h2>  {/* Display the source IP here */}
//             <div className='container'>
//                 <div className='horizontal-boxes'>
//                     <div className='box communicating-ip'>
//                         <h5>Communicating IP</h5>
//                         <p>{communicatingIP}</p>  {/* Display the communicating IP */}
//                     </div>
//                     <div className='box spoofing-ip'>
//                         <h5 className='box2'>Spoofing IP</h5>
//                         {/* Display the output as a list */}
//                         <div className='output-container'>
//                             {outputList.map((data, idx) => (
//                                 <pre key={idx}> {data.message}</pre> // Display type and message
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//                 <div className='vertical-box'>
//                     <h4>Packet Capture</h4>
//                     <div className='packet-output'>
//                         {packetList.map((packet, index) => (
//                             <pre key={index}>{packet}</pre> // Display captured packets
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Communication;


return (
    <div className='communication'>
        <h2 className='title'>Source IP: {sourceIP}</h2>  {/* Display the source IP here */}
        <div className='main-container'>
            <div className='box-container'>
                <div className='box communicating-ip'>
                    <h5>Communicating IP</h5>
                    <p>{communicatingIP}</p>  {/* Display the communicating IP */}
                </div>
                <div className='box spoofing-ip'>
                    <h5 className='spoofing-title'>Spoofing IP</h5>
                    {/* Display the output as a list */}
                    <div className='output-area'>
                        {outputList.map((data, idx) => (
                            <pre key={idx}>{data.message}</pre> // Display type and message
                        ))}
                    </div>
                </div>
            </div>
            <div className='capture-area'>
                <h4>Packet Capture</h4>
                <div className='packet-list'>
                    {packetList.map((packet, index) => (
                        <pre key={index}>{packet}</pre> // Display captured packets
                    ))}
                </div>
            </div>
        </div>
    </div>
);
};

export default Communication;

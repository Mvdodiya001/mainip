














import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useCoAP } from '../Context/CoAPContext';
import '../Styles/coap.css';

const CoAP = () => {
    // Context and state management with error handling
    const {
        serverRunning,
        sendRequestToServer,
        clientOutput,
        serverOutput,
        attackerOutput,
        startServer,
        stopServer,
        startdos,
        stopdos,
        attackerdosOutput,
        Runningd,
        sendReplay,
        sendarp,
    } = useCoAP() || {}; // Provide default empty object to prevent destructuring errors

    const [url, setURL] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('server');
    const [attackType, setAttackType] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [interfaceName, setInterfaceName] = useState('');
    const [sour, setSour] = useState(''); // Add this line
    const [disti, setDisti] = useState(''); // Add this line
    const [error, setError] = useState(null);

    // Safe parsing of attacker output
    const parseAttackerOutput = (output) => {
        try {
            if (!output) return [];
            const parsed = JSON.parse(output);
            return parsed.Infomation ? parsed.Infomation.split('\\n') : [];
        } catch (err) {
            console.error('Error parsing attacker output:', err);
            return ['NO OUTPUT'];
        }
    };



    const parsedosOutput = (output) => {
        try {
            
            if (!output) return [];
            const parsed = JSON.parse(output);
            return parsed.Infomation ? parsed.Infomation.split('\\n') : [];
        } catch (err) {
            console.error('Error parsing attacker output:', err);
            return ['NO OUTPUT'];
        }
    };











    //correct
    const renderServerOutput = () => {
        if (!serverOutput || typeof serverOutput !== 'object') {
            return null;
        }

        return Object.values(serverOutput).map((request, indexReq) => {
            if (!request?.token || !Array.isArray(request.content)) {
                return null;
            }

            // console.log(serverOutput);

            return (
                <details className='coap-logs-details coap-server-logs-details' key={`Log-Request-${indexReq}`}>
                    <summary className='coap-logs-summary coap-server-logs-summary'>
                        Request with Token {request.token}
                    </summary>
                    {request.content.map((item, indexOuter) => (
                        item && (
                            <div className='coap-logs-message coap-server-logs-message' key={`Log-Item-${indexOuter}`}>
                                <h2 className='coap-logs-heading coap-server-logs-heading'>{item.title}</h2>
                                <table className='coap-logs-table coap-server-logs-table'>
                                    <thead>
                                        <tr>
                                            <th className='coap-logs-table-heading'>Key</th>
                                            <th className='coap-logs-table-heading'>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(item.content) && item.content.map((content, indexInner) => (
                                            <tr className='coap-logs-table-data' key={`Log-Value-${indexInner}`}>
                                                <td>{content?.key}</td>
                                                <td>{content?.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ))}
                </details>
            );
        });
    };







    
    // Safe handlers with error catching
    const handleAttackClick = (type) => {
        try {
            setAttackType(type);
            setError(null);
        } catch (err) {
            setError('Error setting attack type');
            console.error(err);
        }
    };

    const handleStartAttack = async (attackFunction) => {
        try {
            setError(null);
            await attackFunction();
        } catch (err) {
            setError(`Error starting attack: ${err.message}`);
            console.error(err);
        }
    };

    // Render functions with error boundaries









    const renderServerControls = () => (
        <div className='coap-entity coap-server'>
            <div className='coap-header coap-server-header'>
                <h1 className='coap-entity-heading coap-server-heading'>Server</h1>
                <div className={`coap-server-status coap-server-status--${serverRunning ? 'active' : 'inactive'}`}>
                    {serverRunning ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div className='coap-header-buttons coap-server-buttons'>
                <button 
                    className='coap-header-button coap-server-button--start' 
                    type='button' 
                    onClick={() => handleStartAttack(startServer)}
                    disabled={serverRunning}
                >
                    Start Server
                </button>
                <button 
                    className='coap-header-button coap-server-button--stop' 
                    type='button' 
                    onClick={() => handleStartAttack(stopServer)}
                    disabled={!serverRunning}
                >
                    Stop Server
                </button>
            </div>
            <div className='coap-logs coap-server-logs'>
                {renderServerOutput()}
            </div>
        </div>
    );

    const renderClientControls = () => (
        <div className='coap-entity coap-client'>
            <div className='coap-header coap-client-header'>
                <h1 className='coap-entity-heading coap-client-heading'>Client</h1>
            </div>
            <div className='coap-header-buttons coap-client-buttons'>
                <input
                    type='text'
                    placeholder='Enter the URL'
                    value={url}
                    onChange={(e) => setURL(e.target.value)}
                />
                <button
                    className='coap-header-button coap-client-button--start'
                    type='button'
                    onClick={() => handleStartAttack(() => sendRequestToServer('get', url))}
                    disabled={!url}
                >
                    Client GET
                </button>
            </div>
            <div className='coap-logs coap-client-logs'>
                {Array.isArray(clientOutput) && clientOutput.map((item, indexOuter) => (
                    <div className='coap-logs-message' key={`Log-Item-${indexOuter}`}>
                        <h2 className='coap-logs-heading'>{item?.title}</h2>
                        <table className='coap-logs-table'>
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(item?.content) && item.content.map((content, indexInner) => (
                                    <tr key={`Log-Value-${indexInner}`}>
                                        <td>{content?.key}</td>
                                        <td>{content?.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAttackerControls = () => (

        <div className='coap-entity coap-server'>
            <div className='coap-header coap-client-header'>
                <h1 className='coap-entity-heading coap-client-heading'>Attacker</h1>
                {error && <div className="error-message text-red-500 mt-2">{error}</div>}
            </div>
            <div className='coap-header-buttons coap-client-buttons'>
                <button
                    className='coap-header-button coap-client-button--start'
                    type='button'
                    onClick={() => handleAttackClick('dos')}
                >
                    DoS Attack
                </button>
                <button
                    className='coap-header-button coap-client-button--start'
                    type='button'
                    onClick={() => handleAttackClick('replay')}
                >
                    Replay Attack
                </button>
            </div>

            {attackType === 'dos' && (
                <div className='coap-dos-attack'>
                    <input
                        type='text'
                        placeholder='Enter IP Address for DoS Attack'
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                    />
                    <button
                        className='coap-header-button coap-client-button--start'
                        type='button'
                        onClick={() => handleStartAttack(() => startdos('start', ipAddress))}
                        disabled={!ipAddress}
                    >
                        Start DoS Attack
                    </button>
                    <button
                        className='coap-header-button coap-client-button--stop'
                        type='button'
                        onClick={() => handleStartAttack(() => stopdos('stop', ipAddress))}
                        disabled={!ipAddress}
                    >
                        Stop DoS Attack
                    </button>



                    <div className={`coap-server-status coap-server-status--${Runningd ? 'active' : 'inactive'}`}>
                        {Runningd ? 'Running DOS' : 'Inactive'}
                    </div>

                    
                </div>
            )}

            {attackType === 'replay' && (
                <div className='coap-replay-attack'>
                    <input
                        type='text'
                        placeholder='Enter Interface Name for Replay Attack'
                        value={interfaceName}
                        onChange={(e) => setInterfaceName(e.target.value)}
                    />
                    <button
                        className='coap-header-button coap-client-button--start'
                        type='button'
                        onClick={() => handleStartAttack(() => sendReplay(interfaceName))}
                        disabled={!interfaceName}
                    >
                        Start Replay Attack
                    </button>
                    <h2 className='coap-logs-heading'>Arp Spoofing</h2>

                    <input
                        type='text'
                        placeholder='Enter Source IPaddress'
                        value={sour}
                        onChange={(e) => setSour(e.target.value)}
                    />

                    <input
                        type='text'
                        placeholder='Enter Destination IPaddress'
                        value={disti}
                        onChange={(e) => setDisti(e.target.value)}
                    />
                    <button
                        className='coap-header-button coap-client-button--start'
                        type='button'
                        onClick={() => handleStartAttack(() => sendarp('start',interfaceName,sour,disti))}
                        disabled={!interfaceName}
                    >
                        Start Arp Spoofing
                    </button>
                    <button
                        className='coap-header-button coap-client-button--start'
                        type='button'
                        onClick={() => handleStartAttack(() => sendarp('stop',interfaceName,sour,disti))}
                        disabled={!interfaceName}
                    >
                        stop Arp Spoofing
                    </button>
                    
                    {attackerOutput && (
                        <div className='coap-logs coap-server-logs'>
                            <h2 className='coap-logs-heading'>Replay Attack Output</h2>
                            <pre className='coap-logs-message'>
                                {parseAttackerOutput(attackerOutput).map((line, index) => (
                                    <div key={index}>{line}</div>
                                ))}
                            </pre>
                        </div>
                    )}
                </div>
                  

            )}
        </div>
    );

    return (
        <div className='coap-container'>
            <Container>
                <div className='report-container-heading' style={{ display: 'flex' }}>
                    <div className='report-container-heading-text'>CoAP</div>
                </div>

                <div className='entity-selector'>
                    <label htmlFor='entitySelect'>Select Entity:</label>
                    <select id='entitySelect' value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
                        <option value='server'>Server</option>
                        <option value='client'>Client</option>
                        <option value='attacker'>Attacker</option>
                    </select>
                </div>

                <div className='coap-communication'>
                    {selectedEntity === 'server' && renderServerControls()}
                    {selectedEntity === 'client' && renderClientControls()}
                    {selectedEntity === 'attacker' && renderAttackerControls()}
                </div>
            </Container>
        </div>
    );
};

export default CoAP;

























































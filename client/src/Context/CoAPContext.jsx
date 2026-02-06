



import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';

const CoAPContext = createContext();

export const CoAPProvider = ({ children }) => {
  const { addError } = useErrorHandler();

  const [serverRunning, setServerRunning] = useState(false);
  const [clientOutput, setClientOutput] = useState([]);
  const [serverOutput, setServerOutput] = useState({});
  const [attackerOutput, setAttackerOutput] = useState({});
  const [Runningd, setdosRunning] = useState(false);
  const [attackerdosOutput, setdosOutput] = useState({});
  

  // Utility function to safely extract parts of a string based on a delimiter
  const safeExtract = (str, delimiter, index) => {
    if (!str) return '';
    const parts = str.split(delimiter);
    return parts[index] ? parts[index].trim() : '';
  };

  // Start server listener
  useEffect(() => {
    const handleServerStarted = () => {
      setServerRunning(true);
      setServerOutput({});
      setClientOutput([]);
    };

    const handleServerStopped = () => {
      setServerRunning(false);
    };



    const handleDosStarted = (data) => {
      setdosRunning(true);
      // setServerOutput({});
      // setClientOutput([]);
      try {
        // console.log("Received attacker data:", data); // Debug log
        // console.log("Received attacker data:", data);
        setdosOutput(data);
      } catch (error) {
        addError({ errorType: 'CoAP Attacker Error', message: error.message });
      }
    };
 
    const handleDosStopped = () =>{
      setdosRunning(false);
    };
















    const handleCoAPClient = (data) => {
      try {
        console.log("Received data from CoAP client:", data); // Debug log
        const { debug, clientData } = JSON.parse(data);
        const debugLines = debug?.split('\n') || [];
        const clientDataLines = clientData?.split('\n') || [];

        const resultsLine = clientDataLines[0];
        const responseTextLine = clientDataLines[1] || 'N/A'; // Fallback if undefined

        const newClientOutput = [
          {
            title: 'Actual Response',
            content: [{ key: 'Results', value: resultsLine || 'N/A' }],
          },
        ];

        console.log("Client output set:", newClientOutput); // Debug log
        setClientOutput(newClientOutput);
      } catch (error) {
        addError({ errorType: 'CoAP Client Error', message: error.message });
      }
    };

    // const handleCoAPServer = (data) => {
    //   try {
    //     console.log("Received data from CoAP server:", data); // Debug log
    //     const parsedData = JSON.parse(data);
    //     const { token, incomingMessage, responseMessage } = parsedData;

    //     const newServerOutput = {
    //       ...serverOutput,
    //       [token]: {
    //         token,
    //         content: [
    //           {
    //             title: 'Incoming Message',
    //             content: [
    //               { key: 'Packet Type', value: incomingMessage.packetType || 'N/A' },
    //               { key: 'HTTP Type', value: incomingMessage.httpType || 'N/A' },
    //               { key: 'Message ID', value: incomingMessage.messageID || 'N/A' },
    //               { key: 'Token', value: incomingMessage.token || 'N/A' },
    //             ],
    //           },
    //           {
    //             title: 'Response Message',
    //             content: [
    //               { key: 'Packet Type', value: responseMessage.packetType || 'N/A' },
    //               { key: 'HTTP Type', value: responseMessage.httpType || 'N/A' },
    //               { key: 'Message ID', value: responseMessage.messageID || 'N/A' },
    //               { key: 'Token', value: responseMessage.token || 'N/A' },
    //             ],
    //           },
    //         ],
    //       },
    //     };

    //     console.log("Server output set:", newServerOutput); // Debug log
    //     setServerOutput(newServerOutput);
    //   } catch (error) {
    //     addError({ errorType: 'CoAP Server Error', message: error.message });
    //   }
    // };







    const handleCoAPServer = (data) => {
      try {
        console.log("Received data from CoAP server:", data); // Debug log
        const parsedData = JSON.parse(data);
        const { token, incomingMessage, responseMessage } = parsedData;
    
        const randomKey = Math.floor(1000000 + Math.random() * 9000000); // 7-digit random number
    
        const newServerOutput = {
          ...serverOutput,
          [randomKey]: {
            token,
            content: [
              {
                title: 'Incoming Message',
                content: [
                  { key: 'Packet Type', value: incomingMessage.packetType || 'N/A' },
                  { key: 'HTTP Type', value: incomingMessage.httpType || 'N/A' },
                  { key: 'Message ID', value: incomingMessage.messageID || 'N/A' },
                  { key: 'Token', value: incomingMessage.token || 'N/A' },
                ],
              },
              {
                title: 'Response Message',
                content: [
                  { key: 'Packet Type', value: responseMessage.packetType || 'N/A' },
                  { key: 'HTTP Type', value: responseMessage.httpType || 'N/A' },
                  { key: 'Message ID', value: responseMessage.messageID || 'N/A' },
                  { key: 'Token', value: responseMessage.token || 'N/A' },
                ],
              },
            ],
          },
        };
    
        console.log("Server output set:", newServerOutput); // Debug log
        setServerOutput(newServerOutput);
      } catch (error) {
        addError({ errorType: 'CoAP Server Error', message: error.message });
      }
    };
    

    const handleCoAPAttacker = (data) => {
      try {
        // console.log("Received attacker data:", data); // Debug log
        setAttackerOutput(data);
      } catch (error) {
        addError({ errorType: 'CoAP Attacker Error', message: error.message });
      }
    };

    // Listen to socket events
    socket.on('coap-server-started', handleServerStarted);
    socket.on('coap-server-stopped', handleServerStopped);
    socket.on('Dos-coap', handleDosStarted);
    socket.on('Dos-stop', handleDosStopped);
    socket.on('coap-client', handleCoAPClient);
    socket.on('coap-server', handleCoAPServer);
    // socket.on('Dos-coap', handledosAttacker);
    socket.on('send-Replay', handleCoAPAttacker);

    // Cleanup listeners on unmount
    return () => {
      socket.off('coap-server-started', handleServerStarted);
      socket.off('coap-server-stopped', handleServerStopped);
      socket.off('Dos-coap', handleDosStarted);
      socket.off('Dos-stop', handleDosStopped);
      socket.off('coap-client', handleCoAPClient);
      socket.off('coap-server', handleCoAPServer);
      // socket.off('Dos-coap', handledosAttacker);
      socket.off('send-Replay', handleCoAPAttacker);
    };
  }, [serverOutput, addError]);

  // Start the server
  const startServer = () => {
    if (serverRunning) {
      addError({
        errorType: 'CoAP Server Error',
        message: 'Please stop the server before starting it again.',
      });
      return;
    }
    socket.emit('coap-server', 'start');
  };

  // Stop the server
  const stopServer = () => {
    if (!serverRunning) {
      addError({
        errorType: 'CoAP Server Error',
        message: 'Please start the server before attempting to stop it.',
      });
      return;
    }
    socket.emit('coap-server', 'stop');
  };








  const startdos = (type, url) => {
    // if (serverRunning) {
    //   addError({
    //     errorType: 'Dos Error',
    //     message: 'Please stop the Dos before starting it again.',
    //   });
    //   return;
    // }
    // socket.emit('coap-dos', 'start');
    socket.emit('coap-dos', type, url);
  };


  const stopdos = (type, url) => {
    // if (!serverRunning) {
    //   addError({
    //     errorType: 'Dos Error',
    //     message: 'Please start the Dos before attempting to stop it.',
    //   });
    //   return;
    // }
    // socket.emit('coap-dos', 'stop');
    
    socket.emit('coap-dos', type, url);
  };

  return (
    <CoAPContext.Provider
      value={{
        serverRunning,
        sendRequestToServer: (type, url) => socket.emit('coap-client', type, url),
        clientOutput,
        serverOutput,
        attackerOutput,
        startServer,
        stopServer,
        startdos,
        stopdos,
        attackerdosOutput,
        Runningd,
        sendReplay: (url) => socket.emit('send-Replay', url),
        sendarp: (type, interf ,url,urll) => socket.emit('send-arp', type,interf,url,urll),
      }}
    >
      {children}
    </CoAPContext.Provider>
  );
};

export const useCoAP = () => useContext(CoAPContext);

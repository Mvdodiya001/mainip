import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socket } from './Socket';
import { useErrorHandler } from './ErrorContext';

const NetworkGraphContext = createContext();

const NetworkGraphUtility = ({ children }) => {
  const [networkGraphNodes, setNetworkGraphNodes] = useState([]);
  const [networkGraphEdges, setNetworkGraphEdges] = useState([]);
  const [deviceNameCache, setDeviceNameCache] = useState({});
  const { addError } = useErrorHandler();

  const getDeviceName = useCallback(async (node) => {
    const ip = node.id;
    if (deviceNameCache[ip]) {
      setNetworkGraphNodes((prev) => {
        const index = prev.findIndex((el) => el.id === node.id);
        if (index === -1) return prev;

        const newNodes = [...prev];
        newNodes[index] = {
          ...newNodes[index],
          name: deviceNameCache[ip],
        };
        return newNodes;
      });
      return;
    }

    let deviceName = 'Vendor: Not Found $$ Device: Not Found';

    try {
      const response = await fetch(`http://localhost:8000/get-device-name/${ip}`);
      if (!response.ok) {
        throw new Error('Server responded with a non-OK status');
      }
      const data = await response.json();
      deviceName = data.deviceName || deviceName;
      setDeviceNameCache((prev) => ({ ...prev, [ip]: deviceName }));
    } catch (err) {
      addError({
        message: 'Cannot connect to server.',
        errorType: 'Bad Request',
        status: 400,
      });
    }

    setNetworkGraphNodes((prev) => {
      const index = prev.findIndex((el) => el.id === node.id);
      if (index === -1) return prev;

      const newNodes = [...prev];
      newNodes[index] = {
        ...newNodes[index],
        name: deviceName,
      };
      return newNodes;
    });
  }, [deviceNameCache, addError]);

  const handleNodeData = useCallback((data) => {
    try {
      const parsedData = JSON.parse(data);
      setNetworkGraphNodes((prevNodes) => [...prevNodes, parsedData]);
    } catch (err) {
      console.error('Failed to parse node data:', err);
    }
  }, []);

  const handleEdgeData = useCallback((data) => {
    try {
      const parsedData = JSON.parse(data);
      const regex = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;
      if (!parsedData.target || !regex.test(parsedData.target)) {
        throw new Error('Next node is not available');
      }
      setNetworkGraphEdges((prevEdges) => [...prevEdges, parsedData]);
    } catch (err) {
      console.error('Failed to parse edge data:', err);
    }
  }, []);

  useEffect(() => {
    socket.on('network-graph-data-node', handleNodeData);
    socket.on('network-graph-data-edge', handleEdgeData);

    return () => {
      socket.off('network-graph-data-node', handleNodeData);
      socket.off('network-graph-data-edge', handleEdgeData);
    };
  }, [handleNodeData, handleEdgeData]);

  const handleUpdateNetworkGraph = () => {
    console.log('Network Graph');
    socket.emit('network-graph');
    setNetworkGraphNodes([]);
    setNetworkGraphEdges([]);
  };

  return (
    <NetworkGraphContext.Provider
      value={{
        networkGraphNodes,
        networkGraphEdges,
        handleUpdateNetworkGraph,
        getDeviceName,
      }}
    >
      {children}
    </NetworkGraphContext.Provider>
  );
};

const useNetworkGraphContext = () => {
  return useContext(NetworkGraphContext);
};

export { useNetworkGraphContext, NetworkGraphUtility };

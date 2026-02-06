import React, { useState, useEffect } from 'react';

const ServerFingerprinting = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Test connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/test-connection');
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        console.log("API connection test successful:", data);
      } else {
        const text = await response.text();
        console.warn("API connection test returned non-JSON response:", 
          text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        setDebugInfo({
          status: response.status,
          contentType: contentType || 'not specified',
          responsePreview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        });
      }
    } catch (err) {
      console.error("API connection test failed:", err);
      setDebugInfo({
        error: err.message,
        note: "Could not connect to API endpoint. Check server and proxy configuration."
      });
    }
  };

  const validateIpAddress = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ip);
  };

  const validatePort = (port) => {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const handleStartAnalysis = async () => {
    // Reset states
    setError('');
    setResults(null);
    
    // Basic validation
    if (!ipAddress || !port) {
      setError('Both IP address and port are required.');
      return;
    }
    
    // IP address validation
    if (!validateIpAddress(ipAddress)) {
      setError('Please enter a valid IP address (e.g., 192.168.1.1)');
      return;
    }
    
    // Port validation
    if (!validatePort(port)) {
      setError('Please enter a valid port number (1-65535)');
      return;
    }
    
    // Show loading indicator
    setLoading(true);
    setShowResults(false);
    
    try {
      // Try to use fetch API first
      const response = await fetch(`/api/server-fingerpt?ip=${encodeURIComponent(ipAddress)}&port=${encodeURIComponent(port)}`);
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
      }
      
      // Check if response is JSON
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        setLoading(false);
        setResults(data);
        setShowResults(true);
      } else {
        // If not JSON, try the alternative endpoint
        throw new Error('Server returned non-JSON response');
      }
    } catch (error) {
      console.error("Primary request failed:", error);
      
      // Try the alternative endpoint with JSONP approach
      try {
        setDebugInfo({
          note: "Attempting alternative endpoint...",
          error: error.message
        });
        
        // Create a script tag for JSONP approach
        const script = document.createElement('script');
        const callbackName = 'jsonpCallback_' + new Date().getTime();
        
        // Create a promise that resolves when the JSONP callback is called
        const jsonpPromise = new Promise((resolve, reject) => {
          window[callbackName] = (data) => {
            resolve(data);
            delete window[callbackName];
            document.body.removeChild(script);
          };
          
          // Set timeout for JSONP request
          setTimeout(() => {
            if (window[callbackName]) {
              delete window[callbackName];
              document.body.removeChild(script);
              reject(new Error('JSONP request timed out'));
            }
          }, 10000);
        });
        
        // Set up the JSONP request
        script.src = `/alt-api/server-fingerpt-jsonp?ip=${encodeURIComponent(ipAddress)}&port=${encodeURIComponent(port)}&callback=${callbackName}`;
        document.body.appendChild(script);
        
        // Wait for JSONP response
        const data = await jsonpPromise;
        setLoading(false);
        setResults(data);
        setShowResults(true);
      } catch (jsonpError) {
        console.error("Alternative request failed:", jsonpError);
        setLoading(false);
        setError(`All request methods failed. Please check your network connection and server configuration.`);
        setDebugInfo({
          primaryError: error.message,
          secondaryError: jsonpError.message,
          suggestion: "Please check your server configuration or contact support."
        });
      }
    }
  };

  const handleDownload = () => {
    if (!results) return;
    
    const resultsText = JSON.stringify(results, null, 2);
    const blob = new Blob([resultsText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server_fingerprint_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Server Fingerprinting Tool</h1>
        <p className="mb-6 text-gray-600">
          Enter target server details to analyze its configuration and security properties.
        </p>
        
        <div className="mb-4">
          <label htmlFor="ipAddress" className="block font-medium mb-1 text-gray-700">
            IP Address:
          </label>
          <input
            type="text"
            id="ipAddress"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value.trim())}
            placeholder="e.g., 192.168.1.1"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="port" className="block font-medium mb-1 text-gray-700">
            Port Number:
          </label>
          <input
            type="number"
            id="port"
            value={port}
            onChange={(e) => setPort(e.target.value.trim())}
            placeholder="e.g., 80, 443"
            min="1"
            max="65535"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          onClick={handleStartAnalysis}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded text-base font-medium transition duration-200"
        >
          Start Fingerprinting
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="mt-6 text-center">
            <p className="mb-3 text-gray-700">Analyzing server. This may take a few moments...</p>
            <div className="spinner mx-auto w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {showResults && results && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
            <button
              onClick={handleDownload}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
            >
              Download Report
            </button>
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <details>
              <summary className="font-medium text-yellow-800 cursor-pointer">Debug Information (Click to expand)</summary>
              <div className="mt-3 text-sm text-yellow-700">
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerFingerprinting;
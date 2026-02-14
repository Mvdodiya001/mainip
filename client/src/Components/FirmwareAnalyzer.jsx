import React, { useState } from 'react';

const FirmwareAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setAnalysisResult(null);
      // Automatically trigger upload/scan
      handleUpload(file);
    }
  };

  const handleUpload = async (fileToUpload) => {
    // Use the passed file or fall back to state (for manual button if we kept it)
    const file = fileToUpload || selectedFile;

    if (!file) {
      setError('Please select a .pcap file first.');
      return;
    }

    const formData = new FormData();
    formData.append('pcap', file);

    setLoading(true);
    setError('');

    try {
      // Ensure this URL matches your backend port (default is usually 5000 or 3000)
      const response = await fetch('http://localhost:8000/analyze-firmware', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server reported an error analyzing the file.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server or analyze file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="firmware-analyzer-container" style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        Firmware & Version Detection
      </h2>

      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="file"
          accept=".pcap, .pcapng, .cap"
          onChange={handleFileChange}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
        />
        {/* Button hidden as scanning is automatic now */}
        <button
          onClick={() => handleUpload(selectedFile)}
          disabled={loading}
          style={{
            display: 'none', // Hidden but kept in code just in case
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Scanning Packet...' : 'Analyze PCAP'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="results-area">
          <h3>Analysis Results</h3>

          {analysisResult.versions && analysisResult.versions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Detected Firmware / Version Strings</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.versions.map((ver, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontFamily: 'monospace' }}>{ver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px' }}>
              No specific firmware versions were found in this file.
            </div>
          )}

          {/* Optional: Show raw output for debugging */}
          <details style={{ marginTop: '15px', cursor: 'pointer' }}>
            <summary>View Raw Script Output</summary>
            <pre style={{ background: '#333', color: '#0f0', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
              {analysisResult.raw_output}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default FirmwareAnalyzer;
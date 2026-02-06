import React, { useState } from "react";

const ServerFingerprint = () => {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("80");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [responseOutput, setResponseOutput] = useState("");

  const httpMethods = [
    "GET_EXISTING",
    "GET_NONEXISTING",
    "GET_LONG",
    "HEAD_EXISTING",
    "DELETE_EXISTING",
  ];

  const fetchData = async () => {
    if (!ip || !port) {
      setError("Please enter both Target URL/IP and Port");
      return;
    }
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/server/fingerprint?port=${port}&ip=${ip}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
      setResponseOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>ServerSpy Fingerprinting tool</h2>
        </div>
        <div className="card-body">
          {/* Input Section */}
          <form className="form">
            <div className="form-group">
              <label>Target URL/IP:</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Port:</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="port-input"
              />
            </div>

            <div className="button-center">
              <button className="btn danger" onClick={fetchData} type="button">
                Run Scan
              </button>
            </div>
          </form>

          {/* HTTP Method Buttons */}
          <div className="http-methods">
            {httpMethods.map((method) => (
              <button key={method} className="btn primary">
                {method}
              </button>
            ))}
          </div>

          {/* Response Output */}
          <div className="output-section">
            <h5>Response Output:</h5>
            <div className="output-container">
              <pre>{responseOutput}</pre>
            </div>
          </div>

          {/* Results Table */}
          {data && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Server Version</th>
                    <th>Score</th>
                    <th>Hits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.nmap_results?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Rank}</td>
                      <td>{item["Server Version"]}</td>
                      <td>{item.Score}</td>
                      <td>{item.Hits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Export Button */}
          <div className="button-center">
            <button className="btn success">Export to CSV</button>
          </div>

          {/* Error Display */}
          {error && <div className="error">{error}</div>}
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .card {
          background-color: #FFFFD4;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 1rem;
          text-align: center;
          border-bottom: 1px solid #dee2e6;
        }

        .card-header h2 {
          margin: 0;
        }

        .card-body {
          padding: 1.5rem;
        }

        .form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .form-group label {
          width: 120px;
          text-align: right;
          margin-right: 1rem;
        }

        .form-group input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .port-input {
          flex: 0 0 100px !important;
        }

        .button-center {
          text-align: center;
          margin: 1rem 0;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin: 0.25rem;
        }

        .btn.primary {
          background-color: #007bff;
          color: white;
        }

        .btn.danger {
          background-color: #dc3545;
          color: white;
        }

        .btn.success {
          background-color: #28a745;
          color: white;
        }

        .http-methods {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .output-section {
          margin-bottom: 1.5rem;
        }

        .output-container {
          background-color: white;
          padding: 1rem;
          height: 250px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .output-container pre {
          margin: 0;
          font-size: 0.875rem;
          white-space: pre-wrap;
        }

        .table-container {
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }

        th, td {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          text-align: left;
        }

        th {
          background-color: #f8f9fa;
        }

        tr:hover {
          background-color: #f5f5f5;
        }

        .error {
          color: #dc3545;
          text-align: center;
          font-weight: bold;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ServerFingerprint;
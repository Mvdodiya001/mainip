import React, { useEffect, useState } from "react";
import { socket } from "./../Context/Socket";

export default function BruteForce(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [passwordList, setPasswordList] = useState([]);
  const [dashboardData, setDashBoardData] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false); // Track checkbox status
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState("");
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = () => {
    setPasswordList([]);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      content.split(",").map((data) => {
        const password = data.trim();
        setPasswordList((prev) => {
          return [...prev, password];
        });
      });
      alert("File Uploaded Successfully")
    };
    reader.readAsText(selectedFile);
  };

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const startBruteForce = () => {
    
    if (username.trim() === "" || topic.trim() === "") {
      alert("Please enter username and topic");
      return;
    }
    if (showFileUpload) {
      setDashBoardData("Starting Brute Force...\n");
      if (passwordList.length === 0) {
        alert("Please upload a file");
        return;
      }
      socket.emit("bruteForce", passwordList, topic, username, showFileUpload);
    } else {
      socket.emit("bruteForce", [], topic, username, showFileUpload);
    }
  };

  const stopbruteForce = () => {
    socket.emit("stopBruteForce");
  };

  useEffect(() => {
    socket.on("bruteForceData", (data) => {
      setDashBoardData((prevData) => prevData + data);
    });
    return () => {
      socket.off("bruteForceData");
    };
  });

  return (
    <>
      <div className="custom-container">
        <h2>Brute Force</h2>
        <div className="input-div col">
          <div className="row m-2">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="#username"
              className="inputbox"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="row m-2">
            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              name="topic"
              id="#topic"
              placeholder="Topic"
              className="inputbox"
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div class="checkbox-wrapper-1 row m-2 p-0">
            <input
              id="example-1"
              class="substituted"
              type="checkbox"
              aria-hidden="true"
              onChange={toggleFileUpload} // Toggle file upload on checkbox change
            />
            <label for="example-1">Upload passwords List</label>
          </div>

          <div className={`file-div row m-2 ${showFileUpload ? "" : "hidden"}`}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
            />
            <button
              className="btn btn-secondary"
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload
            </button>
          </div>
          {showFileUpload && (
            <p className="file-instruction">Upload *.csv file only.</p>
          )}
          <div className="form-footer">
            <button onClick={startBruteForce} className="button-26">
              Start
            </button>
            <button onClick={stopbruteForce} className="button-39">
              Stop
            </button>
          </div>
        </div>
      </div>
      <h4 className="text-center">Output Console</h4>
      <div className="mosquitto-output" >
        <div className="mosquitto-output-sub" id="style-1">
          {dashboardData.split("\n").map((line, index) => {
            const isPasswordFound = line.includes("Password for");
            const isPasswordNotFound = line.includes("Password not found");
            return (
              <div
                key={index}
                className={isPasswordFound ? "green-text" : "grey-text"}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

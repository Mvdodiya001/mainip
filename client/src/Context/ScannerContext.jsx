import React, { createContext, useContext, useState, useEffect } from "react";
import io from 'socket.io-client';

const scannerContext = createContext();

// Initialize socket outside component to avoid recreation
const socket = io('http://localhost:8000'); // Adjust URL if needed

const ScannerUtility = ({ children }) => {
    const [scanningState, setScanningState] = useState(false);
    const [apkFile, setApkFile] = useState(null);
    const [apkFileName, setApkFileName] = useState(null);
    const [apkFileType, setApkFileType] = useState(null);
    const [apkFileDataPrimary, setApkFileDataPrimary] = useState(null);
    const [apkFileDataSecondary, setApkFileDataSecondary] = useState(null);

    // New state for captured PCAP file path
    const [pcapFilePath, setPcapFilePath] = useState(null);

    useEffect(() => {
        // Listen for PCAP file creation event
        socket.on('pcap_file_created', (data) => {
            console.log('PCAP created:', data);
            if (data && data.fullPath) {
                setPcapFilePath(data.fullPath);
            }
        });

        return () => {
            socket.off('pcap_file_created');
        };
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            setApkFileName(file.name);
            setApkFileType(file.type);
            setApkFile(event.target.result);
        };

        reader.readAsArrayBuffer(file);
    }

    const handleFileSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append(
            "file",
            new Blob([new Uint8Array(apkFile)], { type: apkFileType })
        );
        formData.append("fileName", apkFileName);

        setScanningState(true);

        const response = await fetch("http://localhost:8000/upload-apk-file", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            console.error(response);
            const error = await response.json();
            alert(error.message);
            setScanningState(false);
            return;
        }

        const data = await response.json();
        console.log(data);
        setApkFileDataPrimary(data.primary_data);
        setApkFileDataSecondary(data.secondary_data);
        setScanningState(false);
    }

    return (
        <scannerContext.Provider value={{
            scanningState,
            apkFile,
            apkFileName,
            apkFileType,
            handleFileChange,
            handleFileSubmit,
            apkFileDataPrimary,
            apkFileDataSecondary,
            pcapFilePath // Expose pcap path
        }}>
            {children}
        </scannerContext.Provider>
    );
};

const useScanner = () => {
    return useContext(scannerContext);
};

export { useScanner, ScannerUtility };

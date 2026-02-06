import React, { createContext, useContext, useState } from "react";

const scannerContext = createContext();

const ScannerUtility = ({ children }) => {
    const [scanningState, setScanningState] = useState(false);
    const [apkFile, setApkFile] = useState(null);
    const [apkFileName, setApkFileName] = useState(null);
    const [apkFileType, setApkFileType] = useState(null);
    const [apkFileDataPrimary, setApkFileDataPrimary] = useState(null);
    const [apkFileDataSecondary, setApkFileDataSecondary] = useState(null);

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
            apkFileDataSecondary
        }}>
            {children}
        </scannerContext.Provider>
    );
};

const useScanner = () => {
    return useContext(scannerContext);
};

export { useScanner, ScannerUtility };

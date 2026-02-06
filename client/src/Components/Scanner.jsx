import React, { useState } from "react";
import { useScanner } from "../Context/ScannerContext";

export default function Scanner(props) {
    const { apkFileName, handleFileChange, handleFileSubmit } = useScanner();

    return (
        <div className="apk-scanner">
            <h3>APK Upload</h3>
            <p>
                Here you can upload an APK file and get the details of the APK
                file. It will display the details like the vulnerabilities, its
                decription and the CVE's associated to it, Also you can download
                a detailed report of the APK.
            </p>
            <div className="APK-upload">
                <i className="fa-brands fa-android upload-icon"></i>
                <span className="upload-text">
                    {apkFileName ? apkFileName : "Select a APK file to upload"}
                </span>
                <input
                    type="file"
                    id="apkFile"
                    className="file-upload"
                    onChange={handleFileChange}
                    accept="application/vnd.android.package-archive"
                />
            </div>
            <button className="APK-input-button button" onClick={handleFileSubmit}>
                Start Scan
            </button>
        </div>
    );
}

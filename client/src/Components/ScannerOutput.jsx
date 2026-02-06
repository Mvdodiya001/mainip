import React, { useState, useRef } from "react";
import { useScanner } from "../Context/ScannerContext";
import AppVulnarabilityCard from "./AppVulnarabilityCard";

export default function ScannerOutput(props) {
    const { scanningState, apkFileDataPrimary, apkFileDataSecondary } =
        useScanner();

    const handleDownloadDetailedReport = () => {
        const report = {
            'primary': apkFileDataPrimary,
            'secondary': apkFileDataSecondary,
        }

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report.json";
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="apk-scanner">
            <h3>Scanner Output</h3>
            {scanningState ? (
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            ) : apkFileDataPrimary || apkFileDataSecondary ? (
                <>
                    <div className="detailed-report">
                        <p>
                            You can download the complete report&nbsp;
                            <a
                                rel="noreferrer noopener"
                                onClick={handleDownloadDetailedReport}
                                className="report-download"
                            >
                                here
                            </a>
                            .
                        </p>
                    </div>
                    <div className="summary-report">
                        <h5>Summary of the vulnerabilities:</h5>
                        {Object.values(
                            apkFileDataPrimary?.semantic_grep?.matches ?? {}
                        ).map((el, index) => {
                            const metadata = el.metadata;
                            if (metadata === undefined) {
                                return <div></div>;
                            }
                            return (
                                <AppVulnarabilityCard
                                    key={index}
                                    owasp_mobile={metadata["owasp-mobile"]}
                                    severity={metadata.severity}
                                    cwe={metadata.cwe}
                                    description={metadata.description}
                                    cves={metadata.cves}
                                />
                            );
                        })}
                        {Object.values(
                            apkFileDataSecondary?.pattern_matcher ?? {}
                        ).map((el, index) => {
                            const metadata = el.metadata;
                            if (metadata === undefined) {
                                return <div></div>;
                            }
                            return (
                                <AppVulnarabilityCard
                                    key={index}
                                    owasp_mobile={metadata["owasp-mobile"]}
                                    severity={metadata.severity}
                                    cwe={metadata.cwe}
                                    description={metadata.description}
                                    cves={metadata.cves}
                                />
                            );
                        })}
                    </div>
                </>
            ) : (
                <p>No APK file uploaded</p>
            )}
        </div>
    );
}

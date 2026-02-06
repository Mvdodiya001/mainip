const { execSync } = require("child_process");
const fs = require("fs");
const Constants = require("../utils/constants");

exports.uploadApkFile = async (req, res, next) => {
    console.log(req.file);
    if (!req.file || req.file.size === 0) {
        req.uploadedFile = {
            status: "failed",
            message: "No file uploaded",
        };
        return next();
    }

    req.uploadedFile = {
        status: "success",
        file: {
            name: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path,
        },
    };

    next();
};

exports.scanApkFile = async (req, res, next) => {
    if (!req.uploadedFile || req.uploadedFile.status !== "success") {
        const scanResult = {
            status: "failed",
            message: "No file uploaded",
        };
        return res.status(400).json(scanResult);
    }

    const apkPath = req.uploadedFile.file.path.split("/").slice(1).join("/");
    const jadx_output_path = `uploads/scanner`;
    try {
        const decpompiler = execSync(
            `JAVA_OPTS="-Xmx4G" jadx ${apkPath} -d ${jadx_output_path}`,
            {
                cwd: Constants.directory,
            }
        );
        console.log(decpompiler.toString());
    } catch (error) {
        console.error(error, error.toString());
    }

    try {
        const scanResult = execSync(
            `echo ${process.env.ROOT_PASSWORD} | sudo -S bash ./scan-apk.sh ${apkPath} ${jadx_output_path}`,
            {
                cwd: Constants.directory,
            }
        );

        const [result1, result2] = scanResult
            .toString()
            .split("-------------------RESULTS-------------------");

        return res.status(200).json({
            status: "success",
            message: "File successfully scanned",
            primary_data: JSON.parse(result1),
            secondary_data: JSON.parse(result2),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "Failed to scan APK file",
        });
    }
};

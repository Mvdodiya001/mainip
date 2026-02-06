const { spawn } = require("child_process");
const Constants = require("../utils/constants");

let ServerFingerprintingprocess = undefined;

const getServerFingerprintUtil = (target, port) => {
    const io = Constants.io; // ✅ Get the socket instance

    if (!io) {
        console.error("Socket.io instance is not initialized.");
        return;
    }

    if (!target || !port) {
        io.emit("error", JSON.stringify({ message: "Target and port are required", code: 400 }));
        return;
    }

    const nmapCommand = `nmap --script=serverspy.nse -p ${port} ${target}`;
    ServerFingerprintingprocess = spawn(nmapCommand, { shell: true });

    ServerFingerprintingprocess.stdout.on("data", (data) => {
        const output = data.toString();
        const parsedData = parseNmapOutput(output);
        io.emit("serverfingerprint", JSON.stringify(parsedData)); // ✅ Emit results
        console.log("Nmap Scan Data Emitted");
    });

    ServerFingerprintingprocess.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString()}`);
        io.emit("error", JSON.stringify({ message: data.toString(), errorType: "Nmap Scan Error", code: 500 }));
        ServerFingerprintingprocess.kill("SIGKILL");
        ServerFingerprintingprocess = undefined;
    });

    ServerFingerprintingprocess.on("exit", (code, signal) => {
        console.log(`Child process exited with code ${code} and signal ${signal}`);
    });
};

function parseNmapOutput(output) {
    const lines = output.split("\n");
    const results = [];
    let startIndex = lines.findIndex(line => line.includes("| serverspy:"));
    if (startIndex === -1) return [];

    for (let i = startIndex + 1; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s{2,}/);
        if (parts.length < 3) continue;

        results.push({
            rank: parts[0],
            server: parts[1],
            score: parts[2],
            elementsMatched: parts[3] || "N/A"
        });
    }
    return results;
}

module.exports = getServerFingerprintUtil;


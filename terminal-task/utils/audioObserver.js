// In progress --Swaroop

const fs = require("fs");
const { execSync } = require("child_process");
const Observer = require("./observer");
const path = require("path");

class AudioObserver extends Observer {
    constructor(tempFileName = "temp_audio.txt") {
        super();
        this.set_text_file(tempFileName);
        const command = `adb shell dumpsys audio`;
        this.set_command(command);
    }

    __look__() {
        const data = this.data.split("\n");
        data.splice(92); // Keep only the first 92 lines
        // console.log(data); // return;
        let start = 0;
        for (const line of data) {
            const trimmedLine = line.trim();
            start = 0;
            if (
                trimmedLine.includes("abandonAudioFocus()") ||
                trimmedLine.includes("requestAudioFocus()")
            ) {
                start = 1;
            }

            if (start) {
                // console.log(line); continue;
                const parts = line.split(" ");
                const time = `${parts[0]} ${parts[1]}`;
                const value = parts.slice(6).join(" ");
                let clientId = "";
                for (let a of parts) {
                    if(a.includes("callingPack")) {
                        clientId = a.slice(12);
                        break;
                    }
                }
                const isConnected =
                    parts[2] === "abandonAudioFocus()"
                        ? "DISCONNECT"
                        : "CONNECT";
                let packageName = clientId.toString().trim();
                let pkgName = "";
                if (isConnected === "CONNECT") {
                    pkgName = value.split(" ")[2].slice(12);
                }

                const formattedTime = time.slice(0, -4);
                packageName = packageName.toString().trim();

                if (isConnected == "DISCONNECT") {
                    if (!Object.keys(this.service_data).includes(packageName)) {
                        continue;
                    }
                    this.service_data[packageName]["end"] = formattedTime;
                    if (this.service_history.length)
                        this.service_history[
                            this.service_history.length - 1
                        ][2] = formattedTime;
                    if (this.apps_service_history[packageName])
                        this.apps_service_history[packageName][
                            this.apps_service_history[packageName].length - 1
                        ]["end"] = formattedTime;
                } else {
                    this.service_data[packageName] = {
                        start: formattedTime,
                        end: "-1",
                        pkgName: pkgName,
                    };
                    this.service_history.push([
                        packageName,
                        formattedTime,
                        -1,
                        pkgName,
                    ]);
                    if (!this.apps_service_history[packageName])
                        this.apps_service_history[packageName] = [];
                    this.apps_service_history[packageName].push({
                        start: formattedTime,
                        end: "-1",
                        pkgName: pkgName,
                    });
                }
            }
        }
    }
}

// if (require.main === module) {
//     const observer = new AudioObserver();
//     observer.connect_json("audio.json");
//     observer.to_get_service_data();
//     // observer.watch(100, true, true);
//     observer.look(true, true);
//     console.log(observer.get_data());
// }

module.exports = new AudioObserver();

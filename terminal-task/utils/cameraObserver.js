const Observer = require("./observer"); // Import the Observer class from a file named Observer.js

class CameraObserver extends Observer {
    constructor(tempFileName = "temp_camera.txt") {
        super();
        this.set_text_file(tempFileName);
        const command = `adb shell dumpsys media.camera`;
        this.set_command(command);
    }

    __look__() {
        const data = this.data.split("\n")
            .slice(0, 120)
            .reverse()
            .map((line) => line.trim());
        // console.log(data);
        // exit(0);

        let start = false;

        for (const line of data) {
            if (line === "...") {
                start = true;
                continue;
            }

            if (start) {
                // console.log(line);
                const [time, value] = line.split(" : ");
                if (!time || !value) {
                    continue;
                }

                const [is_connected, package_name] = [
                    value.split(" ")[0],
                    value.split(" ")[6],
                ];
                if (!is_connected || !package_name) {
                    continue;
                }
                if (is_connected !== "CONNECT" && is_connected !== "DISCONNECT") {
                    continue;
                }
                // console.log(is_connected, package_name);


                if (is_connected === "DISCONNECT") {
                    if (Object.keys(this.service_data).length === 0) {
                        continue;
                    }

                    this.service_data[package_name]["end"] = time;

                    const time_got = new Date(`2023-${time}`);
                    if (
                        this.service_history[
                            this.service_history.length - 1
                        ][2] === "-1"
                    ) {
                        const time_start = new Date(
                            `2023-${
                                this.service_history[
                                    this.service_history.length - 1
                                ][1]
                            }`
                        );
                        if (time_got > time_start) {
                            this.service_history[
                                this.service_history.length - 1
                            ][2] = time;
                            this.apps_service_history[package_name][
                                this.apps_service_history[package_name].length -
                                    1
                            ]["end"] = time;
                        }
                    }
                } else {
                    this.service_data[package_name] = {
                        start: time,
                        end: "-1",
                    };

                    if (this.service_history.length === 0) {
                        this.service_history.push([package_name, time, "-1"]);
                        this.apps_service_history[package_name] = [
                            { start: time, end: "-1" },
                        ];
                    } else {
                        const time_got = new Date(`2023-${time}`);
                        const time_last = new Date(
                            `2023-${
                                this.service_history[
                                    this.service_history.length - 1
                                ][1]
                            }`
                        );

                        if (time_got > time_last) {
                            this.service_history.push([
                                package_name,
                                time,
                                "-1",
                            ]);
                            if (!this.apps_service_history[package_name]) {
                                this.apps_service_history[package_name] = [
                                    { start: time, end: "-1" },
                                ];
                            } else {
                                this.apps_service_history[package_name].push({
                                    start: time,
                                    end: "-1",
                                });
                            }
                        }
                    }
                }

                if (
                    line ===
                    "== Camera service events log (most recent at top): =="
                ) {
                    break;
                }
            }
        }
    }
}

// if (require.main === module) {
//     const co = new CameraObserver();
//     // co.connect_json("camera_data.json");

//     // Choose one of the following functions to run
//     // co.to_get_service_data(); // to get the last use of the camera for each app
//     // co.to_get_service_history(); // to get the history of camera usage
//     co.to_get_apps_service_history(); // to get the history of camera usage for each app

//     // Choose one of the following functions to run
//     // co.look(); // will get camera history and save it to the JSON file
//     co.look(save = false, useTempFile = false); // will get camera history and watch for 100 seconds and update the JSON file if a new app uses the camera
//     console.log(co.get_data());
// }   

module.exports = new CameraObserver();

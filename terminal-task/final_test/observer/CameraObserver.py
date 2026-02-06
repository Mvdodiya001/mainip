# Author: Swaroop Dora
# Github: automateFreely

import datetime
import re
import sys
from Observer import Observer


class CameraObserver(Observer):
    def __init__(self, temp_file_name: str = "temp_camera.txt") -> None:
        super().__init__()
        self.set_text_file(temp_file_name)
        command:str = f"adb shell dumpsys media.camera > {temp_file_name}"
        self.set_command(command)

    def __look__(self) -> None:
        with open(self.text_file, "r") as f:
            data:list[str] = f.readlines()
            data:list[str] = data[:120][::-1]
            start:int = 0
            line:str
            for line in data:
                line = line.strip()
                if (line == "..."):
                    start = 1
                    continue
                if start == 1:
                    try:
                        [time, value] = line.split(" : ")
                    except:
                        continue
                    try:
                        package_name = value.split(" ")[6]
                        is_connected = value.split(" ")[0]
                    except:
                        continue
                    if re.match(r"[a-z]+[.][a-z]+", package_name) is None:
                        continue
                    if (is_connected == "DISCONNECT"):
                        if len(self.service_data.keys()) == 0:
                            continue
                        self.service_data[package_name]["end"] = time
                        time_got = datetime.datetime.strptime(
                            "2023-"+time, "%Y-%m-%d %H:%M:%S")
                        if (self.service_history[-1][2] == '-1'):
                            time_start = datetime.datetime.strptime(
                                "2023-"+self.service_history[-1][1], "%Y-%m-%d %H:%M:%S")
                            if time_got > time_start:
                                self.service_history[-1][2] = time

                                self.apps_service_history[package_name][-1]["end"] = time
                    else:
                        self.service_data[package_name] = {
                            "start": time, "end": "-1"}
                        if len(self.service_history) == 0:
                            self.service_history.append(
                                [package_name, time, "-1"])
                            self.apps_service_history[package_name] = [
                                {"start": time, "end": "-1"}]
                        else:
                            time_got = datetime.datetime.strptime(
                                "2023-"+time, "%Y-%m-%d %H:%M:%S")
                            time_last = datetime.datetime.strptime(
                                "2023-"+self.service_history[-1][1], "%Y-%m-%d %H:%M:%S")
                            if time_got > time_last:
                                self.service_history.append(
                                    [package_name, time, "-1"])
                                if (package_name not in self.apps_service_history.keys()):
                                    self.apps_service_history[package_name] = [
                                        {"start": time, "end": "-1"}]
                                else:
                                    self.apps_service_history[package_name].append(
                                        {"start": time, "end": "-1"})
                    if (line == "== Camera service events log (most recent at top): =="):
                        break


if __name__ == "__main__":
    co = CameraObserver()
    co.connect_json("camera_data.json")

    if(len(sys.argv) != 3):
        print("Please enter the correct number of arguments")
        print("Usage: python CameraObserver.py <option> <time>")
        print("OPTION: ")
        print("\t0: to get the last use of camera for each app")
        print("\t1: to get the history of camera usage")
        print("\t2: to get the history of camera usage for each app")
        print("\t3: to get the history of camera usage for each app for a particular time")
        print("TIME: time in seconds to watch for camera usage")
        exit()

    # Choose one of the following functions to run
    if(sys.argv[1] == "0"):
        co.to_get_service_data()            # to get the last use of camera for each app
    elif (sys.argv[1] == "1"):
        co.to_get_service_history()         # to get the history of camera usage
    elif (sys.argv[1] == "2"):
        co.to_get_apps_service_history()     # to get the history of camera usage for each app

    # Choose one of the following functions to run
    # co.look()                          # will get camera history and save to the json file
    co.watch(int(sys.argv[2]))                        # will get camera history and watch for 100 seconds and if new app uses camera, it will be update to the json file


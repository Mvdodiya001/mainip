## Services Observer
Author: [Swaroop Dora](https://github.com/automatefreely)

## Requirements
* Python 3.6 or above [Get Python](https://www.python.org/downloads/)
* Android device with developer option activated [See steps](https://developer.android.com/studio/debug/dev-options)
* USB cable to connect the android device to the computer 
* ADB installed in the computer [Download ADB](https://developer.android.com/studio/command-line/adb)

## Description
This is a python script to observe the services running in an android device. It can be used to observe the camera usage of the apps in an android device. It can be used to get the last use of camera for each app, the history of camera usage and the history of camera usage for each app.


## How it run
* Activate and open Developer option in your android device
* Connect your android device to the computer via USB cable
* Open CameraObserver.py and change the main section of the code according to need:
  ```python
  if __name__ == "__main__":
    co = CameraObserver()
    co.connect_json("camera_data.json")
    # co.to_get_camera_data()            # Mode 1. to get the last use of camera for each app
    # co.to_get_camera_history()         # Mode 2. to get the history of camera usage
    co.to_get_apps_service_history()     # Mode 3. to get the history of camera usage for each app
    # co.look()
    co.watch(40)

  ```
* Run CameraObserver.py
* co.look() will look the camera data once
* co.watch(40) will observe the camera data for next 40 seconds and will save the data in camera_data.json file continently if any change is detected or any app uses the camera
* Output for all the modes will be saved in camera_data.json file
* if Mode 1 is used, the output will be saved in camera_data.json file in the following format:
  ```json
  {
    "app_name": {
        "start": "start_time",
        "end": "end_time"
    },
    "app_name2": {
        "start": "start_time2",
        "end": "end_time2"
    }
  }
  ```
* if Mode 2 is used, the output will be saved in camera_data.json file in the following format:
  ```json
  [
    {
        "app_name": "app_name",
        "start": "start_time",
        "end": "end_time"
    },
    {
        "app_name": "app_name",
        "start": "start_time",
        "end": "end_time"
    }
  ]
  ```
* if Mode 3 is used, the output will be saved in camera_data.json file in the following format:
  ```json
  {
    "app_name": [
        {
            "start": "start_time",
            "end": "end_time"
        },
        {
            "start": "start_time",
            "end": "end_time"
        }
    ],
    "app_name2": [
        {
            "start": "start_time",
            "end": "end_time"
        },
    ]
  }
  ```
* if end is -1 this means that the camera is still in use by that app
* Value of start and end is ofthe format "09-09 11:41:55" (month-day hour:minute:second)
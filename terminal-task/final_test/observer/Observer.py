# Author: Swaroop Dora (AutomateFreely)


from abc import ABC, abstractmethod
import datetime
import subprocess
import json

PACKAGE_NAME = START_TIME = END_TIME = str
class Observer(ABC):
    """
    Observer class is an abstract class that can be inherited to 
    create a new observer of a service where you only need to implement 
    the __look__ and __init__ methods and the rest of the code is taken 
    care of by the Observer class.
    """
    def __init__(self) -> None:
        self.service_data: dict[PACKAGE_NAME, dict] = {}
        self.service_history: list[list[PACKAGE_NAME,
                                        START_TIME, END_TIME]] = []
        self.apps_service_history: dict[PACKAGE_NAME,
                                        list[{START_TIME, END_TIME}]] = {}

        self.text_file: str = "x.txt"
        self.json_file: [str, None] = None

        self.__to_get_service_data = False
        self.__to_get_service_history = False
        self.__to_get_apps_service_history = False

    def set_text_file(self, text_file: str) -> None:
        self.text_file = text_file
    
    def set_command(self, command: str) -> str:
        self.command = command

    def to_get_service_data(self) -> None:
        self.__to_get_service_data = True
        self.__to_get_service_history = False
        self.__to_get_apps_service_history = False

    def to_get_service_history(self) -> None:
        self.__to_get_service_data = False
        self.__to_get_service_history = True
        self.__to_get_apps_service_history = False

    def to_get_apps_service_history(self) -> None:
        self.__to_get_service_data = False
        self.__to_get_service_history = False
        self.__to_get_apps_service_history = True

    def connect_json(self, json_file: str) -> None:
        self.json_file = json_file
        # clear this json file
        with open(self.json_file, "w") as f:
            json.dump({}, f, indent=4)

    def run_command(self) -> None:
        process = subprocess.Popen(
            self.command, stdout=subprocess.PIPE, shell=True)
        process.wait()

    def look(self, save: bool = True) -> None:
        self.run_command()
        self.__look__()
        if save:
            self.save()

    @abstractmethod
    def __look__():
        ...

    def watch(self, timesec: int, save=True) -> None:
        current_time = datetime.datetime.now()
        while (datetime.datetime.now() - current_time).seconds < timesec:
            try:
                self.look()
            except KeyboardInterrupt:
                break

    def save(self) -> None:
        with open(self.json_file, "w") as f:
            if (self.__to_get_service_data):
                json.dump(self.service_data, f, indent=4)
            elif (self.__to_get_service_history):
                json.dump(self.service_history, f, indent=4)
            elif (self.__to_get_apps_service_history):
                json.dump(self.apps_service_history, f, indent=4)
        # if (self.__to_get_service_data):
        #     print(json.dumps(self.service_data))
        # elif (self.__to_get_service_history):
        #     print(json.dumps(self.service_history))
        # elif (self.__to_get_apps_service_history):
        #     print(json.dumps(self.apps_service_history))
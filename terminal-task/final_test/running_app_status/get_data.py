import sys
from run_command import run_command
from third_party_app_list import is_in_3rd_party_app_list

PID = int

DATA_HEADER: list[str] = ['PID', 'USER', 'PR', 'NI', 'VIRT', 'RES', 'SHR', 'S', 'CPU', 'MEM', 'TIME', 'PACKAGE_NAME']

with open(sys.argv[1], 'r') as f:
    THIRD_PARTY_APPS_LIST_COSTOME = list(map(lambda x: x[:-1], f.readlines()))

class Package:
    def __init__(self, data: list[str]):
        self.package_data_dict  = dict(zip(DATA_HEADER, data))
        self.package_name:str   = self.package_data_dict['PACKAGE_NAME']
        self.cpu_usage:float    = float(self.package_data_dict['CPU'])
        self.mem_usage:float    = float(self.package_data_dict['MEM'])

    def print_data(self):
        print(self.package_data_dict["PID"], end=" ")
        print(f"{self.package_name:<40} {self.cpu_usage:<10} {self.mem_usage:<10} {self.package_data_dict['TIME']}")

all_packages: dict[PID, Package] = {}

def fill_data():
    for line in run_command("adb shell top"):
        data:str = (line.decode('utf-8').strip())
        data = data.split()
        if(len(data) == 12):                               ## ignored some info
            if(is_in_3rd_party_app_list(data[-1], THIRD_PARTY_APPS_LIST_COSTOME)):
                all_packages[data[0]] = Package(data)
                all_packages[data[0]].print_data()

if __name__ == "__main__":
    fill_data()

import os
import subprocess
import sys

TITLE_LIST = "  PID USER         PR  NI VIRT  RES  SHR S [%CPU] %MEM     TIME+ P_NAME".split()


HELP_LIST = {
    "PID":    "Shows task\’s unique process id.",
    "USER":   "User name of owner of task.",
    "PR":     "Stands for priority of the task.",
    "NI":     "Represents a Nice Value of task. A Negative nice value implies higher priority, and positive Nice value means lower priority.",
    "VIRT":   "Total virtual memory used by the task.",
    "RES":    "How much physical RAM the process is using, measured in kilobytes",
    "SHR":    "Represents the amount of shared memory(kb) used by a task.",
    "S":      "Status of the process. D->Uninterruptible sleep, R->Running, S->Sleeping, T->Traced (stopped), Z->Zombie",
    "[%CPU]":   "Represents the CPU usage.",
    "%MEM":   "Shows the Memory usage of task.",
    "TIME+":  "CPU Time, the same as ‘TIME’, but reflecting more granularity through hundredths of a second.",
    "P_NAME": "Packet name"
}


def print_data(data: str):
    data_dict = {}
    for i, j, z in zip(TITLE_LIST, data.replace("\n", "").split(), HELP_LIST):
        # if (i == z): print(f"\t{i:<10}:{j:<20}-->\t{HELP_LIST[z]}")
        # else: print(f"\t{i:<15}:{j}")
        data_dict[i]=j
    # print(data_dict)
    return data_dict
        


def get_data(packet_name:str):
    print(packet_name)
    adbprocess = os.popen('adb shell top')
    while True:
        line = adbprocess.readline()

        if packet_name in line and line and "task" not in line.lower():
            data_dict = print_data(line)
            print(str(data_dict))
            f = open("memory_usage_data.txt", "w")
            f.write(str(data_dict))
            f.close()
            
    # return data_dict


if __name__ == "__main__":
    # data_dict = 
    get_data("tplink")
    # print(data_dict)

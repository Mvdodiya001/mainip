from ipToVender import ipToVender
from portFinder import portfinder
from portToDeviceType import getDeviceType


# outside libary
import sys
import os
import re

import warnings
warnings.filterwarnings("ignore")


def getData(ip):
    ports = portfinder(ip)
    vender = ipToVender(ip)
    
    deviceType = getDeviceType(ports["ports"])
    return vender, deviceType



if __name__ == "__main__":
    if len(sys.argv) > 3:
        print("Specified too many argument")
        sys.exit()
    if len(sys.argv) < 2:
        print("You need to specify the ip and interface (optional)")
        sys.exit()
    ip = sys.argv[1]
    try:
        iface = sys.argv[2]
    except:
        iface = os.popen('ip route | awk \'/default/ {print $5}\'').read().strip()
    
    data = getData(ip)
    vender = data[0]
    deviceType = data[1]
    
    out = os.popen('cd final_proj_3 && sudo ./interface.sh {0} {1} && cd ..'.format(ip, iface)).read()
    print(out)

    try:
        x = re.search(r"Device Identified as:[ ]*(.*)", str(out)).group(1)
    except:
        x = "Unknown"

    print(f"Name of the vendor : {vender}")
    print(f"Device type : {deviceType} / {x}")
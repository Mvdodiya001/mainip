from ipToVender import ipToVender
from portFinder import portfinder
from portToDeviceType import getDeviceType


# outside libary
import sys


def getData(ip):
    ports = portfinder(ip)
    vender = ipToVender(ip)
    
    deviceType = getDeviceType(ports["ports"])
    return vender, deviceType



if __name__ == "__main__":
    
    if len(sys.argv) > 2:
        print("Specified too many argument")
        sys.exit()
    if len(sys.argv) < 2:
        print("You need to specify the ip")
        sys.exit()
    ip = sys.argv[1]
    
    data = getData(ip)
    vender = data[0]
    deviceType = data[1]
    #print(f"ip : {ip}")
    print(f"Name of the vendor : {vender}")
    print(f"Device type : {deviceType}")
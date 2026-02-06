from ipToMac import ipToMac
import sys

if(len(sys.argv) < 2):
    print("Please provide IP Address")
else:
    ipAddress = sys.argv[1]
    print(ipToMac(ipAddress))
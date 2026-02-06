from ipToMac import  ipToMac
from macToVender import getVenderFromMacPrefix

def ipToVender(ip):
    macAddress = ipToMac(ip)
    if(macAddress):
        macPrefix = macAddress[0:8]               # some macPrefix has more charecture
        return getVenderFromMacPrefix(macPrefix.upper())
    else:
        return "vendor unknown"


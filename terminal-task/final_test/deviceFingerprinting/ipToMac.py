from subprocess import Popen, PIPE
import re

def ipToMac(ip):
    pid = Popen(["arp", "-n", ip], stdout=PIPE)
    s = pid.communicate()[0]
    try:
        macAddress = re.search(r"(([a-f\d]{1,2}\:){5}[a-f\d]{1,2})", s.decode("utf-8")).groups()[0]
    except:
        print(f"Host unreachable")
        return
    return macAddress    # add error handling

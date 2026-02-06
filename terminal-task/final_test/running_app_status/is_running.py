import sys
from run_command import run_command

def is_running(package_name): return True if([pid for pid in run_command(f"adb shell pidof {package_name}", display_error=False)]) else False
if(__name__=="__main__"): print(is_running(sys.argv[1]))
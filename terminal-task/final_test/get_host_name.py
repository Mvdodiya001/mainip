import socket
import sys
import subprocess
import platform

def get_device_name(ip):
    is_running_script = (__name__ == "__main__") and 0
    name = []

    try:
        if platform.system() == "Windows":
            output = subprocess.check_output(["nbtstat", "-A", ip])
            lines = output.decode("utf-8").splitlines()
           
            for line in lines:
                if(len(line.split())==4 and line.startswith('    ') and not 'mac' in line.lower() and "UNIQUE" in line):
                    x = line.split()[0]
                    if x not in name:
                        name.append(line.split()[0])
        else:  # Assume Linux
            output = subprocess.check_output(["nmblookup", "-A", ip])
            lines = output.decode("utf-8").splitlines()[1:-3]
           
            for line in lines:
                if "GROUP" not in line:
                    x = line.split()[0]
                    if x not in name:
                        name.append(line.split()[0])

       
    except FileNotFoundError:
        if(is_running_script):
            print("The required utility is not installed.")
    except subprocess.CalledProcessError:
        if(is_running_script):
            print("Check IP specified! IP may not exist on network!")
    # print(name)
    if(name):
        return " ".join(name)
    else:
        return "unknown"
    
if __name__ == "__main__":
    if len(sys.argv) > 2:
        print("Specified too many argument")
        sys.exit()
    if len(sys.argv) < 2:
        print("You need to specify the ip")
        sys.exit()
    ip = sys.argv[1]
    ## print(ip)
    print(f"Hostname: {get_device_name(ip)}")

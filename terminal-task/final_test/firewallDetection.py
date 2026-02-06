from scapy.all import *
import sys
import re

def get_open_ports_list(file):
    with open(file, "r") as f:
        content = f.read()

    ports = re.findall(r'^(\d+)/', content, re.MULTILINE)  # Extracts only port numbers
    # print(ports)
    return ports 


def send_syn(ip_src, ip_dst, port):
    # Crafting the TCP SYN packet
    ip = IP(src=ip_src, dst=ip_dst)
    tcp = TCP(sport=RandShort(), dport=port, flags="S")

    # Sending the packet and waiting for response
    response = sr1(ip/tcp, timeout=2, verbose=False)
    with open("response.txt", "w") as f:
        f.write(str(response))
    return response

def check_ack_and_icmp(response):
    if response:
        if response.haslayer(TCP):
            # Checking if the response has the ACK flag set
            if response[TCP].flags == "SA":
                return 0  # Service is running and firewall is disabled
            # elif response[TCP].flags == "RA":
            #     return 0  # Service is running and firewall is enabled (REJECT rule) or Service is not running and firewall is disabled
        elif response.haslayer(ICMP):
            # Checking if the response is an ICMP response
            if response[ICMP].type == 3 and response[ICMP].code in [0, 1, 2, 3, 9, 10, 13]:
                # return 0  # ICMP type 3 response (various codes)
                return 1
    else:
        return 1  # Service is running and DROP rule is enabled
    
    return -1  # No ACK or ICMP response received

if __name__ == "__main__":
    # Take source IP, destination IP, and port as command-line arguments
    source_ip = sys.argv[1]
    destination_ip = sys.argv[2]
    destination_port_file = sys.argv[4] #this is a file
    
    destination_port_list = get_open_ports_list(destination_port_file)
    # result = 1
    

    for port in destination_port_list:
        # print(port)
        response = send_syn(source_ip, destination_ip, int(port))
        
        result = check_ack_and_icmp(response)
        # print(f'{port=} {response=} {result=}')

        if result == 0: # Firewall is not running [Possibly]
            print(0)
            exit()
        elif result == -1:
            print(-1)
            exit()

    print(1)

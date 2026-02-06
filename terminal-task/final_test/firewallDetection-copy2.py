from scapy.all import *
import sys

def send_syn(ip_src, ip_dst, port):
    # Crafting the TCP SYN packet
    ip = IP(src=ip_src, dst=ip_dst)
    tcp = TCP(sport=RandShort(), dport=port, flags="S")

    # Sending the packet and waiting for response
    response = sr1(ip/tcp, timeout=2, verbose=False)
    return response

def check_ack_and_icmp(response):
    if response:
        if response.haslayer(TCP):
            # Checking if the response has the ACK flag set
            if response[TCP].flags == "SA":
                return 0  # Service is running and firewall is disabled
            elif response[TCP].flags == "RA":
                return 0  # Service is running and firewall is enabled (REJECT rule) or Service is not running and firewall is disabled
        elif response.haslayer(ICMP):
            # Checking if the response is an ICMP response
            if response[ICMP].type == 3 and response[ICMP].code in [0, 1, 2, 3, 9, 10, 13]:
                return 0  # ICMP type 3 response (various codes)
    else:
        return 1  # Service is running and DROP rule is enabled
    
    return -1  # No ACK or ICMP response received

if __name__ == "__main__":
    # Take source IP, destination IP, and port as command-line arguments
    source_ip = sys.argv[1]
    destination_ip = sys.argv[2]
    destination_port_list = sys.argv[3] # Hard-code detected "Galat hai, bhai"

    

    response = send_syn(source_ip, destination_ip, destination_port)
    result = check_ack_and_icmp(response)
    
    print(result)

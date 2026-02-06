import argparse
import re
import ipaddress
from scapy.all import rdpcap, DNS, DNSQR, DNSRR, Raw

ipv4_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
ipv6_pattern = r'\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b'
url_pattern = r'(https?://[^\s]+|www\.[^\s]+)'

def is_local_ip(ip_str):
    try:
        if isinstance(ip_str, bytes):
            ip_str = ip_str.decode('utf-8')
        
        ip_obj = ipaddress.ip_address(ip_str)
        return ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
    except ValueError:
        return False

def process_packet(packet):
    if packet.haslayer(DNS):
        dns_layer = packet[DNS]

        if dns_layer.qr == 0 and dns_layer.haslayer(DNSQR):
            dns_queries = [dns_layer[DNSQR].qname.decode('utf-8', errors='ignore').strip('.')]
            print(f"Info: {packet.summary()}")
            print(f"DNS Queries: {'.'.join(dns_queries)}")
            print('-' * 100)

        elif dns_layer.qr == 1:
            dns_answers = []
            for i in range(dns_layer.ancount):
                answer = dns_layer.an[i]
                if hasattr(answer, 'rdata'):
                    rdata = answer.rdata
                    if isinstance(rdata, list):
                        for item in rdata:
                            item_str = item.decode('utf-8', errors='ignore') if isinstance(item, bytes) else str(item)
                            if not is_local_ip(item_str):
                                dns_answers.append(item_str)
                    else:
                        rdata_str = rdata.decode('utf-8', errors='ignore') if isinstance(rdata, bytes) else str(rdata)
                        if not is_local_ip(rdata_str):
                            dns_answers.append(rdata_str)

            if dns_answers:
                print(f"Info: {packet.summary()}")
                print(f"DNS Answers: {dns_answers}")
                print('-' * 100)

    else:
        if packet.haslayer(Raw):
            try:
                payload = packet[Raw].load.decode('utf-8', errors='ignore')
            except Exception:
                return

            ipv4_matches = re.findall(ipv4_pattern, payload)
            if ipv4_matches:
                ipv4_matches = [ip for ip in ipv4_matches if not is_local_ip(ip)]
                if ipv4_matches:
                    print(f"Info: {packet.summary()}")
                    print(f"IPv4 Addresses found: {', '.join(ipv4_matches)}")
                    print('-' * 100)

            ipv6_matches = re.findall(ipv6_pattern, payload)
            if ipv6_matches:
                ipv6_matches = [ip for ip in ipv6_matches if not is_local_ip(ip)]
                if ipv6_matches:
                    print(f"Info: {packet.summary()}")
                    print(f"IPv6 Addresses found: {', '.join(ipv6_matches)}")
                    print('-' * 100)

            url_matches = re.findall(url_pattern, payload)
            if url_matches:
                print(f"Info: {packet.summary()}")
                print(f"URLs found: {', '.join(url_matches)}")
                print('-' * 100)

def process_pcap_file(pcap_file):
    try:
        packets = rdpcap(pcap_file)
        print(f"Processing pcap file: {pcap_file}")
        print('-' * 100)
        for packet in packets:
            process_packet(packet)
    except FileNotFoundError:
        print(f"Error: File {pcap_file} not found.")
    except Exception as e:
        print(f"Error processing pcap: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Analyze network packets from a pcap file.')
    parser.add_argument('pcap_file', type=str, help='Path to the pcap file')
    args = parser.parse_args()

    process_pcap_file(args.pcap_file)

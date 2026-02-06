import argparse
import re
from scapy.all import sniff, UDP, TCP, IP, DNS, DNSQR, DNSRR, Raw

# Author: Swaroop Dora
# GitHub: https://github.com/automatefreely

ipv4_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
ipv6_pattern = r'\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b'
url_pattern = r'(https?://[^\s]+|www\.[^\s]+)'


def is_local_ip(ip_address):

    if isinstance(ip_address, bytes):
        ip_address = ip_address.decode('utf-8')

    private_ipv4_ranges = [
        ('10.0.0.0', '10.255.255.255'),
        ('172.16.0.0', '172.31.255.255'),
        ('192.168.0.0', '192.168.255.255'),
        ('127.0.0.0', '127.255.255.255')
    ]

    for start_ip, end_ip in private_ipv4_ranges:
        if start_ip <= ip_address <= end_ip:
            return True

    if ip_address == '::1' or ip_address.startswith('fc') or ip_address.startswith('fd'):
        return True

    return False


def process_packet(packet):

    if packet.haslayer(DNS):
        dns_layer = packet[DNS]

        if dns_layer.qr == 0:
            dns_queries = [dns_layer[DNSQR].qname.decode('utf-8').strip('.')]
            print(f"Info: {packet.summary()}")
            print(f"DNS Queries: {'.'.join(dns_queries)}")
            print('-' * 100)

        elif dns_layer.qr == 1:
            dns_answers = []
            for i in range(dns_layer.ancount):
                answer = dns_layer.an[i]

                if hasattr(answer, 'rdata') and not is_local_ip(answer.rdata):
                    dns_answers.append(answer.rdata.decode(
                        'utf-8') if isinstance(answer.rdata, bytes) else answer.rdata)
                else:

                    ...

            if dns_answers:
                print(f"Info: {packet.summary()}")
                print(f"DNS Answers: {dns_answers}")
                print('-' * 100)

    else:
        if packet.haslayer(Raw):
            payload = packet[Raw].load.decode('utf-8', errors='ignore')

            ipv4_matches = re.findall(ipv4_pattern, payload)
            if ipv4_matches:

                ipv4_matches = [
                    ip for ip in ipv4_matches if not is_local_ip(ip)]
                if ipv4_matches:
                    print(f"Info: {packet.summary()}")
                    print(f"IPv4 Addresses found: {', '.join(ipv4_matches)}")
                    print('-' * 100)

            ipv6_matches = re.findall(ipv6_pattern, payload)
            if ipv6_matches:

                ipv6_matches = [
                    ip for ip in ipv6_matches if not is_local_ip(ip)]
                if ipv6_matches:
                    print(f"Info: {packet.summary()}")
                    print(f"IPv6 Addresses found: {', '.join(ipv6_matches)}")
                    print('-' * 100)

            url_matches = re.findall(url_pattern, payload)
            if url_matches:
                print(f"Info: {packet.summary()}")
                print(f"URLs found: {', '.join(url_matches)}")
                print('-' * 100)


def start_sniffing(interface, ip):

    filter_str = f"tcp or udp and (src host {ip} or dst host {ip})"
    print(
        f"Starting packet capture on interface: {interface} with filter: {filter_str}")
    print('-' * 100)

    sniff(iface=interface, filter=filter_str, prn=process_packet, store=0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Capture and analyze network packets.')
    parser.add_argument('interface', type=str,
                        help='Network interface to capture packets from')
    parser.add_argument('ip', type=str, help='IP address to filter packets by')
    args = parser.parse_args()

    start_sniffing(args.interface, args.ip)

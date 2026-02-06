#!/bin/sh

# Check if an IP address argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <ip_address>"
    exit 1
fi

# Extract the first three octets from the provided IP address
ip_range=$(echo "$1" | awk -F. '{print $1"."$2"."$3}')

output_file="reachable_ips.txt"

# Clear the output file
> "$output_file"

for i in $(seq 0 255); do
    ip="$ip_range.$i"
    if ping -c 1 -W 1 "$ip" &> /dev/null; then
        echo "$ip" >> "$output_file"
    fi
done

echo "Reachable IPs saved to $output_file"


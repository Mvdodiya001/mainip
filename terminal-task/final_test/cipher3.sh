#!/bin/bash

# Take IP address as input
#read -p "Enter IP address: " ip_addr
ip_addr=$1

# Check if port 443 is open
port_status=$(nmap -p 443 --open $ip_addr | grep "443/tcp")

if [ -n "$port_status" ]; then
    #echo "Port 443 is open."
    
    # Extract protocol and cipher details using openssl s_client command
    # output=$(openssl s_client -showcerts -servername $ip_addr -connect $ip_addr:443 2>/dev/null & sleep 10 ; kill $!)
    output=$(openssl s_client -showcerts -servername $ip_addr -connect $ip_addr:443 2>/dev/null & echo -ne '\n')

    echo -ne '\n'
    
    # Print protocol and cipher details
    protocol=$(echo "$output" | grep 'Protocol' | awk -F': ' '{print $2}' | tr -d '[:space:]')
    cipher=$(echo "$output" | grep 'Cipher' | awk -F': ' '{print $2}' | tr -d '[:space:]')

    # Print the protocol and cipher details
    #echo "Protocol: $protocol"
    echo "Cipher Suite used: $cipher"

    # Check if the cipher is vulnerable
    vulnerable=$(grep -o "$cipher" vulnerableCipher.txt)
    if [ -n "$vulnerable" ]; then
        echo "Vulnerable or Blacklisted ciphersuite or No Encryption or Unknown: $cipher"
    else
        echo "Not vulnerable"
    fi
else
    echo "Port 443 is closed."
fi


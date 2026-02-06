#!/bin/bash
# interface=$1
# echo $$interface
# substr=${interface:0:3}

# if [ $substr == "enp" ]; then
# 	echo "No wireless adapter found"
# 	exit 1
# fi

# Check for the presence of a wireless interface
wireless_interface=$(iw dev | grep -m 1 Interface | awk '{print $2}')

if [ -z "$wireless_interface" ]; then
    echo "No wireless adapter found"
else
    echo "Wireless adapter found"

    # Perform a scan and extract frequency and protocol information
    #scan_output=$(iwlist $interface scan)
    scan_output=$(iwlist $wireless_interface scan)

    # Extract frequency
    frequency=$(echo "$scan_output" | grep -m 1 'Frequency' | awk -F: '{print $2}' | awk '{print $1" "$2}')
    if [ -n "$frequency" ]; then
        echo "Frequency: $frequency"
    else
        echo "Frequency information not found"
    fi

    # Extract IEEE protocol
    ieee_protocol=$(echo "$scan_output" | grep -m 1 'IE: IEEE' | awk '{print $3}')
    if [ -n "$ieee_protocol" ]; then
        echo "IEEE Protocol: $ieee_protocol"
    else
        echo "IEEE Protocol information not found"
    fi
fi


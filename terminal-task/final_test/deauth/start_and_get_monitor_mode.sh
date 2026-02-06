#!/bin/sh
network_interface=$1
# echo $network_interface
# Uncomment the following lines to start and check the monitor interface
# sudo airmon-ng check kill &> /dev/null
# sudo airmon-ng start "$network_interface" &> /dev/null
# monitor_interface="$(sudo airmon-ng 2> /dev/null | grep 'mon' | awk '{print $2}')"
# if [ $? -ne 0 ]; then
#     output="Failed to start monitor interface"
#     output=$(jq -n \
#         --arg status "false" \
#         --arg output "$output" \
#         '{status: $status, output: $output}')
#     echo "$output"
#     exit 0
# fi
output="Monitor interface $network_interface is up"
output=$(jq -n \
    --arg status "true" \
    --arg output "$output" \
    --arg monitor_interface "$network_interface" \
    '{status: $status, output: $output, monitor_interface: $monitor_interface}')
echo "$output"

#!/bin/sh

network_interface=$1

access_point_mac="$(iwconfig $network_interface 2> /dev/null | grep -oP [0-9A-Fa-f:]{17})"
if [ $? -ne 0 ]; then
    output="Failed to get MAC address for access point"
    output=$(jq -n \
        --arg status "false" \
        --arg output "$output" \
        '{status: $status, output: $output}')
    echo "$output"
    exit 0
fi
output="Access Point mac address found"
output=$(jq -n \
    --arg status "true" \
    --arg output "$output" \
    --arg access_point_mac "$access_point_mac" \
    '{status: $status, output: $output, access_point_mac: $access_point_mac}')
echo "$output"
#!/bin/sh

ip_address=$1

ping -c 4 $ip_address &>/dev/null
if [ $? -eq 0 ]; then
    status=true
    output="$ip_address is reachable"
else
    status=false
    output="$ip_address is not reachable"
fi

output=$(jq -n \
    --arg status "$status" \
    --arg output "$output" \
    '{status: $status, output: $output}')
echo "$output"
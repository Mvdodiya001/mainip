#!/bin/sh

sudo service NetworkManager restart
if [ $? -eq 0 ]; then
    status=true
    output="NetworkManager service started successfully"
    sleep 15
else
    status=false
    output="Failed to start NetworkManager service"
fi

output=$(jq -n \
    --arg status "$status" \
    --arg output "$output" \
    '{status: $status, output: $output}')
echo "$output"
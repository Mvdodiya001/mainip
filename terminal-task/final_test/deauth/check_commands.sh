#!/bin/sh

commands=("ip" "arp" "airmon-ng" "airodump-ng" "aireplay-ng")
for cmd in "${commands[@]}"; do
    if ! command -v $cmd &> /dev/null; then
        output=$(jq -n \
            --arg status "false" \
            --arg output "$cmd could not be found" \
            '{status: $status, output: $output}')
        echo "$output"
        exit 0
    fi
done

output=$(jq -n \
    --arg status "true" \
    --arg output "All commands are available" \
    '{status: $status, output: $output}')
echo "$output"

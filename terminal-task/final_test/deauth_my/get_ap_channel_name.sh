#!/bin/bash

monitor_interface=$1
bssid=$2

sudo timeout 10 airodump-ng --output-format csv -w channel --write-interval 1 --ignore-negative-one $monitor_interface --bssid $bssid &> /dev/null

csv_file="channel-01.csv"
# csv_file=$(find . -maxdepth 1 -type f -name 'channel-*.csv' | grep -E 'channel-[0-9]+\.csv')
channel=$(grep -E "^$bssid," "$csv_file" | cut -d',' -f4)

# Search for the row
#result_row=$(grep -m 1 ",$value," "$csv_file")

rm $csv_file
output="Channel found"
output=$(jq -n \
    --arg status "true" \
    --arg output "$output" \
    --arg channel "$channel" \
    '{status: $status, output: $output, channel: $channel}')
echo "$output"


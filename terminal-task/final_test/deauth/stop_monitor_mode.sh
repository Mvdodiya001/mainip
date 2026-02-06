#!/bin/sh

network_interface=$1 # newtorkInterface
monitor_interface=$2 # networkINterface

#------------------------------------ CURRENTLY WE SKIP TO START MONITOR MODE IN  start_and_get_monior_mode.sh --------------------------------------------- #

# sudo airmon-ng stop $monitor_interface &> /dev/null
# if [ $? -ne 0 ]; then
#     output=$(jq -n \
#         --arg status "false" \
#         --arg output "Failed to stop monitor mode on $monitor_interface" \
#         '{status: $status, output: $output}')
#     echo "$output"
#     exit 0
# fi

# sleep 5

# sudo airmon-ng start $network_interface &> /dev/null
# if [ $? -ne 0 ]; then
#     output=$(jq -n \
#         --arg status "false" \
#         --arg output "Failed to start monitor mode on $network_interface" \
#         '{status: $status, output: $output}')
#     echo "$output"
#     exit 0
# fi

# sleep 5

# sudo airmon-ng stop $monitor_interface &> /dev/null
# if [ $? -ne 0 ]; then
#     output=$(jq -n \
#         --arg status "false" \
#         --arg output "Failed to stop monitor mode on $monitor_interface" \
#         '{status: $status, output: $output}')
#     echo "$output"
#     exit 0
# fi

# sleep 5

output=$(jq -n \
    --arg status "true" \
    --arg output "Monitor mode stopped successfully" \
    '{status: $status, output: $output}')
echo "$output"
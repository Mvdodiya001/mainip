#!/bin/sh

# existing_monitor_interface=$(iwconfig &>/dev/null | grep "mon" | awk '{print $1}')

# echo "$existing_monitor_interface"

# # if [ $? -eq 0 ]; then
# #     output="Monitor interface is up. Stopped the monitor interface $existing_monitor_interface"
# #     sudo airmon-ng stop $existing_monitor_interface
# #     sleep 10
# # else
    
# #     output="Monitor interface is down."
# # fi

# # output=$(jq -n \
# #     --arg status true \
# #     --arg output "$output" \
# #     '{status: $status, output: $output}')
# # echo "$output"


# !/bin/sh

# result=$(iwconfig | grep "mon") 
iwconfig > iwconfig_output.txt 2>&1
existing_monitor_interface=$(<iwconfig_output.txt)
# echo $existing_monitor_interface

words_with_mon=$(echo "$existing_monitor_interface" | grep -o '\b\w*mon\w*\b')

# echo $words_with_mon

# IFS=' ' read -ra words <<< "$existing_monitor_interface"

# # Loop over each word
# result=""
# for word in "${words[@]}"; do
#     # Check if the word contains the substring "mon"
#     # echo $word
#     if [[ "$word" == *mon* ]]; then
#         # Output the word
#         result=$word
#         # Exit the loop after finding the first occurrence
#         break
#     fi
# done
# echo $result

if [[ $words_with_mon -ne "" ]]; then
    output="Monitor interface is up. Stopped the monitor interface $words_with_mon"
    sudo airmon-ng stop $words_with_mon
    sleep 5
else
    
    output="Monitor interface is down."
fi

output=$(jq -n \
    --arg status true \
    --arg output "$output" \
    '{status: $status, output: $output}')
echo "$output"

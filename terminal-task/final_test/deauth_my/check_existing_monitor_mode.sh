# !/bin/sh

result=$(iwconfig | grep "mon")
# echo $result

IFS=' ' read -ra words <<< "$result"

# Loop over each word
result=""
for word in "${words[@]}"; do
    # Check if the word contains the substring "mon"
    # echo $word
    if [[ "$word" == *mon* ]]; then
        # Output the word
        result=$word
        # Exit the loop after finding the first occurrence
        break
    fi
done
echo $result

if [ $? -eq 0 ]; then
    output="Monitor interface is up. Stopped the monitor interface $result"
    sudo airmon-ng stop $result
    sleep 5
else
    
    output="Monitor interface is down."
fi

output=$(jq -n \
    --arg status true \
    --arg output "$output" \
    '{status: $status, output: $output}')
echo "$output"



#!/bin/sh

# result=$(iwconfig &>/dev/null | grep "mon" | awk '{print $1}')
# if [ $? -eq 0 ]; then
#     output="Monitor interface is down."
# else
#     output="Monitor interface is up. Stopped the monitor interface $result"
#     sudo airmon-ng stop $result
#     sleep 10
# fi

# output=$(jq -n \
#     --arg status true \
#     --arg output "$output" \
#     '{status: $status, output: $output}')
# echo "$output"
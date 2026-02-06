#!/bin/bash


# Extracting command line arguments
ip_address="$1"
port="$2"

# Attempt to connect using telnet
# echo "Attempting to connect to $ip_address on port $port..."
telnet "$ip_address" "$port" > /dev/null 2>&1

# Check the exit status of the telnet command
if [ $? -eq 0 ]; then
    echo "Connection successful!"
else
    echo "Connection failed."
fi


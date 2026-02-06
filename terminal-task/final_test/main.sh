#!/bin/bash

# Check if the user chooses option -arp
if [ "$1" = "-arp" ]; then
    echo "Running arpspoof.py in a new terminal..."
    gnome-terminal -- python3 arpspoof.py "$2"
    echo "Running tool.py in the current terminal..."
    python3 --version
    python3 toolt.py "$2"

# Check if the user chooses option -tcp
elif [ "$1" = "-tcp" ]; then
    # echo 1
    # Check if an IP address is provided after -tcp
    if [ -z "$2" ]; then
        echo "Error: Please provide an IP address after -tcp."
        exit 1
    fi
    ip_address="$2"
    i_face="$3"
    #echo "Running tcp_connector.py with IP address: $ip_address in the background..."
    nohup python3 tcp_connector.py "$ip_address" > /dev/null 2>&1 &
    # echo 2
    #echo "Running tool.py in the current terminal..."
    python3 toolt.py "$ip_address" "$i_face"
    # echo 3

# If the user provides an invalid choice
else
    echo "Invalid choice. Please provide -arp or -tcp as the argument."
    exit 1
fi

#echo "All scripts executed successfully."


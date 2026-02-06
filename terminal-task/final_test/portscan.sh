# DON'T PRINT ANY THING,

ip_addr=$1
a=6000
#a=10000
noport="$(nmap -sV -T4 $ip_addr -p 1-$a | grep -A 0 shown | grep -o '[0-9]*[0-9]*[0-9]*[0-9]*')"
# echo "$noport"
if [ "$noport" != '' ]
then
	value="$(nmap -sV -T4 $ip_addr -p 1-$a| grep -A $(($a-$noport)) PORT )"
#value="$(nmap 172.17.15.242 -p 1-6000| grep -A $(($a-$noport)) PORT | grep -o '[0-9]*[0-9]*[0-9]*[0-9]*' )"
#value="$(nmap 172.17.15.242 | grep -A $(($a-998)) PORT)"
#echo $noport | tr 'open ' '\n' 
	echo "$value"
	echo "$value" > "output$ip_addr.txt"
	i=0
	k=0
#for word in $value
#do
#	i=$((i+1))	
#	if [ $i -ge $k ]
#	then 
#		a[$i]=$word
#	fi
#done
#for (( j=1; j<=$i; j++ ))
#do
#	echo "${a[$j]}|${a[$((j+1))]}|${a[$((j+2))]}|${a[$((j+3))]}"
#	if [ "${a[$((j+2))]}" == "ssh" ]
#	then 
#		k=2
#	fi
#	j=$((j+3))
#	echo "$a[$entry]"
#done
	present="$(echo $value | grep 'ssh' | grep 'open')"
	if [ "$present" != '' ]
	then
		
		echo "#******************SSH ATTEMPT*****************"
		sudo bash sshattempt.sh $ip_addr

		echo "#****************FTP*************************"
 		sudo bash sftp.sh $ip_addr
		
	fi
	present="$(echo $value | grep 'ssl\|https\|ftps' | grep 'open')"
	if [ "$present" != '' ]
	then
		echo "#****************SSL Version*****************"
		sudo bash sslversion.sh $ip_addr
	fi

	present="$(echo $value | grep '443/tcp')"
	# echo $present
	if [ "$present" != '' ]
	then
		echo "#******************SSL/TLS Certificate********************"
		# sudo bash sslCert.sh "$ip_addr"
		sudo bash verify.sh "$ip_addr"
	fi
else
	echo "No port open or Firewall blocks"
fi






# #!/bin/bash

# ip_addr=$1
# a=10000

# # Set the timeout duration (in seconds)
# timeout_duration=1250


# # Run the nmap command with the -Pn option to skip ping check and set a timeout
# nmap_output=$(timeout $timeout_duration nmap -sV -T4 -Pn $ip_addr -p 1-$a)

# # Check if the timeout occurred
# if [ $? -eq 124 ]; then
#     echo "No port open."
#     exit 1
# fi

# # Check if nmap found any open ports
# noport=$(echo "$nmap_output" | grep -A 0 shown | grep -o '[0-9]\+')

# # If no open ports were found or the host seems down, handle it
# if [ -z "$noport" ]; then
#     echo "No port open."
#     exit 1
# fi

# # Extract the relevant section from the nmap output
# value=$(echo "$nmap_output" | grep -A $(($a-$noport)) PORT)

# # Output the results and save to a file
# echo "$value"
# echo "$value" > "output$ip_addr.txt"

# # Check for specific services within the nmap output
# if echo "$value" | grep -q 'ssh.*open'; then
#     echo "#*******SSH ATTEMPT******"
#     sudo bash sshattempt.sh $ip_addr
# fi

# if echo "$value" | grep -q 'ssl\|https\|ftps.*open'; then
#     echo "#*****SSL Version******"
#     sudo bash sslversion.sh $ip_addr
# fi

# if echo "$value" | grep -q '443/tcp.*open'; then
#     echo "#*******SSL/TLS Certificate*******"
#     sudo bash verify.sh "$ip_addr"
# fi

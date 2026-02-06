ip_addr=$1
# for majversion in {1,2}
# do
# 	for miversion in {0,1,2,3,4}
# 	do
# 		tfinal="$(curl -k https://$ip_addr --tlsv$majversion.$miversion 2>&1 | grep -o ': is unknown')"
# 		if [ "$tfinal" == "" ]
# 		then
#         		echo 'TLS '$majversion'.'$miversion' is running'
# 		fi
# 	done
# done

port_status=$(nmap -p 443 --open $ip_addr | grep "443/tcp.*open")
if [ -n "$port_status" ]; then
	output=$(openssl s_client -showcerts -servername $ip_addr -connect $ip_addr:443 2>/dev/null & echo -ne '\n')
    # echo -ne '\n'
	protocol=$(echo "$output" | grep 'Protocol' | awk -F': ' '{print $2}' | tr -d '[:space:]')
	echo "$protocol"
else
    echo "Port 443 is closed."
fi
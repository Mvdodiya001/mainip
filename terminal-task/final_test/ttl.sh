ip_addr=$1
pingcount="$(ping -c 4 $ip_addr | grep -c ttl)"
echo "Packet Received = $pingcount"
echo "Packet Not-Received = $((4-pingcount))"
#echo "$(ping -c 1 $ip_addr | grep 'ttl=')"
if [ $((4-pingcount)) == 4 ]
then
	echo "Firewall blocks the PING [Possibly]"
else
	ttlvalue="$(ping -c 1 $ip_addr | grep 'ttl=' | cut -d\= -f3 | grep -o '[0-9][0-9][0-9]*')"
	echo "TTL Value = $ttlvalue"
	if [ $ttlvalue -lt 100 ]
	then
		echo "Guess: Linux Distribution"
	else
		echo "Guess: Windows OS"
	fi
fi





# output="$()"
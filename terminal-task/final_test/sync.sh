ip_addr=$1
tfetch="$(sudo -S hping3 -c 1 $ip_addr --icmp-ts 2> /dev/null | grep -o 'e=[0-9]*')"
tfinal="$(echo $tfetch | grep -o [0-9]*' ')"
sender="$(echo $tfinal|grep -o '[0-9]*')"
#echo "$tfinal="
#echo $sender
tfinal2="$(echo $tfetch | grep -o ' e='[0-9]*)"
receiver="$(echo $tfinal2 | grep -o '[0-9]*')"
#echo "=$tfinal2="
#echo "=$sender="
#echo "=$receiver="
wabs="$(($sender-$receiver))"
abs=${wabs#-}
echo $abs
if [ $abs -ge 100 ]
then
	echo "No Synch"
else
	echo "Synch [Only if time difference is displayed]"
fi
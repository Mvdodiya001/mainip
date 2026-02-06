ip_addr=$1
username=$2
tfinal="$(ssh -1 $username@$ip_addr &> /dev/null | grep -o 'differ')"
if [ ${#tfinal} -ge 0 ]
then
        echo 'Not possible'
else
	echo 'Possible'
fi

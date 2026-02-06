#tlsversion=$(openssl s_client -connect $1:1883 -tls1_0 2>&1 | grep -o 'TLSv1\.[0-3]')

	for  (( i=0; i<= 3; i++ ))
	do
		#echo $i
		tfinal="$(openssl s_client -connect $1:1883 -tls1_$i 2>&1 | grep -o 'TLSv1\.[0-3]')"
		#echo "$tfinal"
		if [ "$tfinal" != "" ]
		then
        		echo "TLS version is: $tfinal"
			exit 1
        	#else
        		#echo "TLS version is: $tfinal"	
		fi
	done

	echo "TLS not found"

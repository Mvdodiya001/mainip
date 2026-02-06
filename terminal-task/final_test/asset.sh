#!/bin/sh

a=1

echo "Host Discovering..."
# for i in {100..115}
# do
#     ping -c1 192.168.1.$i > unused.txt
# done
# rm -rf unused.txt

b="$(arp -a | grep [a-f]*[0-9]*[a-f]*[0-9]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]* | grep -o [0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]* | wc -l)"

echo "Total Number of Host Discovered=$b"
while [ $a -le $b ]
do
   
   ip_addr="$(arp -a | grep [a-f]*[0-9]*[a-f]*[0-9]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]*:[0-9]*[a-f]*[0-9]*[a-f]* | grep -o [0-9][0-9]*[0-9]*\.[0-9][0-9]*[0-9]*\.[0-9][0-9]*[0-9]*\.[0-9][0-9]*[0-9]* | awk NR==$a)"
   echo $ip_addr
   echo $a
  if [ "$ip_addr" != '192.168.1.1' ]
  then 
  
   echo "-----------------------------------------------"  
	echo "TESTING STARTED FOR $ip_addr"  
	echo "-----------------------------------------------"  
	iface="enp1s0"  # check with your system configuration
	iface1="wlp3s1"  
	echo "**********************TTL**********************"
	sudo bash ttl.sh "$ip_addr"
	echo "**********************MAC**********************"
	sudo bash mac.sh "$ip_addr" "$iface"
	echo "*****************SSH Downgrade*****************"
	sudo bash sshdowngrade.sh "ip_addr"
	echo "********************PORTS**********************"
	sudo bash portscan.sh "$ip_addr"
	echo "*******************SSL/TLS Certificate********************"
	sudo bash sslCert.sh "$ip_addr"
	echo "*******************Firewall********************"
	sudo bash firewall.sh "$ip_addr"
	echo "******************SYNC Check*******************"
	sudo bash sync.sh "$ip_addr" 2>/dev/null
	#echo "******************Finger Pri*******************"
	#sudo bash finger.sh "$ip_addr" 2>/dev/null
	echo "******************ARP Poisoning****************"
	sudo bash arp.sh "$ip_addr" "$iface"
	echo "******************Device Fingerprinting****************"
	python3 deviceInfoFinger.py $ip_addr 
	echo "*****************SSH Attempt*****************"
	sudo bash sshattempt.sh "ip_addr"
	echo "---------------TEST COMPLETED------------------"  
   fi
   a=`expr $a + 1`
done

echo "Total Scanned Devices=$b"

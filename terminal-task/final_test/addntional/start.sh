 #!/bin/bash  
 ip_addr=$1
 
#  iface=${2:-$(ip r | grep default -m 1 | awk '{print $5}')}
#  iface=${2:-$(ip route get "$ip_addr" 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "dev") print $(i+1)}')}
 iface=$(ip -o addr show to "$ip_addr" 2>/dev/null | awk '{print $2}')
if [ -z "$iface" ]; then
    iface=$(ip route get "$ip_addr" 2>/dev/null | head -n1 | sed -n 's/.* dev \([^ ]*\).*/\1/p')
fi
# echo "$iface"

#  echo $iface
 echo "-----------------------------------------------"
 echo "TESTING STARTED FOR $ip_addr"  
 echo "-----------------------------------------------"
 sleep 5
#  echo "#*****************Connection*******************"
#  sudo bash check_connection.sh $ip_addr #exit if not in the same network
 echo "#*****************Host Name*******************"
 sudo bash get_host_name.sh "$ip_addr"
#  echo "#*****************WiFi Interface Info*******************"
#  sudo bash inter.sh
 echo "#*********************TTL_ML**********************"
#python3 osgaurav.py  "$ip_addr"
#sudo ./OSfingerprinting/main.sh -tcp "$ip_addr"
 sudo ./main.sh -tcp "$ip_addr" "$iface"
 echo "#*********************TTL**********************"
 sudo bash ttl.sh "$ip_addr"
#sudo ./OSfingerprinting/main.sh -tcp "$ip_addr"

 echo "#*********************MAC**********************"
 sudo bash mac.sh "$ip_addr" "$iface"

 echo "#*******************PORTS**********************"
 sudo bash portscan.sh "$ip_addr" | tee portlist$ip_addr.txt

#  echo "#******************SSL/TLSCertificate********************" # skip for making hierarichale model
#  sudo bash sslCert.sh "$ip_addr"
 echo "#******************Firewall********************"
 sudo bash firewall.sh "$ip_addr" "$iface" portlist$ip_addr.txt
 echo "#******************Cipher********************"
 sudo bash cipher3.sh "$ip_addr"
 # echo "#******************Service Detection********************"
 # python3 service_detection.py "$ip_addr"
 echo "#*****************SYNC Check*******************"
 sudo bash sync.sh "$ip_addr" 2>/dev/null
 # echo "#*****************Finger Pri*******************"
 # sudo bash finger.sh "$ip_addr" 2>/dev/null
 echo "#*****************ARP Poisoning****************"
 sudo bash arp.sh "$ip_addr" "$iface"

 echo "#*****************Device Fingerprinting****************"
 python3 deviceInfoFinger.py $ip_addr $iface

#  echo "#****************Certificate Weaknesses*****************"
#  sudo bash certWeak.sh $ip_addr
 echo "#****************Telnet*************************"
 sudo bash telnet.sh $ip_addr 80
 echo "#****************Trace Route*************************"
 sudo python3 traceroute.py $ip_addr 
 # echo "#****************NUCLEI TEST*****************"
 # sudo ./nuclei -u $ip_addr -json
 # echo "#****************CVE*****************"
 # python3 cve.py dropbear 2017.75 $ip_addr

#  echo "#****************Fake Port*************************"
#  #fake port run command
#  sudo gcc fakeport.c -o fakeport
#  sudo  ./fakeport $ip_addr
 
 echo "#****************UDP*************************"
 sudo gcc udp.c -o udp
 sudo ./udp $ip_addr

 echo "#****************RTSP*************************"
#  gcc rtsp.c -o rtsp -lpcap
 sudo ./rtsp $ip_addr $iface

 sudo rm output$ip_addr.txt
 sudo rm portlist$ip_addr.txt
 echo "---------------TEST COMPLETED------------------"

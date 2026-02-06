#!/bin/bash 
ip_addr=$1
# # echo "IP in shell: " $ip_addr
# python3 get_host_name.py $ip_addr 

# javac './HostnameFetcher/Main.java'
# javac './HostnameFetcher/HostnameFetcher.java'
# javac './HostnameFetcher/LLMNRResolver.java'
# javac './HostnameFetcher/MDNSResolver.java'
# javac './HostnameFetcher/NetBIOSResolver.java'

# java -cp './HostnameFetcher' Main

# network_prefix=$1
# start=$2
# end=$3
#scanner scan -p /home/iiita/Desktop/dvba/
file_count=$(find './HostnameFetcher' -name "*.class" | wc -l) 

# cd './HostnameFetcher' && [ "$(find . -name "*.class" | wc -l)" -ne 5 ] && javac Main.java HostnameFetcher.java LLMNRResolver.java MDNSResolver.java NetBIOSResolver.java && java Main $ip_addr && cd ..

if [ $file_count -ne 5 ]
then
    cd './HostnameFetcher' && javac Main.java HostnameFetcher.java LLMNRResolver.java MDNSResolver.java NetBIOSResolver.java && java Main $ip_addr && cd ..
else
    cd './HostnameFetcher' && java Main $ip_addr && cd ..
fi

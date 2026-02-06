#!/bin/sh
ip_addr=$1

curl -v -X OPTIONS https://$ip_addr &>out.txt
cat out.txt | grep -w problem | head -1 
rm -rf out.txt

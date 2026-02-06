#!/bin/sh
ip_addr=$1
#echo | openssl s_client -showcerts -servername $ip_addr -connect $ip_addr:443 2>/dev/null | openssl x509 -inform pem -noout -text | egrep -h 'Issuer|Not Before|Not After'

echo | openssl s_client -showcerts -servername $ip_addr -connect $ip_addr:443 2>/dev/null | openssl x509 -inform pem -noout -issuer -dates


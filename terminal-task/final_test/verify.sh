#!/bin/bash

IP_ADDRESS=$1
PORT=${2:-443}  


CERT_INFO=$(echo | openssl s_client -connect ${IP_ADDRESS}:${PORT} -servername ${IP_ADDRESS} 2>/dev/null | openssl x509 -noout -dates -subject -issuer -checkend 0)

# Check the certificate's validity
if [ $? -ne 0 ]; then
    echo $CERT_INFO
    echo "Certificate validation failed."
    exit 1
fi
echo $CERT_INFO
echo "Certificate validation successful."


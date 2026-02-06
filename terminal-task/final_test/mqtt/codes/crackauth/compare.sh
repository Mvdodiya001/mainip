#!/bin/bash

password="1234"

filepath=$1

echo "filepath is $filepath"

while read line
do
	# echo "line is $line"
	if [ $line = $password ]; then
		echo "password is $line"
	fi
done < $filepath 

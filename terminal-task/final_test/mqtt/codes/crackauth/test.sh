#!/bin/bash

# read -p "Enter file name : " filename

filename=$1
while read line
do 
	echo $line
done < $filename

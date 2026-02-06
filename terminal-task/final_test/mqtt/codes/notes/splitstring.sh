#! /bin/bash

IFS=','

read -ra arr <<< $1

read -ra arr2 <<< $2

echo ${#arr[@]}
echo ${#arr2[@]}

for val in ${arr[@]};
do
	printf "$val\n"
done


for val in ${arr2[@]};
do
        printf "$val\n"
done

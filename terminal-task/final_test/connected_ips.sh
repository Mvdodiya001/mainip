#!/bin/bash
default_channel=$(ip r | grep default | awk '{print $5}')

IFS=$'\n' read -d '' -r -a channels <<< "$default_channel"

channel=${channels[0]}
# echo $channel

subnet_mask_1=$(ip a | grep $channel | grep inet | awk '{print $2}')
IFS='/' read -r subnet_mask_1 subnet_mask__back <<< "$subnet_mask_1"

broadcast_addr=$(ip a | grep $channel | grep inet | awk '{print $4}')

subnet_mask_2=$(ifconfig | grep $broadcast_addr | awk '{print $4}')
IFS=' ' read -r -a subnet_mask_2 <<< "$subnet_mask_2"

IFS=_. read -r subnet_octet_1 subnet_octet_2 subnet_octet_3 subnet_octet_4 <<< "$subnet_mask_2"
IFS=_. read -r octet_1 octet_2 octet_3 octet_4 <<< "$subnet_mask_1"

start_octet_1=$((octet_1 & subnet_octet_1))
start_octet_2=$((octet_2 & subnet_octet_2))
start_octet_3=$((octet_3 & subnet_octet_3))
start_octet_4=$((octet_4 & subnet_octet_4))
subnet_addr=$start_octet_1.$start_octet_2.$start_octet_3.$start_octet_4

IFS=_. read -r end_octet_1 end_octet_2 end_octet_3 end_octet_4 <<< "$broadcast_addr"

for ((i=$start_octet_1; i<=$end_octet_1; i++))
do
    for ((j=$start_octet_2; j<=$end_octet_2; j++))
    do
        for ((k=$start_octet_3; k<=$end_octet_3; k++))
        do
            for ((l=$start_octet_4; l<=$end_octet_4; l++))
            do
                host=$i.$j.$k.$l
                if [ $host != $broadcast_addr ]
                then
                    if [ $host != $subnet_addr ]
                    then
                        if fping -c 1 "$host" &>/dev/null
                        then
                            echo $host
                        fi
                    fi
                fi
            done
        done
    done
done
#!/bin/sh

a=1
b="$(arp -a | grep -o [0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]* | wc -l)"

echo $b

while [ $a -le $b ]
do
   echo $a
   ip="$(arp -a | grep -o [0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]*.[0-9][0-9]*[0-9]* | awk 'NR==1')"
   echo $ip
   sudo bash start.sh $ip
   a=`expr $a + 1`
done

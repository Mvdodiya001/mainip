ip_addr=$(ip r | grep default | awk '{print $3}')

# echo $ip_addr

IFS=_. read -r prefix octet1 octet2 octet3 octet4 <<< "$ip_addr"

for octet in {2..254}
    do
        # echo "Checking $prefix.$octet1.$octet2.$octet"
        host=($prefix.$octet1.$octet2.$octet)
        if fping -c 1 "$host" &>/dev/null
        then
            sudo bash start.sh $host
        fi
done
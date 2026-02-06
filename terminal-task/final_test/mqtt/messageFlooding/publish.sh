username=$1
password=$2
topic=$3
ip_addr=$4
message=$5

for ((i=10000; i>=1; i--))
do
mosquitto_pub -h $ip_addr -t $topic -m $message -u $username -P $password
done

username=$1
password=$2
topic=$3
message=$4

for ((i=10000; i>=1; i--))
do
mosquitto_pub -h localhost -t $topic -m $message -u $username -P $password
done

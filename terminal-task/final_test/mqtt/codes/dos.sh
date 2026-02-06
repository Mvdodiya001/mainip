username="$1"
password="$2"
ip_addr="$3"
topic="$4"
message="$5"

for ((i=1000; i>=1; i--))
do
    mosquitto_pub -h $ip_addr -p 1883 -t $topic -m $message -u $username -P $password
done

username="$1"
password="$2"
topic="$3"
ip_addr="$4"
message="$5"
# publish topic
mosquitto_pub -h $ip_addr -t "$topic" -u $username -P $password -m "$message" 
#echo ${#topic}
if [ ${#topic}>=1 ]
then
	echo "It can publish message to any topic: $topic"
else
	echo "Unable to publish message to the subscriber"
fi


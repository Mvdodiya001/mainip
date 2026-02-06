username="$1"
password="$2"
topic="$3"
ip_addr="$4"
message="$5"
# publish topic
mosquitto_pub -h $ip_addr -t "$topic" -u $username -P $password -m "$message" 

echo "Published message: $message to topic: $topic"
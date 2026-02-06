# Set this "allow_anonymous false" and "listener port_number" in mosquitto.conf file 

username=$1
password=$2
topic=$3
host=$4
# Subscribe topic
sudo mosquitto_sub -h $host -p 1883 -t $topic -u $username -P $password



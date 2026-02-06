# Set this "allow_anonymous false" and "listener port_number" in mosquitto.conf file 

username=$1
password=$2
topic=$3

echo $username
echo $password
echo $topic

# To create username and password in mosquitto server
sudo mosquitto_passwd -b /etc/mosquitto/passwd $username $password

# To restart mosquitto
sudo systemctl restart mosquitto
echo "server is running"
# Subscribe topic
sudo mosquitto_sub -h localhost -p 1883 -t $topic -u $username -P $password


import sys
import time
import socket


import paho.mqtt.client as mqttclient

from termcolor import colored

from utils import printmessage, rc_msgs, on_publish, printarg

from parsers import pub_parser


def on_connect(client, userdata, flags, rc) :
    if rc == 0 :
        printmessage("client is connected", 'success')
        global connected
        connected = True
    else :
        printmessage(rc_msgs[rc], 'error')








connected = False


args = pub_parser.parse_args()


host = args.host
port = args.port
topic = args.topic
message = args.message
username = args.username
password = args.password

print("")
printarg('host', host)
printarg('port', port)
printarg('topic', topic)
printarg('message', message)
printarg('username', username)
printarg('password', password)
print("")

client = mqttclient.Client('MQTT Implementation - Publisher')

client.username_pw_set(username, password)

# client.on_publish = on_publish

try :
    client.connect(host, port)
except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error')
    sys.exit(1)

except ConnectionRefusedError :
    printmessage("Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection", 'error')
    sys.exit(1)

client.on_connect = on_connect

client.publish(topic, message)

client.loop_start()

while connected != True :
    time.sleep(0.2)

printmessage("connection ended", 'success')
client.loop_stop()
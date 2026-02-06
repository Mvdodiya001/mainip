import sys
import time
import socket

import paho.mqtt.client as mqttclient

from utils import printmessage, rc_msgs, on_message, printarg

from parsers import sub_parser

from termcolor import colored



def on_connect(client, userdata, flags, rc) :
    if rc == 0 :
        printmessage("client is connected", 'success')
        global connected
        connected = True
    else :
        printmessage(rc_msgs[rc], 'error')



connected = False



args = sub_parser.parse_args()


host = args.host
port = args.port
topic = args.topic
username = args.username
password = args.password
timeout = args.timeout


print("")
printarg('host', host)
printarg('port', port)
printarg('topic', topic)
printarg('username', username)
printarg('password', password)
printarg('timeout', timeout)
print("")


# the name given in Client method must be diff from that given in publish.py
client = mqttclient.Client('MQTT Implementation - Subscriber')

client.on_message = on_message


client.username_pw_set(username, password)


try :
    client.connect(host)
except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error')
    sys.exit(1)

except ConnectionRefusedError :
    printmessage('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''', 'error')
    sys.exit(1)

client.on_connect = on_connect

client.subscribe(topic)

client.loop_start()

while connected != True :
    time.sleep(0.2)

time.sleep(timeout)

printmessage("connection ended", 'success')
client.loop_stop()
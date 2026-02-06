import sys
import time
import socket


import paho.mqtt.client as mqttclient
import paho.mqtt.publish as publish
from paho.mqtt import MQTTException

from termcolor import colored

from utils import printmessage, rc_msgs, on_publish, printarg

from parsers import pub_multiple_parser



def on_connect(client, userdata, flags, rc) :
    if rc == 0 :
        printmessage("client is connected", 'success')
        global connected
        connected = True
    else :
        printmessage(rc_msgs[rc], 'error')








connected = False


args = pub_multiple_parser.parse_args()


host = args.host
port = args.port
topic = args.topic
messages = args.messages
username = args.username
password = args.password

# print("")
# printarg('host', host)
# printarg('port', port)
# printarg('topic', topic)
# printarg('messages', messages)
# printarg('username', username)
# printarg('password', password)
# print("")

msgs = []
for message in messages :
    msgs.append((topic, message))



try :
    publish.multiple(
        msgs=msgs,
        hostname=host,
        port=port,
        client_id='MQTT Implementation - Multiple Publisher',
        auth={'username':username, 'password':password},
    )

except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error')
    sys.exit(1)

except ConnectionRefusedError :
    printmessage("Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection", 'error')
    sys.exit(1)

except (MQTTException, KeyError) as e :
    printmessage(str(e), 'error')
    sys.exit(1)
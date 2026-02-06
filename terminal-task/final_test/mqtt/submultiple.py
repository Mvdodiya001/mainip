import sys
import time
import socket


import paho.mqtt.client as mqttclient
import paho.mqtt.subscribe as subscribe
from paho.mqtt import MQTTException

from termcolor import colored

from utils import printmessage, rc_msgs, on_message, printarg

from parsers import sub_mult_parser


args = sub_mult_parser.parse_args()


host = args.host
port = args.port
topics = args.topics
username = args.username
password = args.password

# print("")
# printarg('host', host)
# printarg('port', port)
# printarg('topics', topics)
# printarg('username', username)
# printarg('password', password)
# print("")


try :
    subscribe.callback(
        on_message,
        topics=topics,
        hostname=host,
        port=port,
        client_id='MQTT Implementation - {topics} Subscriber',
        auth={'username':username, 'password':password},
        keepalive=6000
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
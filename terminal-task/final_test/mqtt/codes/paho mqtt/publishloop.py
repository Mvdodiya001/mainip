import sys
import time
import socket
import aioconsole

import paho.mqtt.client as mqttclient

from termcolor import colored

from utils import printmessage, rc_msgs, on_publish, printarg

from parsers import pub_loop_parser


def on_connect(client, userdata, flags, rc) :
    if rc == 0 :
        # printmessage("client is connected", 'success')
        global connected
        connected = True
    else :
        printmessage(rc_msgs[rc], 'error')




connected = False


args = pub_loop_parser.parse_args()


host = args.host
port = args.port
username = args.username
password = args.password


client = mqttclient.Client('MQTT Implementation - Loop Publisher')

client.username_pw_set(username, password)


try :
    client.connect(host, port)
except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error')
    sys.exit(1)

except ConnectionRefusedError :
    printmessage("Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection", 'error')
    sys.exit(1)

client.on_connect = on_connect

while True :
    topic = input(colored('topic : ', 'light_grey'))
    message = input(colored('message : ', 'light_grey'))
    
    client.publish(topic, message)

    client.loop_start()

    client.loop_stop()


printmessage("connection ended", 'success')

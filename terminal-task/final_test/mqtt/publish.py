import sys
import time
import socket
import paho.mqtt.client as mqttclient
from termcolor import colored
from utils import printmessage, rc_msgs, on_publish, printarg
from parsers import pub_parser

connected = False

def on_connect(client, userdata, flags, rc) :
    global connected
    print(userdata,rc)
    if rc == 0 :
        if connected == False :
            printmessage("client is connected", 'success', flush=True)
        connected = True
    else :
        printmessage(rc_msgs[rc], 'error', flush=True)



def publish_mqtt() :
    args = pub_parser.parse_args()
    host = args.host
    port = args.port
    topic = args.topic
    message = args.message
    username = args.username
    password = args.password
    print(args)
    client = mqttclient.Client(client_id='MQTT Implementation - {topic}-{host}-{username} Publisher')

    client.username_pw_set(username, password)

    # client.on_publish = on_publish

    try :
        client.connect(host, port)
    except socket.gaierror :
        printmessage("The IP address or domain name of the broker is not known", 'error',flush=True)
        sys.exit(1)

    except ConnectionRefusedError :
        printmessage("Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection", 'error',flush=True)
        sys.exit(1)

    client.on_connect = on_connect

    client.publish(topic, message)

    client.loop_start()

    while connected != True :
        time.sleep(0.2)

    printmessage("connection ended", 'success',flush=True)
    client.loop_stop()

if __name__ == "__main__" :
    print("Connecting to the broker...", flush=True)
    publish_mqtt()
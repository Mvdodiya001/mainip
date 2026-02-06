import sys
import time
import socket
import paho.mqtt.client as mqttclient
from utils import printmessage, rc_msgs, on_message, printarg
from parsers import sub_parser
from termcolor import colored

connected = False  # Define connected as a global variable

def on_connect(client, userdata, flags, rc):
    global connected  # Declare connected as global within the function
    if rc == 0:
        if(connected == False):
            printmessage("Client is connected", 'success', flush=True)
        connected = True
    else:
        printmessage(rc_msgs[rc], 'error', flush=True)

def subscribe_mqtt():
    args = sub_parser.parse_args()
    host = args.host
    port = args.port
    topic = args.topic
    username = args.username
    password = args.password
    timeout = args.timeout
    print(timeout)
    client = mqttclient.Client(client_id='MQTT Implementation - {topic}-{host}-{username} Subscriber')
    client.on_message = on_message
    client.username_pw_set(username, password)
    print("Subscribing to the topic...", flush=True)
    try:
        client.connect(host, port)
    except (socket.gaierror, ConnectionRefusedError) as e:
        printmessage(f"Failed to connect to the broker: {e}",'error', flush=True)
        sys.exit(1)

    client.on_connect = on_connect
    client.subscribe(topic)
    client.loop_start()

    start_time = time.time()
    while not connected:
        time.sleep(0.02)
        if time.time() - start_time > timeout:
            printmessage("Connection timeout", 'error', flush=True)
            break

    if connected:
        time.sleep(timeout)
        printmessage("Connection ended", 'success', flush=True)
        client.loop_stop()

if __name__ == "__main__":
    print("Connecting to the broker...", flush=True)
    subscribe_mqtt()

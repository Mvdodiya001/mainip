import sys
import time
import socket
import paho.mqtt.client as mqttclient
from termcolor import colored
from utils import printmessage, rc_msgs, on_publish, printarg
from parsers import pub_parser

class MQTTPublisher:
    def __init__(self, host, port, topic, message, username, password):
        self.host = host
        self.port = port if port is not None else 1883
        self.topic = topic
        self.message = message
        self.username = username
        self.password = password
        self.connected = False
        self.client = mqttclient.Client(client_id=f'MQTT Implementation - {topic}-{host}-{username} Publisher')
        if(username is not None  and password is not None):
            self.client.username_pw_set(username, password)
        self.client.on_connect = self.on_connect

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            if not self.connected:
                printmessage("Client is connected", 'success', flush=True)
            self.connected = True
            self.client.publish(self.topic, self.message)
        else:
            printmessage(rc_msgs[rc], 'error', flush=True)

    def publish(self):
        print(f"Connecting to the broker at {self.host}:{self.port}...", flush=True)
        try:
            self.client.connect(self.host, self.port)
        except (socket.gaierror, ConnectionRefusedError) as e:
            printmessage(f"Failed to connect to the broker: {e}", 'error', flush=True)
            sys.exit(1)

        self.client.loop_start()

        while not self.connected:
            time.sleep(0.2)

        printmessage("Connection ended", 'success', flush=True)
        self.client.loop_stop()

if __name__ == "__main__":
    args = pub_parser.parse_args()
    host = args.host
    port = args.port if args.port is not None else args.port
    topic = args.topic
    message = args.message
    username = args.username
    password = args.password

    publisher = MQTTPublisher(host, port, topic, message, username, password)
    publisher.publish()

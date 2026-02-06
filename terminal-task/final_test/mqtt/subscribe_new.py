import sys
import time
import socket
import paho.mqtt.client as mqttclient
from utils import printmessage, rc_msgs, on_message, printarg
from parsers import sub_parser
from termcolor import colored

class MQTTSubscriber:
    def __init__(self, host, port, topic, username, password, timeout):
        self.host = host
        self.port = port
        self.topic = topic
        self.username = username
        self.password = password
        self.timeout = timeout
        self.connected = False
        self.client = mqttclient.Client(client_id=f'MQTT Implementation - {topic}-{host}-{username} Subscriber')
        self.client.on_message = on_message
        print(password)
        print(username)
        if(username is not None  and password is not None):
            self.client.username_pw_set(username, password)
        self.client.on_connect = self.on_connect
        self.client.connect(host, port)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            if not self.connected:
                printmessage("Client is connected", 'success', flush=True)
            self.connected = True
            self.client.subscribe(self.topic)
        else:
            printmessage(rc_msgs[rc], 'error', flush=True)

    def start(self):
        print("Subscribing to the topic...", flush=True)
        self.client.loop_start()

        start_time = time.time()
        while not self.connected:
            time.sleep(0.02)
            if time.time() - start_time > self.timeout:
                printmessage("Connection timeout", 'error', flush=True)
                break

        if self.connected:
            time.sleep(self.timeout)
            print("Connection ended.",flush=True)
            self.client.loop_stop()

if __name__ == "__main__":
    args = sub_parser.parse_args()
    host = args.host
    port = args.port if args.port is not None else 1883
    topic = args.topic
    username = args.username
    password = args.password
    timeout = args.timeout

    print("Connecting to the broker...", flush=True)
    subscriber = MQTTSubscriber(host, port, topic, username, password, timeout)
    subscriber.start()

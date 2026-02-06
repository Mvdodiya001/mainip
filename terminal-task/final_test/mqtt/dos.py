import sys
import time
import socket
from parsers import pub_parser
from utils import printmessage, rc_msgs, on_message, printarg
from termcolor import colored
import paho.mqtt.publish as publish



def publish_multiple_messages(username, password, ip_addr, topic, message, count=1000):
    """
    Publish multiple messages to an MQTT broker with the provided parameters.
    """
    auth = {'username': username, 'password': password} if username else None
    for i in range(0, count, 1):
        try:
            publish.single(topic, message, hostname=ip_addr, port=1883, auth=auth)
            print(f"Published message {i}: '{message}' to topic '{topic}'")
        except Exception as e:
            print(f"Failed to publish message: {e}")
if __name__ == "__main__":
    args = pub_parser.parse_args()
    host = args.host
    port = args.port
    topic = args.topic
    message = args.message
    username = args.username
    password = args.password
    publish_multiple_messages(username, password, host, topic, message)
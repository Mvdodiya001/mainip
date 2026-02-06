import sys
import signal

from termcolor import colored


rc_msgs = [
    'Connection successful',
    'Connection refused: incorrect protocol version',
    'Connection refused: invalid client identifier',
    'Connection refused: server unavailable',
    'Connection refused: bad username or password',
    'Connection refused: not authorised. Provide valid credentials',
]


def handler(signum, frame) :
    printmessage('\nKeyboard interrupt... exiting', 'exit', flush=True)
    sys.exit(0)


signal.signal(signal.SIGINT, handler)

def on_message(client, userdata, msg) :
    # print(f"{colored('topic', 'light_grey')}: {colored(msg.topic, 'light_blue')}")
    print(f"{str(msg.payload.decode('utf-8'))}", flush=True)

def on_publish(client, userdata, rc) :
    printmessage('message published', 'success', flush=True)


def printmessage(error, flag, flush) :
    if flag == 'success' :
        print(colored('\u2713 ' + error, 'green'), flush=True)
    
    if flag == 'error' :
        print(colored('\u2717 ' + error, 'red'), flush=True)

    if flag == 'exit' :
        print(colored(error, 'red'), flush=True)


def printarg(arg, value) :
    if type(value) != list :
        print(colored('>', 'light_grey'), colored(arg, 'light_grey'), colored({value}, 'light_magenta'), flush=True)

    else :
        print(colored('>', 'light_grey'), colored(arg, 'light_grey'), flush=True)
        for val in value :
            print("     ", colored({val}, 'light_magenta'), flush=True)
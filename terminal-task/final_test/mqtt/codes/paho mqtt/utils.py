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
    printmessage('\nKeyboard interrupt... exiting', 'exit')
    sys.exit(0)


signal.signal(signal.SIGINT, handler)

def on_message(client, userdata, msg) :
    print(f"{colored('topic', 'light_grey')}: {colored({msg.topic}, 'light_blue')}")
    print(f"{colored('payload', 'light_grey')}: {colored({str(msg.payload.decode('utf-8'))}, 'light_green')}")

def on_publish(client, userdata, rc) :
    printmessage('message published', 'success')


def printmessage(error, flag) :
    if flag == 'success' :
        print(colored('\u2713 ' + error, 'green'))
    
    if flag == 'error' :
        print(colored('\u2717 ' + error, 'red'))

    if flag == 'exit' :
        print(colored(error, 'red'))


def printarg(arg, value) :
    if type(value) != list :
        print(colored('>', 'light_grey'), colored(arg, 'light_grey'), colored({value}, 'light_magenta'))

    else :
        print(colored('>', 'light_grey'), colored(arg, 'light_grey'))
        for val in value :
            print("     ", colored({val}, 'light_magenta'))
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg) :
    print(f"{msg.topic}: {str(msg.payload.decode('utf-8'))}")

def on_connect(client, userdata, flags, rc):
    print("Connected with result code {0}".format(str(rc)))

client = mqtt.Client("digi_mqtt_test") 
client.on_connect = on_connect
client.on_message = on_message

client.publish("test", "manvith")

client.connect('localhost')
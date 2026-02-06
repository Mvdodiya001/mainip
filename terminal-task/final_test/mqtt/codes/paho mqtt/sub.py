import paho.mqtt.client as mqtt




def on_message(client, userdata, msg):
    print("Message received-> " + msg.topic + " " + str(msg.payload))


client = mqtt.Client("digi_mqtt_test") 
client.on_message = on_message
client.subscribe("test")
client.connect('localhost')
client.loop_forever()
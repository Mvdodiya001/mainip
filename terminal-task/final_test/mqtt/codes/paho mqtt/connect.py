import paho.mqtt.client as mqttclient

client = mqttclient.Client('manvith')

client.connect('localhost')

client.publish('test', 'hello! manvith')
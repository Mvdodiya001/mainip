import argparse



pub_parser = argparse.ArgumentParser()
pub_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

pub_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="port of the target MQTT broker",
)

pub_parser.add_argument(
    "-t",
    "--topic",
    required=True,
    help="Topic name to which you need to subscribe",
)

pub_parser.add_argument(
    "-m",
    "--message",
    required=True,
    help="message to publish",
)

pub_parser.add_argument(
    "-u",
    "--username",
    help="username if the target MQTT broker requires authentication",
)

pub_parser.add_argument(
    "-P",
    "--password",
    help="password if the target MQTT broker requires authentication",
)














pub_multiple_parser = argparse.ArgumentParser()
pub_multiple_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

pub_multiple_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="Port number of the target MQTT broker",
)

pub_multiple_parser.add_argument(
    "-t",
    "--topic",
    required=True,
    help="Topic name to which you need to subscribe",
)

pub_multiple_parser.add_argument(
    "-m",
    "--messages",
    required=True,
    nargs='+',
    help="Messages to publish. Atleast one message is to be provided.",
)

pub_multiple_parser.add_argument(
    "-u",
    "--username",
    help="Username if the target MQTT broker requires authentication",
)

pub_multiple_parser.add_argument(
    "-P",
    "--password",
    help="Password if the target MQTT broker requires authentication",
)













pub_loop_parser = argparse.ArgumentParser()
pub_loop_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

pub_loop_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="Port number of the target MQTT broker",
)

pub_loop_parser.add_argument(
    "-u",
    "--username",
    help="Username if the target MQTT broker requires authentication",
)

pub_loop_parser.add_argument(
    "-P",
    "--password",
    help="Password if the target MQTT broker requires authentication",
)














sub_parser = argparse.ArgumentParser()
sub_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

sub_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="port of the target MQTT broker",
)

sub_parser.add_argument(
    "-t",
    "--topic",
    required=True,
    help="Topic name to which you need to subscribe",
)

sub_parser.add_argument(
    "-u",
    "--username",
    help="username if the target MQTT broker requires authentication",
)

sub_parser.add_argument(
    "-P",
    "--password",
    help="password if the target MQTT broker requires authentication",
)

sub_parser.add_argument(
    "-T",
    "--timeout",
    type=int,
    default=10,
    help="Subscriber timeout in seconds",
)












sub_mult_parser = argparse.ArgumentParser()
sub_mult_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

sub_mult_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="Port of the target MQTT broker",
)

sub_mult_parser.add_argument(
    "-t",
    "--topics",
    required=True,
    nargs='+',
    help="Topics to which you need to subscribe.Atleast one topic is to be provided.",
)

sub_mult_parser.add_argument(
    "-u",
    "--username",
    help="Username if the target MQTT broker requires authentication",
)

sub_mult_parser.add_argument(
    "-P",
    "--password",
    help="Password if the target MQTT broker requires authentication",
)

sub_mult_parser.add_argument(
    "-T",
    "--timeout",
    type=int,
    default=10,
    help="Subscriber timeout in seconds",
)















auth_parser = argparse.ArgumentParser()
auth_parser.add_argument(
    "-r",
    "--host",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)

auth_parser.add_argument(
    "-p",
    "--port",
    type=int,
    default=1883,
    help="port of the target MQTT broker",
)


auth_parser.add_argument(
    "-u",
    "--username",
    required=True,
    help="username if the target MQTT broker requires authentication",
)

group = auth_parser.add_mutually_exclusive_group(required=True)

group.add_argument(
    "-P",
    "--password",
    help="password if the target MQTT broker requires authentication",
)

group.add_argument(
    "-f",
    "--filepath",
    help="path to the file containing the potential passwords",
)
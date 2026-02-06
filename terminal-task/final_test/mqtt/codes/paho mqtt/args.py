import argparse

parser = argparse.ArgumentParser()
parser.add_argument(
    "-r",
    "--rhost",
    required=True,
    help="Hostname/IP address of the target MQTT broker",
)
args = parser.parse_args()
print('Hello, ', args.rhost)
# !/bin/bash
# Build the aiocoap library
cd aiocoap && sudo python3 setup.py install && python3 setup.py build && cd ..
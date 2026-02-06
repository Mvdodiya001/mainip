import sys
import socket
import os
import time
import signal

def is_port_open(ip, port):
    # Create a TCP/IP socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Set a timeout for the connection attempt
        s.settimeout(1)
        # Try to connect to the server
        result = s.connect_ex((ip, port))
        # If the connection was successful, return True (port is open)
        return result == 0

def find_open_port(ip, start_port, end_port):
    # Iterate through the port range to find an open port
    for port in range(start_port, end_port + 1):
        if is_port_open(ip, port):
            return port
    # If no open port is found, return None
    return None

def receive_tcp_packets(ip):
    # Define the range of ports to search for an open port
    start_port = 10
    end_port = 20000

    # Find an open port within the specified range
    device_port = find_open_port(ip, start_port, end_port)
    if device_port is None:
        print("No open ports found.")
        sys.exit(1)  # Exit the program if no open ports are found

    # Create a TCP/IP socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Connect to the server
        s.connect((ip, device_port))
        print(f"Connected to {ip}:{device_port}")

        # Receive data continuously
        while True:
            data = s.recv(1024)  # Adjust buffer size as needed
            if not data:
                break
            
            print("Received:", data.decode())

    
            time.sleep(3)
            close_terminal()

def close_terminal():
    # Exit the Python interpreter to close the terminal
    os._exit(0)

# Example usage
if __name__ == "__main__":
    print("connecting to:", sys.argv[1])
    # Check if the IP address is provided as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: python script.py <IP_ADDRESS>")
        sys.exit(1)
    
    # Extract the IP address from the command-line argument
    ip_address = sys.argv[1]
    
    # Call the function with the provided IP address
    receive_tcp_packets(ip_address)



import sys,socket,subprocess,concurrent.futures
from scapy.all import *
from scapy.layers.inet import IP, TCP
#import whatportis

def scan_ip(host):
    """Scans all ports on the host and returns a list of open ports."""
    open_ports = []
    for port in range(1, 65536):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)  # Short timeout to speed up the scan
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            open_ports.append(port)
            print(f"Port {port} is open")
    return open_ports

def identify_services(port_numbers):
    try:
        for port_number in port_numbers:
            # Run the command to get the service name for the current port number
            command = ["whatportis", str(port_number)]
            result = subprocess.run(command, capture_output=True, text=True)

            # Check if the command was successful
            if result.returncode == 0:
                # Extract the service name from the command output
                service_name = result.stdout.strip()
                print(f"The service running on port {port_number} is: \n {service_name}")
            else:
                print(f"Failed to get service name for port {port_number}.")
    except Exception as e:
        print(f"An error occurred: {e}")
   

def check_http(host, port):
    try:
        # Create a socket connection
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)  # Set a timeout for the connection
            s.connect((host, port))

            # Send an HTTP HEAD request
            s.sendall(b"HEAD / HTTP/1.0\r\n\r\n")

            # Receive the response
            response = s.recv(1024).decode("utf-8")

            # Check the response for the HTTP version
            http_version="x.x"
            if "HTTP/1.0" in response:
                http_version="1.0"
            elif "HTTP/1.1" in response:
                http_version="1.1"
            elif "HTTP/2" in response:
                http_version="2.0"
            elif "HTTP/0.9" in response:
                http_version="0.9"
            elif "HTTP/3" in response:
                http_version="3.0"
            elif "HTTP" in response:
                http_version="x.x"
            else:
                return False
            print(host , " " , port , " " , "HTTP" , http_version)
            return True

    except socket.error as e:
        try :
            s.close()
        except Exception as es :
            pass
        return False


def check_telnet(host, port):
    try:
        # Create a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        # Set a timeout in case the connection attempt takes too long
        s.settimeout(3)
        
        # Attempt to connect to the host and port
        s.connect((host, port))
        
        # Telnet negotiation packet (IAC DO ECHO)
        packet = bytes([255, 251, 1])
        
        # Send the Telnet negotiation packet
        s.sendall(packet)
        
        # Receive response from the server
        response = s.recv(1024)
        
        # Check if the server responds with Telnet negotiation
        if response:
            print(f"Telnet service detected on {host}:{port}")
            s.close()
            return True
        else:
            s.close()
            return False
        
        
    except socket.error as e:
        try :
            s.close()
        except Exception as es :
            pass
        return False

def check_rtsp(host, port):
    try:
        # Create a socket connection
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)  # Set a timeout for the connection
            s.connect((host, port))

            # Send an RTSP OPTIONS request
            s.sendall(b"OPTIONS * RTSP/1.0\r\n\r\n")

            # Receive the response
            response = s.recv(1024).decode("utf-8")

            # Check the response for the RTSP version
            rtsp_version = "x.x"
            if "RTSP/1.0" in response:
                rtsp_version = "1.0"
            elif "RTSP/2.0" in response:
                rtsp_version = "2.0"
            else:
                return False

            print(f"{host}:{port} RTSP {rtsp_version}")
            return True

    except socket.error as e:
        try:
            s.close()
        except Exception as es:
            pass
        return False        
        
def check_ftp_service(host, port):
    try:
        # Create a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        # Set a timeout in case the connection attempt takes too long
        s.settimeout(3)
        
        # Attempt to connect to the host and port
        s.connect((host, port))
        
        # Send an FTP command (in this case, we're sending the "HELLO" command)
        s.sendall(b'HELLO\r\n')
        
        # Receive response from the server
        response = s.recv(1024)
        
        # Check if the server responds with a message indicating it's an FTP service
        if b'220' in response:
            print(f"FTP service detected on {host}:{port}")
            s.close()
            return True
        else:
            s.close()
            return False
        
        # Close the socket
        
        
    except socket.error as e:
        try :
            s.close()
        except Exception as es :
            pass
        return False



def check_ssh(server, port):
    """Checks if SSH service is running on a given server and port."""

    # Creating a new socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((server, port))
        sock.send(b"SSH-2.0-\r\n")
        result = sock.recv(100)

        if result.decode().startswith("SSH"):
            print(f"SSH-2 service is running on {server}:{port}")
            sock.close()
            return True
        else:
            sock.close()
            return False
    except Exception as e:
        try : 
           sock.close()
        except Exception as es :
            pass 
        return False


def host_exists(host):
    try:
        # Attempt to resolve the host
        ip_address = socket.gethostbyname(host)
        
        # Check if the host is reachable
       
        command = ['ping', '-c', '1', ip_address]
        
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Check the return code to determine if ping was successful
        return result.returncode == 0
    except (socket.error, subprocess.TimeoutExpired):
        return False





def port_scanner(host,port):
    if(check_http(host, port)):
       pass
    elif( check_ssh(host, port) ):
        pass
    elif( check_ftp_service(host, port) ):
        pass
    elif( check_telnet(host, port) ):
        pass
    elif( check_rtsp(host, port) ):
        pass
    else : 
        print(f"no service deteced at {host} : {port}")



def port_scanner_2(host,port):
    if(port%10000==0):
        percent= str((port/65536)*100 )
        percent=percent[:3]
        print(f"{percent} % completed")
    if(check_http(host, port)):
       pass
    elif( check_ssh(host, port) ):
        pass
    elif( check_ftp_service(host, port) ):
        pass
    elif( check_telnet(host, port) ):
        pass
    elif( check_rtsp(host, port)):
        pass
    

def host_scanner(host):
    start_time = time.time()  # Record the start time
    
    print("Scanning for all the open port :: \n\n")
    #Getting all the open ports
    open_ports=scan_ip(host)
    
    print("Getting service name and version of service running on open ports :: \n\n")
    #Getting what services are running on those ports according to db
    identify_services(open_ports)

    end_time = time.time()  # Record the end time
    execution_time = end_time - start_time  # Calculate the execution time
    print(f"Execution time: {execution_time:.2f} seconds")

    print("Starting Fake port detection :: \n\n")
    #False port detection
    with concurrent.futures.ThreadPoolExecutor(max_workers=1000) as executor:
        for port in open_ports:
            executor.submit(port_scanner_2,host ,port)  
    pass

    
    #return host port service

def main():
    # Check if there are exactly two command line arguments
    if len(sys.argv) < 2:
        print("Usage: python script.py <host> <port>")
        sys.exit(1)

        host = sys.argv[1]
        try : 
            ports = sys.argv[2:]
            for port in ports:
                port = int(port)
                if(port<0  and port >65535):
                    print(f"invalid port number  : {port}")
                    return
        except Exception as e :
            print(f"invalid port number  : {port}")
            return
        if(host_exists(host)==False):
            print(f"host{host} does not reachable")
            return 
        for port in ports:
       	    port = int(port)
            port_scanner(host,port)
        
        pass 


if __name__ == "__main__":
    main()

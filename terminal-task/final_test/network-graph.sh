#!/bin/bash

# 1. Get Default Gateway
GATEWAY=$(ip route | grep default | head -n 1 | awk '{print $3}')

if [ -z "$GATEWAY" ]; then
    echo "Error: Gateway not found"
    exit 1
fi

echo "Router IP: $GATEWAY"

# 2. Get Local CIDR (IP/Mask)
# This finds the IP and mask of the interface used for the default route
INTERFACE=$(ip route | grep default | head -n 1 | awk '{print $5}')
CIDR=$(ip -o -f inet addr show dev "$INTERFACE" | awk '{print $4}' | head -n 1)

# Failback if CIDR is empty
if [ -z "$CIDR" ]; then
    # Last resort: assume /24 of local IP
    LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}')
    CIDR="${LOCAL_IP%.*}.0/24"
fi

# 3. Active Scan with nmap (ping scan, no DNS, fast)
# Output format: "Nmap scan report for 192.168.1.1"
# We use sudo for better discovery (ARP scan) if available, but script runs as root via server.js sudo call anyway.
# -sn: Ping Scan
# We remove -oG to get standard output with MAC info
# We pass variables to awk
nmap -sn "$CIDR" | awk -v gateway="$GATEWAY" -v local="$LOCAL_IP" '
/Nmap scan report for/{
    # Field could be "for <IP>" or "for <Hostname> (<IP>)"
    # We want the IP. It is usually the last field in parens, or last field if no parens.
    if ($NF ~ /^\(/) {
            # Case: report for Hostname (IP)
            ip=$NF
            gsub(/[()]/, "", ip)
            name=$(NF-1) # Hostname
    } else {
            # Case: report for IP
            ip=$NF
            name=""
    }
}
/MAC Address:/{
    # Vendor is everything after MAC address
    # Line format: MAC Address: 00:11:22:33:44:55 (Vendor Name)
    vendor=$0
    sub(/.*MAC Address: ..:..:..:..:..:.. /, "", vendor)
    
    # Output logic
    if (ip != gateway && ip != local) {
        # Use vendor if available, else hostname
        label = vendor ? vendor : name
        print "Route for host: " ip " " label
        print ip
    }
}
'
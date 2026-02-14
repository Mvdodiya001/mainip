import subprocess
import re
import sys

def ping_trace(target, max_ttl=30, timeout=1):
    hops = []

    for ttl in range(1, max_ttl + 1):
        # Run ping command with a specific TTL
        response = subprocess.run(
            ["ping", "-c", "1", "-t", str(ttl), "-W", str(timeout), target],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Extract responder IP from "From" (TTL exceeded)
        responder_ip = None
        if "From" in response.stdout:
            responder_ip = re.search(r"From (\d+\.\d+\.\d+\.\d+)", response.stdout)
        if not responder_ip:
            # Fallback to any IP in echo reply
            responder_ip = re.search(r"(\d+\.\d+\.\d+\.\d+)", response.stdout)

        # If we found a responder IP
        if responder_ip:
            responder_ip = responder_ip.group(1)
            # print(f"TTL {ttl} -> {responder_ip}")
            hops.append(responder_ip)

            # Check if the responder IP matches the target IP
            if responder_ip == target:
                print(f"\nReached target IP ({target}) at TTL {ttl}.")
                print(f"\nPath to {target}:")
                for idx, hop in enumerate(hops, start=1):
                    print(f"Hop {idx}: {hop}")
                break
        else:
            print(f"TTL {ttl} -> * (no response)")
            hops.append("*")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 traceroute.py <target_ip_or_hostname>")
        sys.exit(1)

    target = sys.argv[1]
    ping_trace(target)

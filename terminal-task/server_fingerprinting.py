import subprocess
import re
import json
import http.client
import argparse  # For command-line arguments

# Function to send HTTP request and return response or error
def send_request(method, path, target):
    try:
        conn = http.client.HTTPConnection(target, timeout=5)
        conn.request(method, path, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        })
        response = conn.getresponse()

        result = {
            "method": method,
            "path": path,
            "status": f"HTTP/1.1 {response.status} {response.reason}",
            "headers": dict(response.getheaders())
        }

        conn.close()
        return result
    except Exception as e:
        return {
            "method": method,
            "path": path,
            "error": str(e)
        }

# Function to run Nmap scan and return parsed data in JSON format
def run_nmap_scan(target, port):
    command = ["nmap", "-p", port, "--script", "serverspy.nse", target]

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        # print("\nRaw Nmap Output:\n", result.stdout)  # Display raw Nmap output
        parsed_data = parse_nmap_output(result.stdout)
        return parsed_data
    except subprocess.CalledProcessError as e:
        return {"error": str(e)}

# Function to parse Nmap output and return the results in JSON format
def parse_nmap_output(output):
    matches = re.findall(r"\|\s+(\d+)\s+([A-Za-z0-9.\- ]+)\s+(\d+)\s+(\d+)", output)
    parsed_data = [{"Rank": match[0], "Server Version": match[1].strip(), "Score": match[2], "Hits": match[3]} for match in matches]
    return parsed_data if parsed_data else [{"Rank": "No Data", "Server Version": "-", "Score": "-", "Hits": "-"}]

# Function to export parsed data to JSON file
def export_to_json(data, output_file):
    if not data:
        print("Export Error: No scan results to export!")
        return

    with open(output_file, mode="w") as file:
        json.dump(data, file, indent=4)

    # print(f"Export Successful: Scan results saved to {output_file}")

# Main execution
if __name__ == "__main__":
    # Command-line argument parsing
    parser = argparse.ArgumentParser(description="ServerSpy - Nmap & HTTP Fingerprinting Tool")
    parser.add_argument("target", help="Target website or IP address")
    parser.add_argument("port", help="Port number to scan")
    parser.add_argument("-o", "--output", help="Output JSON file (optional)", default="scan_results.json")

    args = parser.parse_args()
    target = args.target
    port = args.port
    output_file = args.output

    # Run Nmap Scan
    # print(f"Running Nmap scan on {target}:{port}...")
    nmap_data = run_nmap_scan(target, port)

    # Print Nmap results to console
    # print("\nParsed Nmap Scan Results (JSON):")
    json.dumps(nmap_data, indent=4)

    # HTTP Request Tests using the same target
    http_responses = []
    methods_paths = [
        ("GET", "/"),
        ("GET_LONG", "/" + "a" * 1024),
        ("GET_NONEXISTING", "/404test_.html"),
        ("HEAD", "/")
    ]

    for method, path in methods_paths:
        # print(f"\nSending {method} request to {target}{path}...")
        http_response = send_request(method, path, target)
        http_responses.append(http_response)

    # Print HTTP responses
    # print("\nHTTP Responses (JSON):")
    json.dumps(http_responses, indent=4)

    # Export to JSON (combine Nmap and HTTP responses)
    combined_data = {
        "target": target,
        "nmap_results": nmap_data,
        "http_responses": http_responses
    }
    export_to_json(combined_data, output_file)

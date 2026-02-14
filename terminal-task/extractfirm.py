import os
import re
import string

# -----------------------------
# Extract readable strings
# -----------------------------
def extract_strings(binary_data, min_length=4):
    result = []
    current = ""

    for byte in binary_data:
        char = chr(byte)
        if char in string.printable:
            current += char
        else:
            if len(current) >= min_length:
                result.append(current)
            current = ""

    if len(current) >= min_length:
        result.append(current)

    return result


# -----------------------------
# Regex patterns
# -----------------------------
FIRMWARE_PATTERN = re.compile(
    r'"(firmware|fw|soft|sw|app|device|image|build|ver)[^"]*"\s*:\s*"[^"]*[0-9][^"]*"',
    re.IGNORECASE
)

NOISE_PATTERN = re.compile(
    r'(verify|verbose|vertical|verified|advert|convert|server|mode)',
    re.IGNORECASE
)

# -----------------------------
# Scan one PCAP file
# -----------------------------
def scan_pcap(file_path):
    with open(file_path, "rb") as f:
        data = f.read()

    strings_output = extract_strings(data)
    results = set()

    for line in strings_output:
        for match in FIRMWARE_PATTERN.finditer(line):
            text = match.group(0)
            if not NOISE_PATTERN.search(text):
                clean = text.replace('"', '')
                results.add(clean)

    return results


# -----------------------------
# Main logic: scan folder
# -----------------------------
import sys

# -----------------------------
# Main logic: scan folder or single file
# -----------------------------
def main():
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        if not os.path.exists(file_path):
            print(f"[-] File not found: {file_path}")
            return

        # print(f"[+] Scanning single file: {file_path}")
        try:
            results = scan_pcap(file_path)
            if not results:
                print("[-] No firmware or software version found.")
            else:
                print("[+] Found:")
                for item in sorted(results):
                    print(item) # Printed simply for easier parsing
        except Exception as e:
            print(f"[!] Error scanning {file_path}: {e}")
        return

    current_dir = os.getcwd()
    pcap_files = [
        f for f in os.listdir(current_dir)
        if f.endswith((".pcap", ".pcapng"))
    ]

    if not pcap_files:
        print("[-] No .pcap or .pcapng files found in this folder.")
        return

    print(f"[*] Found {len(pcap_files)} capture files\n")

    for file in pcap_files:
        print("=" * 60)
        # print(f"[+] Scanning: {file}")

        try:
            results = scan_pcap(file)

            if not results:
                print("[-] No firmware or software version found.")
            else:
                print("[+] Found:")
                for item in sorted(results):
                    print("   ", item)

        except Exception as e:
            print(f"[!] Error scanning {file}: {e}")

    print("\n[*] Scan completed.")


if __name__ == "__main__":
    main()

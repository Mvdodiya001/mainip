#!/bin/bash

# 1. Input Validation
if [ -z "$1" ]; then
    echo "Usage: $0 <pcap_file>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found!"
    exit 1
fi


# 2. The Extraction Logic
# -----------------------
# Logic Breakdown:
# 1. strings: Extracts readable text from the binary/pcap file.
#
# 2. grep -Eoi (The Search):
#    - Pattern: '"(firmware|...)[^"]*"\s*:\s*"[^"]*[0-9][^"]*"'
#    - Catches keys starting with fw, soft, ver, etc.
#    - Handles ':' with or without spaces.
#    - Requires at least one DIGIT [0-9] in the value to avoid text-only garbage.
#
# 3. grep -viE (The Noise Filter):
#    - Removes known false positives like 'verify', 'server', 'mode', etc.
#
# 4. tr -d (Cleanup):
#    - Deletes the double quotes to make the text clean.
#
# 5. sort -u (Deduplication) [NEW ADDITION]:
#    - Sorts the results and removes exact duplicates.
#    - Ensures you only see unique firmware versions found.

RESULT=$(strings "$FILE" | grep -Eoi '"(firmware|fw|soft|sw|app|device|image|build|ver)[^"]*"\s*:\s*"[^"]*[0-9][^"]*"' | grep -viE '(verify|verbose|vertical|verified|advert|convert|server|mode)' | tr -d '"' | sort -u)

# 3. Output
if [ -z "$RESULT" ]; then
    echo "[-] No firmware or software version found."
else
    echo "[+] Found:"
    echo "$RESULT"
fi

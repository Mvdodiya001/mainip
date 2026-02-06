from scapy.all import rdpcap, IP, TCP, UDP, Raw
from collections import Counter
import math
import os
import sys
import json

def calculate_entropy(data):
    if not data:
        return 0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(x)) / len(data)
        if p_x > 0:
            entropy += -p_x * math.log(p_x, 2)
    return entropy

def calculate_ngram_score(data, n=2):
    if len(data) < n:
        return 0
    
    ngrams = [data[i:i+n] for i in range(len(data)-n+1)]
    ngram_counts = Counter(ngrams)
    total_ngrams = len(ngrams)
    frequencies = {ngram: count/total_ngrams for ngram, count in ngram_counts.items()}
    
    ngram_entropy = -sum(freq * math.log(freq, 2) for freq in frequencies.values())
    max_entropy = math.log(min(256**n, total_ngrams), 2)
    normalized_entropy = ngram_entropy / max_entropy if max_entropy > 0 else 0
    
    return normalized_entropy

def chi_square_uniformity(data):
    observed = Counter(data)
    expected = len(data) / 256
    chi_square = sum((observed[i] - expected) ** 2 / expected for i in range(256))
    return chi_square

def check_repetitive_patterns(data):
    for i in range(1, min(len(data) // 2, 20)):
        if data[:i] * (len(data) // i) == data[:len(data) - (len(data) % i)]:
            return True
    return False

def check_common_headers(data):
    common_headers = [b"GET ", b"POST ", b"HTTP/", b"SSH-", b"220 ", b"EHLO ", b"HELO "]
    return any(data.startswith(header) for header in common_headers)

def check_printable_ratio(data):
    printable = sum(32 <= byte <= 126 for byte in data)
    return printable / len(data) if data else 0

def is_likely_encrypted(payload):
    results = {}
    method_values = {}
    
    entropy = calculate_entropy(payload)
    results['byte_entropy'] = entropy > 7
    method_values['byte_entropy'] = entropy
    
    bigram_score = calculate_ngram_score(payload, n=2)
    trigram_score = calculate_ngram_score(payload, n=3)
    
    results['bigram_entropy'] = bigram_score > 0.9
    results['trigram_entropy'] = trigram_score > 0.85
    method_values['bigram_entropy'] = bigram_score
    method_values['trigram_entropy'] = trigram_score
    
    chi_square = chi_square_uniformity(payload)
    results['chi_square'] = chi_square < 500
    method_values['chi_square'] = chi_square
    
    printable_ratio = check_printable_ratio(payload)
    results['low_printable_ratio'] = printable_ratio < 0.45
    method_values['printable_ratio'] = printable_ratio
    
    weights = {
        'byte_entropy': 1,
        'bigram_entropy': 2,
        'trigram_entropy': 1,
        'chi_square': 1,
        'low_printable_ratio': 1
    }
    
    total_weight = sum(weights.values())
    encryption_score = sum(weights[k] * float(v) for k, v in results.items()) / total_weight
    
    return encryption_score, results, method_values

def get_payload(packet):
    if packet.haslayer(Raw):
        return bytes(packet[Raw].load)
    elif packet.haslayer(TCP) and packet[TCP].payload:
        return bytes(packet[TCP].payload)
    elif packet.haslayer(UDP) and packet[UDP].payload:
        return bytes(packet[UDP].payload)
    return None

def get_protocol(packet):
    if packet.haslayer(TCP):
        return "TCP"
    elif packet.haslayer(UDP):
        return "UDP"
    elif packet.haslayer(IP):
        return f"IP (Proto: {packet[IP].proto})"
    else:
        return "Unknown"

def analyze_pcap_file(filepath):
    packets = rdpcap(filepath)
    results = []
    
    for i, packet in enumerate(packets):
        payload = get_payload(packet)
        protocol = get_protocol(packet)
        if payload:
            encryption_score, detailed_results, method_values = is_likely_encrypted(payload)
            results.append({
                "packet_number": i + 1,
                "protocol": protocol,
                "payload_length": len(payload),
                "payload": payload[:1500].decode(errors='ignore'),  # Decode for JSON compatibility
                "encryption_score": encryption_score,
                "results": detailed_results,
                "method_values": method_values
            })
        else:
            results.append({
                "packet_number": i + 1,
                "protocol": protocol,
                "payload_length": 0,
                "payload": None,
                "encryption_score": None,
                "results": None,
                "method_values": None
            })
    
    return results

def save_results_to_json(results, filename):
    with open(filename, 'w') as json_file:
        json.dump(results, json_file, indent=4)

def print_analysis_results(results):
    encrypted_count = 0
    unencrypted_count = 0
    undetermined_count = 0
    packets_with_payload = 0

    for result in results:
        print(f"Packet {result['packet_number']}:")
        print(f"Protocol: {result['protocol']}")
        if result['payload_length'] == 0:
            print("No payload present")
        else:
            packets_with_payload += 1
            encryption_score = result['encryption_score']
            if encryption_score >= 0.8:
                status = 'Encrypted'
                encrypted_count += 1
            elif encryption_score <= 0.5:
                status = 'Unencrypted'
                unencrypted_count += 1
            else:
                status = 'Undetermined'
                undetermined_count += 1

            print(f"Payload length: {result['payload_length']} bytes")
            print(f"Payload preview: {result['payload'][:200]}")
            print(f"Encryption score: {encryption_score:.4f} - {status}")
            print("\nDetailed Results:")
            for method, value in result['results'].items():
                print(f"{method}: {value}")
            print("\nMethod Values:")
            for method, value in result['method_values'].items():
                print(f"{method}: {value:.4f}")

        print("\n" + "-"*50 + "\n")

    print("Summary:")
    print(f"Total packets: {len(results)}")
    print(f"Packets with payload: {packets_with_payload}")
    
    if packets_with_payload > 0:
        print(f"Encrypted packets: {encrypted_count} ({encrypted_count/packets_with_payload*100:.2f}%)")
        print(f"Unencrypted packets: {unencrypted_count} ({unencrypted_count/packets_with_payload*100:.2f}%)")
        print(f"Undetermined packets: {undetermined_count} ({undetermined_count/packets_with_payload*100:.2f}%)")
    else:
        print("No packets with payload found. Unable to calculate encryption percentages.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 encryption.py <path_to_pcap_file> <path_to_json_file>")
        sys.exit(1)
    
    pcap_file_path = sys.argv[1]
    json_file_path = sys.argv[2]
    
    if os.path.isfile(pcap_file_path):
        results = analyze_pcap_file(pcap_file_path)
        # print_analysis_results(results)
        save_results_to_json(results, json_file_path)  # Save results to specified JSON file
    else:
        print(f"File '{pcap_file_path}' does not exist.")


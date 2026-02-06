import sys
import subprocess
import re
import pandas as pd
from scapy.all import *
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os
import signal
import json
import warnings
import numpy as np

c = 0
unknown = 1

def run_analysis(target_ip):
    # Load the dataset (replace 'tcp_ip.xlsx' with your file path)
    file_name = 'tcp_ip.xlsx'
    df = pd.read_excel(file_name)
    result = {}

    # Drop any rows with missing values
    df.dropna(inplace=True)

    # Define the integer indices for the features and target columns
    feature_indices = [11, 5, 2, 12, 26, 15, 21, 19]  # Adjust these indices according to your dataset
    target_index = 0  # Adjust this index according to your dataset

    # Extract features based on the specified indices
    X = df.iloc[:, feature_indices]

    # Extract the target variable 'os'
    y = df.iloc[:, target_index]

    # Encode the target variable 'os' using label encoding
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y)

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=48)

    # Set n_estimators to 100
    n_estimators = 50

    # Create the RandomForestClassifier with n_estimators=100
    rf_classifier = RandomForestClassifier(n_estimators=n_estimators, random_state=42)
    rf_classifier.fit(X_train, y_train)
    # print(11)

    def extract_packet_info(packet):
        packet_info = {}
        # print(12)
        if IP in packet:
            packet_info['ip_total_length'] = packet[IP].len
            packet_info['ip_id'] = packet[IP].id
            packet_info['ip_checksum'] = packet[IP].chksum
            packet_info['ip_ttl'] = packet[IP].ttl

        if TCP in packet:
            packet_info['tcp_window_size'] = packet[TCP].window
            packet_info['tcp_checksum'] = packet[TCP].chksum
            packet_info['tcp_seq'] = packet[TCP].seq
            packet_info['tcp_off'] = packet[TCP].dataofs * 4  # Convert offset to bytes

        return packet_info

    def process_packet(packet):
        # print(13)
        global unknown
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            # print(17)
            packet_info = extract_packet_info(packet)
            # print(packet[IP].src, target_ip)
            # print(len(packet_info) == 8)
            if packet_info and len(packet_info) == 8 and packet[IP].src == target_ip:
                values_array = list(packet_info.values())
                # print(18)
                # Perform prediction
                new_list = [values_array]
                predictions = rf_classifier.predict(new_list)
                predicted_labels = label_encoder.inverse_transform(predictions)

                import numpy as np
                filtered_data = df[df.iloc[:, 0] == predicted_labels[0]]
                features_to_match = [11, 5, 2, 12, 26, 25, 21, 19]
                best_matching_row = None
                min_difference = np.inf
                for index, row in filtered_data.iterrows():
                    difference = sum(abs(row[features_to_match] - values_array))
                    if difference < min_difference:
                        min_difference = difference
                        best_matching_row = row
                
                #'severity': 'none'

                # Convert the dictionary to a JSON string
                #result_json = json.dumps(result)

                # Print only the result
                result = {
                    predicted_labels[0],
                    best_matching_row[1]
                }

                if len(result) == 2 :
                    unknown = 0
                print(result)

                
                if c > 1:
                    sys.exit()

                # Stop sniffing further packets
                sniff(prn=lambda x: None, filter="tcp", store=0)
                
                # Exit the script after processing one packet
                sys.exit()

    def timeout_handler(signum, frame):
        #print("timeout 50 sec")
        if unknown == 1:
            print("Unknown")
        # print(14)
        sys.exit(1)

    # print(15)
    # Set up the signal handler for timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    # Set the timeout duration (in seconds)
    timeout_duration = 50
    # Set the alarm to trigger after the timeout duration
    signal.alarm(timeout_duration)

    sniff(prn=process_packet, filter="tcp", store=0, iface=interface)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 tool.py <TARGET_IP> <INTERFACE>")
        sys.exit(1)
    # print(10)
    target_ip = sys.argv[1]
    interface = sys.argv[2]
    run_analysis(target_ip)


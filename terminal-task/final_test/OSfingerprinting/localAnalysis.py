import pandas as pd
import numpy as np
import warnings
import psutil
from scapy.all import *
from scapy.layers.inet import TCP
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import pyshark


file_name = 'fm.xlsx'

df = pd.read_excel(file_name)

# Drop any rows with missing values

df.dropna(inplace=True)

import warnings
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# Suppress warnings
warnings.filterwarnings("ignore")

# Define the integer indices for the features and target columns
feature_indices = [1, 2]  # Adjust these indices according to your dataset
target_index = 4  # Adjust this index according to your dataset
major_version_index = 5  # Index for major version
minor_version_index = 6  # Index for minor version

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
n_estimators = 100

# Create the RandomForestClassifier with n_estimators=100
rf_classifier = RandomForestClassifier(n_estimators=n_estimators, random_state=42)
rf_classifier.fit(X_train, y_train)


# Calculate accuracy on the test set
y_pred = rf_classifier.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
#print(f'Accuracy on the test set: {accuracy * 100:.2f}%')

# Reverse the encoding of class labels to get the original string labels
y_test_original = label_encoder.inverse_transform(y_test)
y_pred_original = label_encoder.inverse_transform(y_pred)

# Generate a classification report with string class labels
classification_rep = classification_report(y_test_original, y_pred_original)

# Print the classification report
#print("Classification Report:")
#print(classification_rep)

#print("*"*100)
#print("*"*100)

interfaces = psutil.net_if_stats()
    

        
inter = "wlo1"

# Initialize the Wireshark capture object
capture = pyshark.LiveCapture(interface=inter)  # Replace 'eth0' with your network interface
#print("*"*100)
#print("*"*100)

# Define a function to find the closest row in the dataset for a predicted OS
def find_closest_os_row(df, predicted_os, syn_size, window_size):
    # Filter the dataset to include only rows with the predicted OS
    filtered_df = df[df['os'] == predicted_os]

    if filtered_df.empty:
        return None  # No matching OS in the dataset

    # Calculate the distances to all data points
    distances = np.linalg.norm(filtered_df[['﻿syn size', 'win size']] - [syn_size, window_size], axis=1)
    
    # Find the index of the closest row
    closest_index = distances.argmin()

    # Get the major and minor versions of the closest OS
    predicted_major = filtered_df.iloc[closest_index, df.columns.get_loc('major version')]
    predicted_minor = filtered_df.iloc[closest_index, df.columns.get_loc('minor version')]
    
    return predicted_major, predicted_minor
    
# Start capturing packets and making predictions
# Initialize a dictionary to store processed IP addresses and their information
ip_info_dict = {}

# Start capturing packets and making predictions
for packet_number, packet in enumerate(capture):
    if 'TCP' in packet and 'IP' in packet:
        src_ip = packet['IP'].src  # Get the source IP address

        # Check if the source IP address starts with "172"
        #if not src_ip.startswith("172"):
            # If it doesn't start with "172," skip this packet
            #continue

        # Check if the source IP address has been processed before
        if src_ip in ip_info_dict:
            # If it exists in the dictionary, skip this packet
            continue

        # Check if the packet is a TCP packet with the SYN flag set
        if int(packet['TCP'].flags_syn) == 1:
            syn_size = len(packet)
            window_size = int(packet['TCP'].window_size)

            # Predict OS for the new data point
            new_data_point = np.array([syn_size, window_size])

            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=UserWarning)
                predicted_class = rf_classifier.predict([new_data_point])

            predicted_label = label_encoder.inverse_transform(predicted_class)

            # Check if there's a matching OS in the dataset
            major_version, minor_version = None, None
            if predicted_label[0] in df['os'].values:
                major_version, minor_version = find_closest_os_row(df, predicted_label[0], syn_size, window_size)

            # Store the information in the dictionary
            ip_info_dict[src_ip] = (predicted_label[0], major_version, minor_version)

            # Print the results
            print("="*50)
            print(f'Predicted OS: {predicted_label[0]}')
            print(f'Source IP: {src_ip}, Predicted Major Version: {major_version}, Predicted Minor Version: {minor_version}')
            print("="*50)
            

        break
    break
            #print(syn_size)
            #print(window_size)


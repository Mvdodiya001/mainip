#!/bin/bash

apk_path=$1
jadx_output_path=$2

source scanner-venv/bin/activate && scanner scan -p $jadx_output_path && deactivate
rm -rf $jadx_output_path
rm $apk_path
#!/bin/bash
# keeps the combined server alive (no launchd). Usage: nohup ./run_server.sh >/tmp/rd_server.log 2>&1 &
cd "$(dirname "$0")"
while true; do python3 server.py; echo "server exited $? — restarting in 2s"; sleep 2; done

#!/bin/bash
# This script automatically updates the online judge from
# the Github repo and restarts the server.

# Pull latest from Github repo
echo "Pulling latest version of the online judge..."
git pull

# Restart the server
bash start.sh
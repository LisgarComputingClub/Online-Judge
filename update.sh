#!/bin/bash
# This script automatically updates the online judge from
# the Github repo and restarts the server.

# Pull latest from Github repo
echo "Attempting to pull latest version of online judge..."
git pull

# Restarting server
node main
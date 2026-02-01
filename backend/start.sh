#!/bin/bash
# Termux Start Script for NeoCode

# Create socket folder if it doesn't exist
mkdir -p $PREFIX/var/run/postgresql

# Start PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql -o "-k $PREFIX/var/run/postgresql" start

# Wait a few seconds to ensure DB is ready
sleep 2

clear
echo "-------------------------------------"
echo " NeoDB & Node Server Starting..."
echo "-------------------------------------"

# Optional: show status
pg_ctl -D $PREFIX/var/lib/postgresql status

# Start Node server
node server.js
#!/bin/sh

# Exits 99 if no arguments are given
# Exits 0 if the certificate is valid
# Exits 1 if the certificate not valid or is going to expire soon

SERV_PORT="${SERV_PORT:-443}"

if [ -z "${SERV_NAME}" ]; then
    echo "Usage: SERV_NAME='serv' $0"
    exit 99
fi

ping -c 1 -W 10 "${SERV_NAME}"

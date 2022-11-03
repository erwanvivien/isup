#!/bin/bash

# Exits 99 if no arguments are given
# Exits 0 if the certificate is valid
# Exits 1 if the certificate not valid or is going to expire soon

SERV_NAME="${1}"
SERV_PORT="${2:-443}"

if [ -z "${SERV_NAME}" ] || [ -z "${SERV_PORT}" ]; then
    echo "Usage: ./$0 'server_name' 'server_port'"
    exit 99
fi

# openssl s_client -servername xiaojiba.dev -connect xiaojiba.dev:80 <<< 'Q' 2>/dev/null | openssl x509 -noout -dates
complete_certificates=$(openssl s_client -servername "${SERV_NAME}" -connect "${SERV_NAME}:${SERV_PORT}" <<< 'Q' 2>/dev/null)
# echo "$complete_certificates"
if [ "$?" -ne 0 ]; then
    echo "No certficates were found"
    exit 5
fi

# Checks if certificate expires in one month
echo "${complete_certificates}" | openssl x509 -noout -dates -checkend 2592000

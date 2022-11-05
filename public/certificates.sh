#!/bin/sh

# Exits 99 if no arguments are given
# Exits 0 if the certificate is valid
# Exits 1 if the certificate not valid or is going to expire soon

SERV_PORT="${SERV_PORT:-443}"

if [ -z "${SERV_NAME}" ]; then
    echo "Usage: SERV_NAME='serv' $0"
    exit 99
fi

complete_certificates=$(echo 'Q' | openssl s_client -servername "${SERV_NAME}" -connect "${SERV_NAME}:${SERV_PORT}" 2>/dev/null)
# echo "$complete_certificates"
if [ "$?" -ne 0 ]; then
    echo "No certficates were found"
    exit 5
fi

# Checks if certificate expires in one month
echo "${complete_certificates}" | openssl x509 -noout -dates -checkend 2592000

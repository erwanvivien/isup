#!/bin/bash

# Exits 99 if no arguments are given
# Exits 5 if the certificate are not found
# Exits 0 if the certificate is valid
# Exits 1 if the certificate is about to expire
# Exits 2 if the certificate is expired

SERV_NAME="${1}"
SERV_PORT="${2}"

if [ -z "${SERV_NAME}" ] || [ -z "${SERV_PORT}" ]; then
    echo "USAGE"
    exit 99
fi

# openssl s_client -servername xiaojiba.dev -connect xiaojiba.dev:80 <<< 'Q' 2>/dev/null | openssl x509 -noout -dates
complete_certificates=$(openssl s_client -servername "${SERV_NAME}" -connect "${SERV_NAME}:${SERV_PORT}" <<< 'Q' 2>/dev/null)
if [ "$?" -ne 0 ]; then
    echo "NOT_FOUND"
    exit 5
fi

certificates=$(echo "${complete_certificates}" | openssl x509 -noout -dates | cut -d'=' -f2 | date '+%s' -f - | xargs)
read -r notBefore notAfter <<< "${certificates}"
now=$(date +%s)

if [ -z "$notBefore" ] || [ -z "$notAfter" ]; then
    echo "FAILED"
    exit 5
fi

if [ "$now" -lt "$notBefore" ]; then 
    echo "OK"
    exit 0
elif [ "$now" -gt "$notAfter" ]; then 
    echo "EXPIRED"
    exit 2
else
    echo "REFRESH"
    exit 1
fi

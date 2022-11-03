#!/bin/bash

SERV_NAME="${1}"
MAX_TIME="${2:-1}"

# Exits 99 if no arguments are given
# Exits 0 if response time is less than MAX_TIME second(s)
# Exits 1 if response time is more than MAX_TIME second(s)

if [ -z "${SERV_NAME}" ]; then
    echo "Usage: ./$0 'server_name' [MAX_TIME]"
    exit 99
fi

output=$(curl -w "@public/resp_time.fmt" -o /dev/null -s "${SERV_NAME}")
echo "${output}"

# Retrieves the response time
time_total=$(echo "${output}" | tail -n 1 | xargs | cut -d' ' -f2)
# Checks if response time is greater than 1 second
is_too_long=$(echo "${time_total:: -1} > ${MAX_TIME}" | bc -l)
if [ "${is_too_long}" -eq 1 ]; then
    echo "Response time is too long"
    exit 1
fi
exit 0

#!/usr/bin/env bash

personal_website_sckt="$1"

while true; do
    flask db upgrade
    if [[ "$?" == '0' ]]; then
        break
    fi
    echo 'Upgrade command failed, retrying in 3 secs...'
    sleep 3
done

# `exec` should be used to make sure this can receive SIGTERM and gracefully shut down
# `forwarded-allow-ips` tells gunicorn from which ips to trust `X-Fowarded-*` headers
exec gunicorn --bind "unix:$personal_website_sckt" --umask 007 --workers 4 \
    --forwarded-allow-ips="*" --access-logfile - --error-logfile - \
    personal_website:app

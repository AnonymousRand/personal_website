#!/usr/bin/env bash

while true; do
    flask db upgrade
    if [[ "$?" == '0' ]]; then
        break
    fi
    echo 'Upgrade command failed, retrying in 3 secs...'
    sleep 3
done

# SYNC: unix socket pointed to by nginx!
# `forwarded-allow-ips` tells gunicorn from which ips to trust `X-Fowarded-*` headers
exec gunicorn --bind "unix:$PERSONAL_WEBSITE_SCKT" --umask 007 --workers 4 --forwarded-allow-ips="*" --access-logfile - --error-logfile - personal_website:app

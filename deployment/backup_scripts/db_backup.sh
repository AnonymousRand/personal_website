#!/usr/bin/env bash

# IMPORTANT: run `ssh` to each destination host first to trust their keys! also, you must
# run this as the user which this script will run as (by default, `sudo`).
#
# args:
#     - `$1`: destination path for backup, formatted identically to the destination path of `scp`.
#     - `$2`: backup number to be appended to the backup name.

set -ex

# SYNC: path to personal website's base directory `.env`! (for db name, etc.)
source ../../.env
source ./.db_backup.env

host_backup_path="./backup_$2.sql"

mysqldump -S "$PERSONAL_WEBSITE_MYSQL_SCKT" \
    -u "$PERSONAL_WEBSITE_MYSQL_USERNAME" \
    -password="$PERSONAL_WEBSITE_MYSQL_PASSWORD" \
    "$PERSONAL_WEBSITE_MYSQL_DB_NAME" > "$host_backup_path"
rsync -e "ssh -i $SSH_PRIVATE_KEY_LOCATION" --backup --suffix=`date +'.%F_%H-%M-%S'` \
    "$host_backup_path" "$1"

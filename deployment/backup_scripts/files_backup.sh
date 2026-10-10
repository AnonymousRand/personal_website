#!/usr/bin/env bash

set -ex

# SYNC: path to personal website's base directory
for file in ../../app/blog/static/blogpage/*; do
    if [[ -d "$file/files/" ]]; then
        git add "$file/files/"
    fi
done

# since we have `set -e`, we need to not commit if nothing was changed, as that exits with error
git diff-index --quiet HEAD || git commit -m "[autocommit] thank you github for free file backups <3"
git push

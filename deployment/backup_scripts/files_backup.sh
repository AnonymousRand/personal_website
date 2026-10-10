#!/usr/bin/env bash

set -ex

# SYNC: relative path to git repo base
for file in ../../app/blog/static/blogpage/*; do
    if [[ -d "$file/files/" ]]; then
        git add "$file/files/"
    fi
done

# since we have `set -e`, we need to not commit if nothing was changed, as that exits with error
git diff-index --quiet HEAD || git commit -m "[autocommit] thank you github for free file backups <3"
git push

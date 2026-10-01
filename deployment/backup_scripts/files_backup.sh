#!/usr/bin/env bash

set -e

# SYNC: relative path to git repo base
for file in ../../app/blog/static/blogpage/*; do
    if [[ -d "$file/files/" ]]; then
        git add "$file/files/"
    fi
done

git commit -m "[autocommit] thank you github for free file backups <3"
git push

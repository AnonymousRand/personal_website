#!/bin/sh

set -euo pipefail
set -x

sass ./theme/scss/custom_bootstrap.scss:./compiled_css/custom_bootstrap.css \
    --load-path ./node_modules/

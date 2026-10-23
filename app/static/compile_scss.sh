#!/usr/bin/env bash

set -euo pipefail
set -x

load_path_args=(--load-path ./theme/scss/ --load-path ./theme/css/)

sass ./scss/:./scss_output/       "${load_path_args[@]}" --style=compressed
sass ./theme/scss/:./scss_output/ "${load_path_args[@]}" --style=compressed

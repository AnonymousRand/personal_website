#!/usr/bin/env bash

set -euo pipefail
set -x

load_path_args=(--load_path ./theme/scss/)

sass ./scss/:./scss_output/       "${load_path_args[@]}" --style=compressed
sass ./theme/scss/:./scss_output/ "${load_path_args[@]}" --style=compressed

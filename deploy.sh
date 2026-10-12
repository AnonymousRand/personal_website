#!/usr/bin/env bash

set -ex

# this makes sure that this script always runs in its own directory so that it pulls
# the right `.env`, for instance (this should also be an absolute path)
script_path="$(dirname "$(realpath "${BASH_SOURCE[0]:-$0}")")"
cd "$script_path"

source ./.env
path_to_utils="$PATH_TO_SERVER_ROOT/$PATH_FROM_ROOT_TO_UTILS"

chmod +x "$path_to_utils/sync_dotenvs.sh"
"$path_to_utils/sync_dotenvs.sh"

chmod +x ./stop.sh
./stop.sh

docker system prune --force
docker compose --profile "$DOCKER_DEFAULT_PROFILE" build --no-cache
if [[ "$1" == "-d" ]]; then
    docker compose --profile "$DOCKER_DEFAULT_PROFILE" up --force-recreate -d
else
    docker compose --profile "$DOCKER_DEFAULT_PROFILE" up --force-recreate
fi

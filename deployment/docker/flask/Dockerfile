# SYNC: all filepaths and names

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

################################################################################

FROM node:current-alpine AS node

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

USER ${DOCKER_ROOT_USER}

RUN mkdir -p ./static/
COPY --chown=${DOCKER_NONROOT_USER} ./app/static/ ./static/
WORKDIR ./static/
RUN chown ${DOCKER_NONROOT_USER} ./
# needed for nonroot `npm install` to be able to write to this
ENV NPM_CONFIG_CACHE=/tmp/.npm/

USER ${DOCKER_NONROOT_USER}

RUN npm install sass
RUN npm run compile_bootstrap

################################################################################

FROM busybox:musl AS busybox
FROM python:3.10-slim-bookworm

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

USER ${DOCKER_ROOT_USER}

# install busybox's statically-compiled binaries for basic shell commands
COPY --from=busybox /bin/busybox /bin/
RUN ["/bin/busybox", "--install", "-s", "/bin"]

RUN mkdir -p ./personal_website/
WORKDIR ./personal_website/

COPY --chown=${DOCKER_NONROOT_USER} ./app/ ./app/
COPY --chown=${DOCKER_NONROOT_USER} ./migrations/ ./migrations/
COPY --chown=${DOCKER_NONROOT_USER} ./personal_website.py ./config.py ./
COPY --chown=${DOCKER_NONROOT_USER} ./deployment/docker/flask/entrypoint.sh ./
COPY --from=node --chown=${DOCKER_NONROOT_USER} /static/css/custom_bootstrap.css ./app/static/css/

# `pip install` generally needs root still
COPY ./requirements.txt ./requirements.txt
RUN pip install -r ./requirements.txt

USER ${DOCKER_NONROOT_USER}

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

# SYNC: all filepaths and names

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

################################################################################

FROM node:current-alpine AS node

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

# as creating directories in `/` needs root perms
USER ${DOCKER_ROOT_USER}

RUN mkdir -p /static/          && chown ${DOCKER_NONROOT_USER} /static/
RUN mkdir -p /blogpage_static/ && chown ${DOCKER_NONROOT_USER} /blogpage_static/
COPY --chown=${DOCKER_NONROOT_USER} ./app/static/               /static/
COPY --chown=${DOCKER_NONROOT_USER} ./app/blog/static/blogpage/ /blogpage_static/

USER ${DOCKER_NONROOT_USER}

# needed for nonroot `npm install` to be able to write to its target dir
ENV NPM_CONFIG_CACHE=/tmp/.npm/
RUN npm install sass

RUN npm --prefix /static/ run compile_custom_bootstrap
RUN sass /static/scss/:/static/compiled_css/ \
    --load-path /static/theme/scss/ --load-path /static/theme/css/ --style=compressed
RUN sass /blogpage_static/scss/:/blogpage_static/compiled_css/ \
    --load-path /static/theme/scss/ --load-path /static/theme/css/ --style=compressed

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

# `pip install` generally needs root still
COPY ./requirements.txt ./requirements.txt
RUN pip install -r ./requirements.txt

USER ${DOCKER_NONROOT_USER}

RUN mkdir -p ./app/static/css/
RUN mkdir -p ./app/blog/static/blogpage/css/
COPY --from=node --chown=${DOCKER_NONROOT_USER} \
    /static/compiled_css/* ./app/static/css/
COPY --from=node --chown=${DOCKER_NONROOT_USER} \
    /blogpage_static/compiled_css/* ./app/blog/static/blogpage/css/

COPY --chown=${DOCKER_NONROOT_USER} ./deployment/docker/flask/entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

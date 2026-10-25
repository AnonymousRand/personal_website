# SYNC: all filepaths and names
# note: later versions of python may not work due to packages not having pre-compiled wheels
# and hence needing things like g++, but the slim image does not have g++
FROM nikolaik/python-nodejs:python3.12-nodejs26-slim

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER

# as creating directories in `/` needs root perms
USER ${DOCKER_ROOT_USER}

RUN mkdir -p ./personal_website/
RUN chown ${DOCKER_NONROOT_USER} ./personal_website/
WORKDIR ./personal_website/

COPY --chown=${DOCKER_NONROOT_USER} ./app/ ./app/
COPY --chown=${DOCKER_NONROOT_USER} ./migrations/ ./migrations/
COPY --chown=${DOCKER_NONROOT_USER} ./personal_website.py ./config.py ./

################################################################################
# compile scss

USER ${DOCKER_NONROOT_USER}

# needed for nonroot `npm install` to be able to write to its target dir
ENV NPM_CONFIG_CACHE=/tmp/.npm/
RUN npm install sass

RUN npx sass ./app/static/scss/:./app/static/css/ \
    --load-path ./app/static/theme/scss/ \
    --load-path ./app/static/theme/css/ \
    --style=compressed
RUN npx sass ./app/blog/static/blogpage/scss/:./app/blog/static/blogpage/css/ \
    --load-path ./app/static/theme/scss/ \
    --load-path ./app/static/theme/css/ \
    --load-path ./app/static/scss/ \
    --style=compressed

################################################################################
# pip install

# `pip install` generally needs root still; but we compile sass first since that has
# a higher chance of breaking
USER ${DOCKER_ROOT_USER}

COPY ./requirements.txt ./requirements.txt
RUN pip install -r ./requirements.txt

################################################################################
# entrypoint

USER ${DOCKER_NONROOT_USER}

COPY --chown=${DOCKER_NONROOT_USER} ./deployment/docker/flask/entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

# SYNC: all filepaths and names

FROM nikolaik/python-nodejs:python3.10-nodejs23-slim

ARG DOCKER_ROOT_USER
ARG DOCKER_NONROOT_USER
USER ${DOCKER_ROOT_USER}
# note that `pip install` and `npm run` both require root

RUN mkdir personal_website/
RUN chown -R ${DOCKER_NONROOT_USER} personal_website/

WORKDIR /personal_website/

COPY app/ app/
COPY migrations/ migrations/
COPY personal_website.py config.py ./

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

WORKDIR ./app/static/
RUN npm run compile_bootstrap
WORKDIR ../../

COPY deployment/docker/flask/entrypoint.sh ./
RUN chmod a+x entrypoint.sh

USER ${DOCKER_NONROOT_USER}
ENTRYPOINT ["./entrypoint.sh"]

FROM node:lts-alpine3.22

ARG FIREBIRDAPI_VERSION=v1.0.3
ARG FIREBIRDAPI_USER=SYSDBA
ARG FIREBIRDAPI_PASSWORD=masterkey
ARG FIREBIRDAPI_READONLY=true
ARG PORT=3000
ARG NODE_FIREBIRD_ENCODING=LATIN1

RUN mkdir /app
WORKDIR /app
RUN git clone -c advice.detachedHead=false --depth 1 -b $FIREBIRDAPI_VERSION https://github.com/ACP-Sistemas/firebird-api
WORKDIR /app/firebird-api/
RUN npm install
CMD ["npm", "start"]

FROM node:lts-alpine3.22

ARG FIREBIRDAPI_VERSION=v1.0.2
ARG FIREBIRDAPI_SECRET
ARG FIREBIRDAPI_USER=SYSDBA
ARG FIREBIRDAPI_PASSWORD=masterkey
ARG FIREBIRDAPI_ENCODING=win1252
ARG FIREBIRDAPI_READONLY=true
ARG FIREBIRDAPI_CORS_ALLOW_SERVER_TO_SERVER_ACCESS=true
ARG FIREBIRDAPI_CORS_WHITELIST=["*"]
ARG PORT=3000
ARG NODE_FIREBIRD_ENCODING=LATIN1
ARG FIREBIRD_DB_PATH
ARG FIREBIRD_DB_HOST=127.0.0.1
ARG FIREBIRD_DB_PORT=3050
ARG FIREBIRD_DB_PAGESIZE=4096
ARG FIREBIRD_DB_ENCODING=NONE
ENV APP_DIR=/app/firebird-api

RUN mkdir /app
WORKDIR /app
RUN git clone -c advice.detachedHead=false --depth 1 -b $FIREBIRDAPI_VERSION https://github.com/ACP-Sistemas/firebird-api
WORKDIR "$APP_DIR"
RUN npm install
RUN printf '%s\n' \
'{' \
'  "connection": {' \
"    \"database\": \"$FIREBIRD_DB_PATH\"," \
"    \"host\": \"$FIREBIRD_DB_HOST\"," \
"    \"port\": \"$FIREBIRD_DB_PORT\"," \
"    \"pageSize\": $FIREBIRD_DB_PAGESIZE," \
"    \"encoding\": \"$FIREBIRD_DB_ENCODING\"," \
"    \"blobAsText\": false" \
"  }," \
"  \"textEncoding\": \"$FIREBIRDAPI_ENCODING\"," \ 
"  \"secret": \"$FIREBIRDAPI_SECRET\"," \
'  "cors": {' \
"    \"allowServerToServerAccess\": \"$FIREBIRDAPI_CORS_ALLOW_SERVER_TO_SERVER_ACCESS\"," \
"    \"whitelist\": $FIREBIRDAPI_CORS_WHITELIST" \
'   }' \
'}' \
 > "$APP_DIR/src/config.json"
CMD ["npm", "start"]

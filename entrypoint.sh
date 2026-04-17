#!/bin/sh
set -e

if [ -n "$container" ]; then
    CMD="$0 $@"
else
    CMD="$@"
fi


if [ -z "$FIREBIRD_DB_PATH" ]; then
    echo "ERRO: Firebird DB path environment variable not declared!"
    exit 1
fi

if [ -z "$FIREBIRDAPI_SECRET" ]; then
    echo "ERRO: Firebird API secret environment variable not declared!"
    exit 1
fi

cat > "$FIREBIRDAPI_PATH/src/config.json" <<EOF
{
  "connection": {
    "database": "$FIREBIRD_DB_PATH",
    "host": "$FIREBIRD_DB_HOST",
    "port": "$FIREBIRD_DB_PORT",
    "pageSize": $FIREBIRD_DB_PAGESIZE,
    "encoding": "$FIREBIRD_DB_ENCODING",
    "blobAsText": false
  },
  "textEncoding": "$FIREBIRDAPI_ENCODING",
  "secret": "$FIREBIRDAPI_SECRET",
  "cors": {
    "allowServerToServerAccess": $FIREBIRDAPI_CORS_ALLOW_SERVER_TO_SERVER_ACCESS,
    "whitelist": $FIREBIRDAPI_CORS_WHITELIST
  }
}
EOF

exec $CMD
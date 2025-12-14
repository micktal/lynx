#!/usr/bin/env bash
# Usage: ./scripts/test-upload.sh <FUNCTION_URL> <FILE_PATH> <ENTITY_TYPE> <ENTITY_ID>
# Example: ./scripts/test-upload.sh http://localhost:8888/.netlify/functions/attachments ./tests/sample.jpg site 123

set -euo pipefail

if [ $# -lt 4 ]; then
  echo "Usage: $0 <FUNCTION_URL> <FILE_PATH> <ENTITY_TYPE> <ENTITY_ID>"
  exit 1
fi

URL="$1"
FILE="$2"
ENTITY_TYPE="$3"
ENTITY_ID="$4"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

curl -v -X POST "$URL" \
  -F "file=@${FILE}" \
  -F "entity_type=${ENTITY_TYPE}" \
  -F "entity_id=${ENTITY_ID}" \
  -H "Accept: application/json"

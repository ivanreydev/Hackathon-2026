#!/usr/bin/env bash
# Builds the frontend and deploys the app to Databricks Apps.
# Usage: APP_NAME=my-app WORKSPACE_PATH=/Workspace/Users/me@example.com/my-app ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

: "${APP_NAME:?Set APP_NAME}"
: "${WORKSPACE_PATH:?Set WORKSPACE_PATH}"

./client/build.sh

# Databricks Apps installs requirements.txt from the app root.
cp server/requirements.txt requirements.txt

databricks sync . "$WORKSPACE_PATH"
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

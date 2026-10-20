#!/bin/sh
set -eu
common=$(git rev-parse --git-common-dir)
mkdir -p "$common/hooks"
cp .githooks/pre-push "$common/hooks/pre-push"
chmod +x "$common/hooks/pre-push"

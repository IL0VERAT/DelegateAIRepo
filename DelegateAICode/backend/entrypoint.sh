#!/usr/bin/env sh
set -e

# Determine a release name
# Railway injects RAILWAY_GIT_COMMIT_SHA, fallback to git short SHA if not present
RELEASE=${RAILWAY_GIT_COMMIT_SHA:-$(git rev-parse --short HEAD)}

echo "Starting container, release = $RELEASE"

# Only run Sentry steps if all three variables are present
if [[ -n "$SENTRY_ORG" && -n "$SENTRY_PROJECT" && -n "$SENTRY_AUTH_TOKEN" ]]; then
  echo "Running Sentry release steps…"

  echo "  • sentry-cli releases new $RELEASE"
  npx sentry-cli releases new "$RELEASE" \
    --org "$SENTRY_ORG" \
    --project "$SENTRY_PROJECT" || true

  echo "  • sentry-cli releases files $RELEASE upload-sourcemaps dist"
  npx sentry-cli releases files "$RELEASE" upload-sourcemaps dist \
    --org "$SENTRY_ORG" \
    --project "$SENTRY_PROJECT" \
    --auth-token "$SENTRY_AUTH_TOKEN" \
    --rewrite --strip-common-prefix dist

  echo "  • sentry-cli releases finalize $RELEASE"
  npx sentry-cli releases finalize "$RELEASE"
else
  echo "⚠️  Skipping Sentry steps: one or more env vars missing"
  echo "   SENTRY_ORG=$SENTRY_ORG"
  echo "   SENTRY_PROJECT=$SENTRY_PROJECT"
  echo "   SENTRY_AUTH_TOKEN=${#SENTRY_AUTH_TOKEN} chars"
fi

# Hand off to the main command (npm start)
exec "$@"
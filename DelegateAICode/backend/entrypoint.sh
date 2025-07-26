set -e

# Fall back to a git hash if Railway/Git SHA isn’t provided
SENTRY_RELEASE=${RAILWAY_GIT_COMMIT_SHA:-$(git rev-parse --short HEAD)}

# Only run if we have the necessary vars
if [ -n "$SENTRY_ORG" ] && [ -n "$SENTRY_PROJECT" ] && [ -n "$SENTRY_AUTH_TOKEN" ]; then
  npx sentry-cli releases new $SENTRY_RELEASE --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" || true
  npx sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps dist \
      --org "$SENTRY_ORG" \
      --project "$SENTRY_PROJECT" \
      --auth-token "$SENTRY_AUTH_TOKEN" \
      --rewrite --strip-common-prefix dist
  npx sentry-cli releases finalize $SENTRY_RELEASE
else
  echo "⚠️ Skipping Sentry release: missing SENTRY_ORG/PROJECT/AUTH_TOKEN"
fi

# Finally start the server
exec "$@"
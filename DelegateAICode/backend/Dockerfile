# Delegate AI Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app/backend

# Copy backend folder contents
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

WORKDIR /app/backend

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript
RUN npm run build

# ensure SENTRY_* env vars are set in Railway’s Env UI
RUN sentry-cli releases new $RAILWAY_GIT_COMMIT_SHA --org $SENTRY_ORG --project $SENTRY_PROJECT || true && sentry-cli releases files $RAILWAY_GIT_COMMIT_SHA upload-sourcemaps dist \   --org $SENTRY_ORG \   --project $SENTRY_PROJECT \   --auth-token $SENTRY_AUTH_TOKEN \   --rewrite --strip-common-prefix dist

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Create logs folder and give ownership to the non-root user
RUN mkdir -p logs \
 && chown -R nodejs:nodejs logs

# Copy build artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./prisma

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
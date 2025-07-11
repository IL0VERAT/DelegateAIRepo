# Delegate AI Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend folder contents
COPY DelegateAICode/backend/package*.json ./backend/
COPY DelegateAICode/backend/tsconfig.json ./backend/
COPY DelegateAICode/backend/prisma ./backend/prisma
COPY DelegateAICode/backend/src ./backend/src

WORKDIR /app/backend

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

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
# Production Deployment Guide - Updated with Subscription Service

This guide covers the complete production deployment of Delegate AI with the new subscription management system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Stripe Integration](#stripe-integration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Security Configuration](#security-configuration)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- **PostgreSQL Database** (v14+)
- **Redis Cache** (v6+)
- **Node.js** (v18+)
- **Stripe Account** (for payments)
- **Email Service** (SendGrid, AWS SES, etc.)
- **File Storage** (AWS S3, Google Cloud Storage)
- **Domain & SSL Certificate**

### Development Tools
- Docker & Docker Compose
- Git
- PM2 (for process management)
- Nginx (reverse proxy)

## Environment Setup

### Backend Environment Variables

Create `/backend/.env` with the following variables:

```env
# Application
NODE_ENV=production 
PORT=3001
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com --> need to figure this out!!

# Database
DATABASE_URL=postgresql://username:password@host:5432/delegate_ai_prod
REDIS_URL=redis://username:password@host:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Email Service (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key (fallback)

# File Storage (AWS S3 example)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=delegate-ai-storage

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `/.env` with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com

# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_HOTJAR_ID=your-hotjar-id

# Environment
VITE_ENVIRONMENT=production
VITE_APP_NAME=Delegate AI
VITE_APP_URL=https://yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_FEATURES=true
VITE_ENABLE_SUBSCRIPTION_FEATURES=true
```




## Stripe Integration

### 1. Create Stripe Products and Prices

```bash
# Create products in Stripe Dashboard or via API
curl https://api.stripe.com/v1/products \
  -u sk_live_...: \
  -d name="Delegate AI Pro" \
  -d description="Professional Model UN simulation plan"

curl https://api.stripe.com/v1/prices \
  -u sk_live_...: \
  -d product=prod_... \
  -d unit_amount=1999 \
  -d currency=usd \
  -d recurring[interval]=month
```

### 2. Configure Webhooks

Set up webhook endpoint in Stripe Dashboard:
- **URL**: `https://api.yourdomain.com/api/subscriptions/webhook`
- **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3. Test Webhook Integration

```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Test webhook locally
stripe listen --forward-to localhost:3001/api/subscriptions/webhook
stripe trigger checkout.session.completed
```

## Backend Deployment

### 1. Using Docker (Recommended)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nodejs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - delegate-ai

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: delegate_ai_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - delegate-ai

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - delegate-ai

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - delegate-ai

volumes:
  postgres_data:
  redis_data:

networks:
  delegate-ai:
    driver: bridge
```

### 2. Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'delegate-ai-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/delegate-ai/err.log',
    out_file: '/var/log/delegate-ai/out.log',
    log_file: '/var/log/delegate-ai/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Frontend Deployment

### 1. Build and Deploy

```bash
# Build for production
npm run build

# Deploy to CDN (AWS CloudFront example)
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```



### 1. Application Monitoring

```javascript
// Add to backend/src/services/monitoring.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Health check endpoint with monitoring
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
    email: await checkEmail(),
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
};

export const healthCheck = async () => {
  const checks: Record<string, { status: string; message?: string }> = {};

  try {
    await checkDatabase();
    checks.database = { status: 'ok' };
  } catch (err) {
    checks.database = { status: 'error', message: (err as Error).message };
  }

  try {
    await checkRedis();
    checks.redis = { status: 'ok' };
  } catch (err) {
    checks.redis = { status: 'error', message: (err as Error).message };
  }

  try {
    await checkStripe();
    checks.stripe = { status: 'ok' };
  } catch (err) {
    checks.stripe = { status: 'error', message: (err as Error).message };
  }

  try {
    await checkEmail();
    checks.email = { status: 'ok' };
  } catch (err) {
    checks.email = { status: 'error', message: (err as Error).message };
  }

  const isHealthy = Object.values(checks).every(c => c.status === 'ok');

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  };
};
```

### 2. Log Management

```bash
# Configure log rotation
sudo cat > /etc/logrotate.d/delegate-ai << 'EOF'
/var/log/delegate-ai/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 3. Metrics Collection

```bash
# Install and configure Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
sudo useradd --no-create-home --shell /bin/false node_exporter

# Create systemd service
sudo cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

## Backup & Recovery

### 1. Automated Backup Script

```bash
#!/bin/bash
# /opt/delegate-ai/full-backup.sh

set -e

BACKUP_DIR="/opt/backups/delegate-ai"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="delegate_ai_full_backup_${DATE}"

mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo "Starting full backup: $BACKUP_NAME"

# Database backup
echo "Backing up database..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_NAME/database.sql"

# Redis backup
echo "Backing up Redis..."
redis-cli --rdb "$BACKUP_DIR/$BACKUP_NAME/redis.rdb"

# File uploads backup (if stored locally)
echo "Backing up files..."
rsync -av /opt/delegate-ai/uploads/ "$BACKUP_DIR/$BACKUP_NAME/uploads/"

# Application logs
echo "Backing up logs..."
cp -r /var/log/delegate-ai/ "$BACKUP_DIR/$BACKUP_NAME/logs/"

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Upload to cloud storage (AWS S3 example)
echo "Uploading to cloud storage..."
aws s3 cp "${BACKUP_NAME}.tar.gz" s3://your-backup-bucket/delegate-ai/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}.tar.gz"
```

### 2. Recovery Procedures

```bash
#!/bin/bash
# /opt/delegate-ai/restore.sh

BACKUP_FILE=$1
RESTORE_DIR="/tmp/delegate-ai-restore"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

echo "Starting restore from: $BACKUP_FILE"

# Extract backup
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Stop services
pm2 stop delegate-ai-api
sudo systemctl stop redis
sudo systemctl stop postgresql

# Restore database
echo "Restoring database..."
psql $DATABASE_URL < "$(find $RESTORE_DIR -name database.sql)"

# Restore Redis
echo "Restoring Redis..."
cp "$RESTORE_DIR/*/redis.rdb" /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb

# Restore files
echo "Restoring files..."
rsync -av "$RESTORE_DIR/*/uploads/" /opt/delegate-ai/uploads/

# Start services
sudo systemctl start postgresql
sudo systemctl start redis
pm2 start delegate-ai-api

# Cleanup
rm -rf "$RESTORE_DIR"

echo "Restore completed successfully"
```

## Troubleshooting

### Common Issues

#### 1. Stripe Webhook Issues
```bash
# Check webhook events
stripe events list --limit 10

# Test webhook endpoint
curl -X POST https://api.yourdomain.com/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

#### 3. Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check Redis info
redis-cli info
```

#### 4. Application Logs
```bash
# PM2 logs
pm2 logs delegate-ai-api

# System logs
journalctl -u delegate-ai-api -f

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for subscription queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_user_billing_period ON usage(user_id, billing_period_start, billing_period_end);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Analyze tables
ANALYZE subscriptions;
ANALYZE usage;
ANALYZE sessions;
```

#### 2. Redis Caching
```javascript
// Implement caching strategy
const cacheKey = `subscription:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const subscription = await getSubscriptionFromDB(userId);
await redis.setex(cacheKey, 300, JSON.stringify(subscription)); // 5 min cache

return subscription;
```

### Health Checks

Create comprehensive health check endpoint:

```javascript
// /api/health/detailed
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": 5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "memory": "45MB"
    },
    "stripe": {
      "status": "healthy",
      "responseTime": 120
    },
    "email": {
      "status": "healthy",
      "responseTime": 95
    }
  },
  "metrics": {
    "activeUsers": 145,
    "totalSubscriptions": 89,
    "errorRate": 0.01
  }
}
```

This comprehensive deployment guide ensures your subscription service is production-ready with proper security, monitoring, and backup procedures in place.
# Delegate AI Backend - Redis Enhanced

A production-ready Node.js + TypeScript backend API with comprehensive Redis session management and caching.

## 🚀 Features

### Core Features
- **RESTful API** with comprehensive endpoints matching frontend requirements
- **Redis Session Management** with device tracking and security
- **Multi-Layer Caching System** for optimal performance
- **JWT Authentication** with token blacklisting and refresh tokens
- **OpenAI Integration** for chat, voice, and AI capabilities
- **WebSocket Support** for real-time features
- **Rate Limiting** with Redis-backed storage
- **Comprehensive Logging** and monitoring

### Redis Integration
- **Session Storage**: Persistent user sessions with device tracking
- **Token Management**: JWT blacklisting and refresh token storage
- **Caching**: API responses, user data, and database queries
- **Rate Limiting**: Redis-backed rate limiting with sliding windows
- **Real-time**: Pub/Sub for WebSocket scaling
- **Performance**: Connection pooling and optimization

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 13+
- Redis 6+
- OpenAI API key

## 🔧 Installation

1. **Clone and setup**:
```bash
cd backend
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**:
```bash
npm run db:generate
npm run db:push
# or for production
npm run db:migrate
```

4. **Redis setup**:
```bash
# Local Redis
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## 🚀 Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Database operations
npm run db:studio     # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 🐳 Docker Deployment

```bash
# Build and run complete stack
docker-compose up -d

# Or build manually
docker build -t delegate-ai-backend .
docker run -p 3001:3001 delegate-ai-backend
```

## 📊 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - User login with session creation
- `POST /register` - User registration
- `POST /refresh` - Refresh JWT tokens
- `POST /logout` - Logout with session cleanup
- `POST /logout-all` - Logout from all devices
- `GET /me` - Get current user with session info
- `GET /sessions` - List user sessions
- `DELETE /sessions/:id` - Delete specific session

### Users (`/api/v1/users`)
- `GET /profile` - Get user profile (cached)
- `PATCH /profile` - Update user profile
- `PATCH /preferences` - Update user preferences
- `GET /usage` - Get usage statistics
- `GET /sessions` - Get user sessions

### Sessions (`/api/v1/sessions`)
- `GET /` - List user sessions (cached)
- `POST /` - Create new session
- `DELETE /:id` - Delete session

### Messages (`/api/v1/sessions/:id/messages`)
- `GET /` - Get session messages (cached)
- `POST /` - Send message and get AI response

### Transcripts (`/api/v1/transcripts`)
- `GET /` - List transcripts (tier-based caching)
- `GET /:id` - Get transcript
- `POST /` - Create transcript from session
- `PATCH /:id` - Update transcript
- `DELETE /:id` - Delete transcript
- `GET /search` - Search transcripts

### Voice (`/api/v1/voice`)
- `POST /process` - Complete voice-to-voice pipeline
- `POST /transcribe` - Audio transcription only
- `POST /synthesize` - Text-to-speech only
- `GET /usage` - Voice usage statistics
- `GET /voices` - Available voices

### Admin (`/api/v1/admin`) - Enterprise Only
- `GET /cache/stats` - Cache statistics
- `POST /cache/clear` - Clear cache patterns
- `GET /sessions/cleanup` - Manual session cleanup

## 🗄️ Redis Architecture

### Session Management
```
session:{sessionId} -> Session data with metadata
user_sessions:{userId} -> Set of session IDs
jwt_blacklist:{jti} -> Blacklisted tokens
refresh_token:{tokenId} -> Refresh token data
```

### Caching System
```
user:{userId} -> Cached user data
api_response:{hash} -> Cached API responses
openai:{hash} -> Cached OpenAI responses
db_query:{hash} -> Cached database queries
rate_limit:{identifier} -> Rate limiting counters
```

### Real-time Features
```
WebSocket events -> Redis pub/sub channels
Connection tracking -> Active connection sets
Message broadcasting -> Channel-based distribution
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with secure signing
- Refresh token rotation
- Token blacklisting on logout
- Device tracking and fingerprinting
- Session expiration and cleanup
- Tier-based access control

### Rate Limiting
- Global rate limits for all users
- User-specific rate limits
- Endpoint-specific limits
- Redis-backed sliding window
- Graceful degradation

### Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Content Security Policy
- SQL injection prevention

## 📈 Performance Optimizations

### Caching Strategy
- **L1 Cache**: In-memory application cache
- **L2 Cache**: Redis distributed cache
- **L3 Cache**: Database query optimization

### Session Optimization
- Connection pooling
- Pipeline operations
- Lazy loading
- Background cleanup
- Memory-efficient storage

### Database Optimization
- Query optimization
- Index usage
- Connection pooling
- Prepared statements
- Result caching

## 🔧 Configuration

### Environment Variables
See `.env.example` for complete configuration options:

```bash
# Core Configuration
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OpenAI Integration
OPENAI_API_KEY=sk-your-key
OPENAI_CHAT_MODEL=gpt-4-turbo-preview

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Caching
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=3600
CACHE_TTL_LONG=86400
```

## 📊 Monitoring & Logging

### Health Checks
- `/health` - Basic health status
- `/api/v1/health/detailed` - Comprehensive health info
- Service-specific health checks
- Redis connection monitoring
- Database connectivity checks

### Logging
- Structured JSON logging
- Log levels (error, warn, info, debug)
- Request/response logging
- Performance metrics
- Error tracking

### Metrics
- Cache hit/miss rates
- Session statistics
- API response times
- Error rates
- Resource usage

## 🚀 Production Deployment

### Infrastructure Requirements
- **Server**: 2+ CPU cores, 4GB+ RAM
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis with persistence enabled
- **Load Balancer**: Nginx or cloud load balancer
- **SSL**: HTTPS certificates required

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis instance configured
- [ ] SSL certificates installed
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Load testing completed

### Scaling Considerations
- Horizontal scaling with Redis Cluster
- Database read replicas
- CDN for static assets
- WebSocket scaling with Redis adapter
- Container orchestration (Kubernetes)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="auth"

# Load testing
npm run test:load
```

## 📝 API Documentation

Interactive API documentation available at:
- Development: `http://localhost:3001/docs`
- Production: Configure based on deployment

## 🤝 Contributing

1. Follow TypeScript and ESLint configurations
2. Write tests for new features
3. Update documentation
4. Follow commit message conventions
5. Ensure Redis integration for new features

## 📄 License

MIT License - see LICENSE file for details.

---

**Delegate AI Backend** - Production-ready API with Redis session management and comprehensive caching for optimal performance and scalability.
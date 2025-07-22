/**
 * API TYPES AND INTERFACES
 * ========================
 * 
 * Centralized type definitions for API interactions
 */

// ============================================================================
// COMMON API TYPES
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface UploadProgressCallback {
  (progress: number): void;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'DEMO';
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

interface Subscription {
  id: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE' | 'LIFETIME';
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  limits?: SubscriptionLimits;
  invoices?: Invoice[];
}

interface SubscriptionLimits {
  monthlyVoiceMinutes: number;
  monthlyCampaigns: number;
  monthlyAIInteractions: number;
  monthlyExports: number;
  maxConcurrentSessions: number;
  maxStorageGB: number;
  maxTeamMembers: number;
  usedVoiceMinutes: number;
  usedCampaigns: number;
  usedAIInteractions: number;
  usedExports: number;
  usageResetDate: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'OPEN' | 'DRAFT' | 'UNCOLLECTIBLE' | 'VOID';
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  paymentFailedAt?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  createdAt: string;
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  playerCount: number;
  aiDelegates: number;
  theme: string;
  context: string;
  objectives: string[];
  scenarios: string[];
  keyIssues: string[];
  icon: string;
  color: string;
  bgGradient: string;
  featured: boolean;
  new: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CampaignSession {
  id: string;
  campaignId: string;
  userId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'ERROR';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  voiceMinutes: number;
  aiInteractions: number;
  transcript?: any;
  recordings?: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'ai' | 'system';
  content: string;
  type: 'text' | 'audio' | 'system' | 'action';
  metadata?: any;
  timestamp: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
  timestamp?: string;
  metadata?: any;
  model?: string; 
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;      // ISO timestamp
  createdAt: string;
  messageCount?: number;
  lastMessage?: string;   // for preview
}

// ============================================================================
// VOICE TYPES
// ============================================================================

interface VoiceSettings {
  enabled: boolean;
  autoplay: boolean;
  speechRate: number;
  volume: number;
  characterVoices: Record<string, string>;
}

interface VoiceResponse {
  audioUrl: string;
  text: string;
  duration: number;
  voiceId: string;
}

interface Transcript {
  id: string;
  title: string;
  type: 'voice'|'chat';          // or 'chat' if you ever mix them
  updatedAt: string;
  createdAt: string;
  messageCount?: number;
  status?: string;        // e.g. 'processing' | 'completed'
  messages: Message[];
}

// ============================================================================
// ERROR CODES
// ============================================================================

enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  PARSE_ERROR = 'PARSE_ERROR'
}

// ============================================================================
// USAGE TRACKING TYPES
// ============================================================================

interface UsageRecord {
  type: 'VOICE_MINUTES' | 'CAMPAIGN_SESSION' | 'AI_INTERACTION' | 'EXPORT';
  amount: number;
  metadata?: any;
  timestamp: string;
}

interface UsageLimit {
  allowed: boolean;
  remaining?: number;
  limit?: number;
  resetDate?: string;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalSubscriptions: number;
  revenue: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, ServiceHealth>;
  uptime: number;
  version: string;
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  details?: any;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Core API types
  ApiResponse,
  PaginatedResponse,
  ApiError,
  RequestOptions,
  UploadProgressCallback,
  
  // Auth types
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  
  // Subscription types
  Subscription,
  SubscriptionLimits,
  Invoice,
  
  // Campaign types
  Campaign,
  CampaignSession,
  
  // Message types
  Message,
  ChatMessage,
  ChatSession,
  
  // Voice types
  VoiceSettings,
  VoiceResponse,
  Transcript,
  
  // Usage types
  UsageRecord,
  UsageLimit,
  
  // Admin types
  AdminStats,
  SystemHealth,
  ServiceHealth
};
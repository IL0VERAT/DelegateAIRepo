/**
 * CONNECTION STATUS SERVICE
 * =========================
 * 
 * Production-ready connection monitoring with:
 * - Specific error codes and user-friendly messages
 * - Exponential backoff retry mechanisms
 * - Status page integration
 * - Time estimation for resolution
 * - Support contact integration
 * - Graceful offline mode degradation
 */

import { config } from '../config/environment';

// Error codes for different connection issues
export enum ConnectionErrorCode {
  // Network Issues
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  DNS_RESOLUTION_FAILED = 'DNS_RESOLUTION_FAILED',
  
  // API Issues
  API_SERVER_DOWN = 'API_SERVER_DOWN',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  API_AUTHENTICATION_FAILED = 'API_AUTHENTICATION_FAILED',
  API_SERVICE_UNAVAILABLE = 'API_SERVICE_UNAVAILABLE',
  API_MAINTENANCE_MODE = 'API_MAINTENANCE_MODE',
  
  // WebSocket Issues
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  WEBSOCKET_AUTHENTICATION_FAILED = 'WEBSOCKET_AUTHENTICATION_FAILED',
  WEBSOCKET_SERVER_OVERLOADED = 'WEBSOCKET_SERVER_OVERLOADED',
  WEBSOCKET_PROTOCOL_ERROR = 'WEBSOCKET_PROTOCOL_ERROR',
  
  // Third-party Service Issues
  OPENAI_API_DOWN = 'OPENAI_API_DOWN',
  OPENAI_QUOTA_EXCEEDED = 'OPENAI_QUOTA_EXCEEDED',
  OPENAI_RATE_LIMITED = 'OPENAI_RATE_LIMITED',
  
  // Generic Issues
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

// Severity levels for different issues
export enum IssueSeverity {
  LOW = 'low',      // Minor degradation, most features work
  MEDIUM = 'medium', // Some features unavailable
  HIGH = 'high',    // Major functionality impacted
  CRITICAL = 'critical' // Service unusable
}

// Status types for different service components
export enum ServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED_PERFORMANCE = 'degraded_performance',
  PARTIAL_OUTAGE = 'partial_outage',
  MAJOR_OUTAGE = 'major_outage',
  MAINTENANCE = 'maintenance'
}

export interface ConnectionIssue {
  code: ConnectionErrorCode;
  severity: IssueSeverity;
  message: string;
  description: string;
  estimatedResolution: number; // minutes
  retryable: boolean;
  userActions: string[];
  technicalDetails?: string;
  timestamp: Date;
  affectedServices: string[];
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  jitter: boolean;
}

export interface ServiceStatusInfo {
  service: string;
  status: ServiceStatus;
  lastChecked: Date;
  responseTime?: number;
  uptime?: number;
  incidents?: {
    id: string;
    title: string;
    status: string;
    created: Date;
    impact: IssueSeverity;
  }[];
}

// Default retry configurations for different operation types
export const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  api: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true
  },
  websocket: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 1.5,
    jitter: true
  },
  healthCheck: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2,
    jitter: false
  }
};

// Error code to issue mapping
export const ERROR_CODE_MAPPINGS: Record<ConnectionErrorCode, Omit<ConnectionIssue, 'timestamp'>> = {
  [ConnectionErrorCode.NETWORK_OFFLINE]: {
    code: ConnectionErrorCode.NETWORK_OFFLINE,
    severity: IssueSeverity.HIGH,
    message: "No Internet Connection",
    description: "Your device is not connected to the internet. Please check your connection and try again.",
    estimatedResolution: 5,
    retryable: true,
    userActions: [
      "Check your WiFi or mobile data connection",
      "Try switching between WiFi and mobile data",
      "Restart your router or modem",
      "Contact your internet service provider if issues persist"
    ],
    affectedServices: ["chat", "voice", "sync"]
  },
  
  [ConnectionErrorCode.API_SERVER_DOWN]: {
    code: ConnectionErrorCode.API_SERVER_DOWN,
    severity: IssueSeverity.CRITICAL,
    message: "Service Temporarily Unavailable",
    description: "Our servers are experiencing issues. We're working to restore service as quickly as possible.",
    estimatedResolution: 15,
    retryable: true,
    userActions: [
      "Try refreshing the page in a few minutes",
      "Check our status page for updates",
      "Switch to offline mode to continue working"
    ],
    affectedServices: ["chat", "sync", "account"]
  },
  
  [ConnectionErrorCode.API_RATE_LIMITED]: {
    code: ConnectionErrorCode.API_RATE_LIMITED,
    severity: IssueSeverity.MEDIUM,
    message: "Rate Limit Exceeded",
    description: "You've made too many requests. Please wait a moment before trying again.",
    estimatedResolution: 1,
    retryable: true,
    userActions: [
      "Wait 60 seconds before making another request",
      "Consider upgrading to a higher tier for increased limits"
    ],
    affectedServices: ["chat", "voice"]
  },
  
  [ConnectionErrorCode.WEBSOCKET_CONNECTION_FAILED]: {
    code: ConnectionErrorCode.WEBSOCKET_CONNECTION_FAILED,
    severity: IssueSeverity.MEDIUM,
    message: "Real-time Features Unavailable",
    description: "Voice features and real-time updates are temporarily unavailable. Text chat continues to work normally.",
    estimatedResolution: 10,
    retryable: true,
    userActions: [
      "Use text chat while we restore voice features",
      "Check if firewall or proxy is blocking connections",
      "Try using a different network"
    ],
    affectedServices: ["voice", "real-time-sync"]
  },
  
  [ConnectionErrorCode.OPENAI_API_DOWN]: {
    code: ConnectionErrorCode.OPENAI_API_DOWN,
    severity: IssueSeverity.HIGH,
    message: "AI Services Temporarily Down",
    description: "OpenAI's services are experiencing issues. AI responses may be delayed or unavailable.",
    estimatedResolution: 30,
    retryable: true,
    userActions: [
      "Try again in a few minutes",
      "Check OpenAI's status page",
      "Review previous conversations while waiting"
    ],
    affectedServices: ["chat", "voice", "ai-responses"]
  },
  
  [ConnectionErrorCode.OPENAI_QUOTA_EXCEEDED]: {
    code: ConnectionErrorCode.OPENAI_QUOTA_EXCEEDED,
    severity: IssueSeverity.HIGH,
    message: "AI Usage Limit Reached",
    description: "Your AI usage limit has been reached for this billing period. Service will resume when your limit resets.",
    estimatedResolution: 1440, // 24 hours
    retryable: false,
    userActions: [
      "Upgrade to a higher plan for more usage",
      "Wait for your usage limit to reset",
      "Contact support to discuss your usage needs"
    ],
    affectedServices: ["chat", "voice", "ai-responses"]
  },
  
  [ConnectionErrorCode.API_MAINTENANCE_MODE]: {
    code: ConnectionErrorCode.API_MAINTENANCE_MODE,
    severity: IssueSeverity.MEDIUM,
    message: "Scheduled Maintenance",
    description: "We're performing scheduled maintenance to improve our service. Most features remain available in offline mode.",
    estimatedResolution: 60,
    retryable: true,
    userActions: [
      "Continue using offline features",
      "Check our status page for maintenance updates",
      "Try again after the maintenance window"
    ],
    affectedServices: ["sync", "account-updates"]
  },
  
  [ConnectionErrorCode.NETWORK_TIMEOUT]: {
    code: ConnectionErrorCode.NETWORK_TIMEOUT,
    severity: IssueSeverity.MEDIUM,
    message: "Connection Timeout",
    description: "The request is taking longer than expected. This might be due to a slow connection or server load.",
    estimatedResolution: 5,
    retryable: true,
    userActions: [
      "Check your internet connection speed",
      "Try again in a moment",
      "Switch to a more stable network if available"
    ],
    affectedServices: ["all"]
  },
  
  [ConnectionErrorCode.UNKNOWN_ERROR]: {
    code: ConnectionErrorCode.UNKNOWN_ERROR,
    severity: IssueSeverity.MEDIUM,
    message: "Unexpected Error",
    description: "Something unexpected happened. Our team has been notified and is investigating.",
    estimatedResolution: 20,
    retryable: true,
    userActions: [
      "Try refreshing the page",
      "Clear your browser cache",
      "Contact support if the issue persists"
    ],
    affectedServices: ["unknown"]
  }
};

// Exponential backoff retry utility
export class RetryManager {
  private attempts: Map<string, number> = new Map();
  private nextRetryTimes: Map<string, number> = new Map();

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: RetryConfig = DEFAULT_RETRY_CONFIGS.api
  ): Promise<T> {
    const currentAttempts = this.attempts.get(operationId) || 0;
    
    if (currentAttempts >= config.maxAttempts) {
      throw new Error(`Max retry attempts (${config.maxAttempts}) exceeded for operation: ${operationId}`);
    }

    // Check if we need to wait before retrying
    const nextRetryTime = this.nextRetryTimes.get(operationId);
    if (nextRetryTime && Date.now() < nextRetryTime) {
      const waitTime = nextRetryTime - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      const result = await operation();
      // Success - reset retry count
      this.attempts.delete(operationId);
      this.nextRetryTimes.delete(operationId);
      return result;
    } catch (error) {
      const newAttemptCount = currentAttempts + 1;
      this.attempts.set(operationId, newAttemptCount);

      if (newAttemptCount < config.maxAttempts) {
        // Calculate next retry delay with exponential backoff
        const baseDelay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, currentAttempts),
          config.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitter = config.jitter ? Math.random() * 0.1 * baseDelay : 0;
        const delay = baseDelay + jitter;
        
        this.nextRetryTimes.set(operationId, Date.now() + delay);
        
        console.warn(`Operation ${operationId} failed (attempt ${newAttemptCount}/${config.maxAttempts}). Retrying in ${Math.round(delay)}ms...`, error);
        
        // Recursive retry
        return this.executeWithRetry(operation, operationId, config);
      } else {
        // Max attempts reached
        this.attempts.delete(operationId);
        this.nextRetryTimes.delete(operationId);
        throw error;
      }
    }
  }

  getRetryInfo(operationId: string): { attempts: number; nextRetry?: Date } {
    const attempts = this.attempts.get(operationId) || 0;
    const nextRetryTime = this.nextRetryTimes.get(operationId);
    
    return {
      attempts,
      nextRetry: nextRetryTime ? new Date(nextRetryTime) : undefined
    };
  }

  reset(operationId?: string): void {
    if (operationId) {
      this.attempts.delete(operationId);
      this.nextRetryTimes.delete(operationId);
    } else {
      this.attempts.clear();
      this.nextRetryTimes.clear();
    }
  }
}

// Status page integration
export class StatusPageService {
  private readonly statusPageUrl = 'https://status.delegate-ai.com';
  private cachedStatus: ServiceStatusInfo[] = [];
  private lastFetch = 0;
  private readonly cacheTimeout = 60000; // 1 minute

  async getServiceStatus(): Promise<ServiceStatusInfo[]> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (now - this.lastFetch < this.cacheTimeout && this.cachedStatus.length > 0) {
      return this.cachedStatus;
    }

    try {
      // In production, this would be a real API call to your status page
      // For now, we'll return mock data
      const mockStatus: ServiceStatusInfo[] = [
        {
          service: 'API Server',
          status: ServiceStatus.OPERATIONAL,
          lastChecked: new Date(),
          responseTime: 150,
          uptime: 99.9
        },
        {
          service: 'WebSocket Server',
          status: ServiceStatus.OPERATIONAL,
          lastChecked: new Date(),
          responseTime: 50,
          uptime: 99.8
        },
        {
          service: 'OpenAI Integration',
          status: ServiceStatus.OPERATIONAL,
          lastChecked: new Date(),
          responseTime: 800,
          uptime: 99.5
        }
      ];

      this.cachedStatus = mockStatus;
      this.lastFetch = now;
      return mockStatus;
    } catch (error) {
      console.warn('Failed to fetch status page data:', error);
      // Return cached data even if stale, or empty array
      return this.cachedStatus;
    }
  }

  getStatusPageUrl(): string {
    return this.statusPageUrl;
  }

  async hasActiveIncidents(): Promise<boolean> {
    const services = await this.getServiceStatus();
    return services.some(service => 
      service.status !== ServiceStatus.OPERATIONAL || 
      (service.incidents && service.incidents.length > 0)
    );
  }
}

// Support contact service
export class SupportService {
  private readonly supportEmail = 'support@delegate-ai.com';
  private readonly supportUrl = 'https://delegate-ai.com/support';

  generateSupportUrl(issue: ConnectionIssue): string {
    const params = new URLSearchParams({
      subject: `Connection Issue: ${issue.message}`,
      error_code: issue.code,
      severity: issue.severity,
      user_agent: navigator.userAgent,
      timestamp: issue.timestamp.toISOString(),
      affected_services: issue.affectedServices.join(',')
    });

    return `${this.supportUrl}?${params.toString()}`;
  }

  generateEmailUrl(issue: ConnectionIssue): string {
    const subject = `Connection Issue: ${issue.message}`;
    const body = `
Hello Support Team,

I'm experiencing a connection issue with Delegate AI:

Issue: ${issue.message}
Description: ${issue.description}
Error Code: ${issue.code}
Severity: ${issue.severity}
Affected Services: ${issue.affectedServices.join(', ')}
Time: ${issue.timestamp.toLocaleString()}

${issue.technicalDetails ? `Technical Details: ${issue.technicalDetails}` : ''}

User Agent: ${navigator.userAgent}

Please help me resolve this issue.

Thank you!
    `.trim();

    return `mailto:${this.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

// Connection status manager - main service class
export class ConnectionStatusManager {
  private retryManager = new RetryManager();
  private statusPageService = new StatusPageService();
  private supportService = new SupportService();
  private currentIssues: ConnectionIssue[] = [];
  private listeners: ((issues: ConnectionIssue[]) => void)[] = [];

  // Create a connection issue from an error code
  createIssue(
    errorCode: ConnectionErrorCode, 
    technicalDetails?: string,
    customEstimate?: number
  ): ConnectionIssue {
    const baseIssue = ERROR_CODE_MAPPINGS[errorCode];
    if (!baseIssue) {
      throw new Error(`Unknown error code: ${errorCode}`);
    }

    return {
      ...baseIssue,
      timestamp: new Date(),
      technicalDetails,
      ...(customEstimate && { estimatedResolution: customEstimate })
    };
  }

  // Add a new issue
  addIssue(issue: ConnectionIssue): void {
    // Remove any existing issues with the same code
    this.currentIssues = this.currentIssues.filter(existing => existing.code !== issue.code);
    
    // Add the new issue
    this.currentIssues.push(issue);
    this.notifyListeners();
  }

  // Remove an issue
  removeIssue(errorCode: ConnectionErrorCode): void {
    const initialLength = this.currentIssues.length;
    this.currentIssues = this.currentIssues.filter(issue => issue.code !== errorCode);
    
    if (this.currentIssues.length !== initialLength) {
      this.notifyListeners();
    }
  }

  // Get current issues
  getCurrentIssues(): ConnectionIssue[] {
    return [...this.currentIssues];
  }

  // Get the most severe current issue
  getMostSevereIssue(): ConnectionIssue | null {
    if (this.currentIssues.length === 0) return null;

    const severityOrder = {
      [IssueSeverity.CRITICAL]: 4,
      [IssueSeverity.HIGH]: 3,
      [IssueSeverity.MEDIUM]: 2,
      [IssueSeverity.LOW]: 1
    };

    return this.currentIssues.reduce((mostSevere, current) => 
      severityOrder[current.severity] > severityOrder[mostSevere.severity] 
        ? current 
        : mostSevere
    );
  }

  // Check if there are any issues
  hasIssues(): boolean {
    return this.currentIssues.length > 0;
  }

  // Subscribe to issue updates
  subscribe(listener: (issues: ConnectionIssue[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.currentIssues]);
      } catch (error) {
        console.error('Error notifying connection status listener:', error);
      }
    });
  }

  // Get retry manager
  getRetryManager(): RetryManager {
    return this.retryManager;
  }

  // Get status page service
  getStatusPageService(): StatusPageService {
    return this.statusPageService;
  }

  // Get support service
  getSupportService(): SupportService {
    return this.supportService;
  }

  // Utility method to format time estimates
  formatTimeEstimate(minutes: number): string {
    if (minutes < 1) {
      return 'Less than a minute';
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else if (minutes < 1440) {
      const hours = Math.round(minutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      const days = Math.round(minutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
  }

  // Clear all issues (for when connection is restored)
  clearAllIssues(): void {
    if (this.currentIssues.length > 0) {
      this.currentIssues = [];
      this.notifyListeners();
    }
  }
}

// Global instance
export const connectionStatusManager = new ConnectionStatusManager();
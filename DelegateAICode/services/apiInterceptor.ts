/**
 * API INTERCEPTOR - JWT TOKEN MANAGEMENT
 * =====================================
 * 
 * Automatic JWT token injection and refresh for API calls:
 * - Automatic token injection in headers
 * - Token refresh on 401 responses
 * - Request queuing during refresh
 * - Error handling and retry logic
 * - Request/response logging
 */

import { authService } from './auth';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: RequestConfig;
}

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  retryCount?: number;
}

class ApiInterceptor {
  private static instance: ApiInterceptor;
  private isRefreshing = false;
  private pendingRequests: PendingRequest[] = [];
  private readonly MAX_RETRIES = 2;

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  /**
   * SETUP FETCH INTERCEPTOR
   */
  private setupInterceptors(): void {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override global fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const config = this.buildRequestConfig(input, init);
      return this.executeRequest(config, originalFetch);
    };

    console.log('🔧 API Interceptor: Fetch interceptor configured');
  }

  /**
   * BUILD REQUEST CONFIGURATION
   */
  private buildRequestConfig(input: RequestInfo | URL, init?: RequestInit): RequestConfig {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    return {
      url,
      method: init?.method || 'GET',
      headers: { ...(init?.headers as Record<string, string>) },
      body: init?.body,
      retryCount: 0,
    };
  }

  /**
   * EXECUTE REQUEST WITH TOKEN MANAGEMENT
   */
  private async executeRequest(config: RequestConfig, originalFetch: typeof fetch): Promise<Response> {
    try {
      // Add authentication header if we have a token and this is an API call
      if (this.shouldAddAuthHeader(config.url)) {
        const token = authService.getAuthToken();
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
          };
        }
      }

      // Execute the request
      const response = await originalFetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      // Handle 401 responses (token expired)
      if (response.status === 401 && this.shouldHandleUnauthorized(config.url)) {
        console.log('🔄 API Interceptor: 401 response, attempting token refresh');
        return this.handleUnauthorizedResponse(config, originalFetch);
      }

      // Log successful requests (in development)
      if (process.env.NODE_ENV === 'development' && config.url.includes('/api/')) {
        console.log(`✅ API ${config.method} ${config.url} - ${response.status}`);
      }

      return response;

    } catch (error) {
      console.error(`❌ API ${config.method} ${config.url} - Error:`, error);
      throw error;
    }
  }

  /**
   * HANDLE UNAUTHORIZED RESPONSES
   */
  private async handleUnauthorizedResponse(config: RequestConfig, originalFetch: typeof fetch): Promise<Response> {
    // If we're already refreshing, queue this request
    const refreshed = await authService.refreshTokens();
    if (this.isRefreshing) {
      console.log('⏳ API Interceptor: Queueing request during token refresh');
      return this.queueRequest(config, originalFetch);
    }

    // Attempt token refresh
    this.isRefreshing = true;
    
    try {
      console.log('🔄 API Interceptor: Attempting token refresh');
      const refreshed = await authService.refreshTokens();

      if (refreshed) {
        console.log('✅ API Interceptor: Token refresh successful, retrying requests');
        
        // Retry the original request
        const retryResponse = await this.retryRequest(config, originalFetch);
        
        // Process any queued requests
        this.processQueuedRequests(originalFetch);
        
        return retryResponse;
      } else {
        console.log('❌ API Interceptor: Token refresh failed, clearing auth');
        
        // Token refresh failed, clear authentication
        await authService.logout();
        
        // Reject all queued requests
        this.rejectQueuedRequests(new Error('Authentication expired'));
        
        // Return the original 401 response
        return originalFetch(config.url, {
          method: config.method,
          headers: this.removeAuthHeader(config.headers),
          body: config.body,
        });
      }

    } catch (error) {
      console.error('❌ API Interceptor: Token refresh error:', error);
      
      // Refresh attempt failed
      await authService.logout();
      this.rejectQueuedRequests(error as Error);
      
      throw error;
      
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * QUEUE REQUEST DURING TOKEN REFRESH
   */
  private queueRequest(config: RequestConfig, originalFetch: typeof fetch): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({
        resolve,
        reject,
        config,
      });
    });
  }

  /**
   * RETRY REQUEST WITH NEW TOKEN
   */
  private async retryRequest(config: RequestConfig, originalFetch: typeof fetch): Promise<Response> {
    // Get the new token
    const newToken = authService.getAccessToken();
    
    if (newToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${newToken}`,
      };
    }

    // Increment retry count
    config.retryCount = (config.retryCount || 0) + 1;

    // Execute the retry
    return originalFetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });
  }

  /**
   * PROCESS QUEUED REQUESTS
   */
  private async processQueuedRequests(originalFetch: typeof fetch): void {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    console.log(`🔄 API Interceptor: Processing ${requests.length} queued requests`);

    for (const request of requests) {
      try {
        const response = await this.retryRequest(request.config, originalFetch);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  /**
   * REJECT QUEUED REQUESTS
   */
  private rejectQueuedRequests(error: Error): void {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    console.log(`❌ API Interceptor: Rejecting ${requests.length} queued requests`);

    requests.forEach(request => {
      request.reject(error);
    });
  }

  /**
   * UTILITY METHODS
   */
  
  private shouldAddAuthHeader(url: string): boolean {
    // Add auth header for API calls, exclude auth endpoints
    return url.includes('/api/') && 
           !url.includes('/auth/login') && 
           !url.includes('/auth/register') && 
           !url.includes('/auth/refresh') &&
           !url.includes('/health');
  }

  private shouldHandleUnauthorized(url: string): boolean {
    // Handle 401s for protected API endpoints
    return url.includes('/api/') && 
           !url.includes('/auth/login') && 
           !url.includes('/auth/register');
  }

  private removeAuthHeader(headers?: Record<string, string>): Record<string, string> {
    if (!headers) return {};
    
    const { Authorization, ...rest } = headers;
    return rest;
  }

  /**
   * PUBLIC METHODS
   */
  
  public getQueuedRequestsCount(): number {
    return this.pendingRequests.length;
  }

  public isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  public clearQueue(): void {
    this.rejectQueuedRequests(new Error('Queue cleared'));
  }
}

// Initialize and export singleton
export const apiInterceptor = ApiInterceptor.getInstance();

/**
 * ENHANCED FETCH WRAPPER
 */
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export async function enhancedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, skipRetry = false, ...fetchOptions } = options;

  try {
    // Build headers
    const headers = new Headers(fetchOptions.headers);
    
    // Add auth header if not skipped
    if (!skipAuth && url.includes('/api/')) {
      const token = authService.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add common headers
    if (!headers.has('Content-Type') && fetchOptions.body) {
      headers.set('Content-Type', 'application/json');
    }

    // Execute request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 with retry if not skipped
    if (response.status === 401 && !skipRetry && !skipAuth) {
      console.log('🔄 Enhanced Fetch: 401 response, attempting token refresh');
      
      const refreshed = await authService.refreshTokens();
      if (refreshed) {
        // Retry with new token
        const newToken = authService.getAccessToken();
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
        }
        
        return fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    }

    return response;

  } catch (error) {
    console.error('Enhanced Fetch error:', error);
    throw error;
  }
}

export default apiInterceptor;
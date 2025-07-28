/**
 * SIMPLIFIED API SERVICE
 * =====================
 * 
 * Streamlined API service without complex dependencies
 */

// ============================================================================
// TYPES
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ============================================================================
// API SERVICE
// ============================================================================

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Build headers for requests
   */
  private buildHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API responses
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok) {
          return {
            success: true,
            data: data.data || data,
            message: data.message
          };
        } else {
          return {
            success: false,
            error: data.error || data.message || 'Request failed',
            message: data.message
          };
        }
      } else {
        if (response.ok) {
          const text = await response.text();
          return {
            success: true,
            data: text as any
          };
        } else {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

   async sendMessage(payload: {
    message: string;
    conversationId?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    speechSpeed?: number;
  }): Promise<{
    messageId: string;
    response: string;
    conversationId: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    // adjust endpoint path to match your server’s route
    const res = await this.post<{
      messageId: string;
      response: string;
      conversationId: string;
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }>('/chat/send', payload);

    if (!res.success) {
      throw new Error(res.error || 'Failed to send chat message');
    }
    return res.data!;
  }

  /**
   * Make API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try { 
      const { timeout = 30000, ...fetchOptions } = options;
      
      const url = endpoint.startsWith('https') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.buildHeaders(fetchOptions.headers as Record<string, string>),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      const token = this.getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      return this.handleResponse<T>(response);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
}


// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const apiService = new ApiService();

// Export the request function for backward compatibility
export const api = apiService.request.bind(apiService);

export default apiService;
export type { ApiResponse, RequestOptions };
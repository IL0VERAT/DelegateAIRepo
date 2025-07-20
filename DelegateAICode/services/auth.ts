/**
 * SIMPLIFIED AUTHENTICATION SERVICE
 * =================================
 * 
 * Streamlined auth service without complex dependencies
 */

import { apiService } from './api';
import type { ApiResponse } from './api';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// ============================================================================
// AUTH SERVICE
// ============================================================================

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    try {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      logger.error('Error initializing auth:', error);
      this.clearAuthData();
    }
  }

  async login(email: string, password: string): Promise<boolean> {
     try {
      logger.info('Attempting login for user:', email);

      const apiResponse = await apiService
        .post<AuthResponse>('/auth/login', { email, password })
        .then(res => res as ApiResponse<AuthResponse>);

      if (!apiResponse.success || !apiResponse.data) {
        logger.error('Login failed:', apiResponse.error);
        return false;
      }

      this.setAuthData(apiResponse.data);
      logger.info('Login successful');
      return true;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

  try {
    const ApiResponse = await apiService.post<AuthResponse>(
      '/auth/refresh',
      { refreshToken: this.refreshToken }
    )
    .then(res => res as ApiResponse<AuthResponse>);

    if (ApiResponse.success && ApiResponse.data) {
      this.setAuthData(ApiResponse.data);
      return true;
    }
    logger.warn('Token refresh responded unsuccessfully');
    return false;
  } catch {
    logger.error('Token refresh error:', Error);
    return false;
  }
}

  async register(email: string, password: string, name?: string): Promise<boolean> {
    try {
      logger.info('Attempting registration for user:', email);

      const apiResponse = await apiService
        .post<AuthResponse>('/auth/register', { email, password, name })
        .then(res => res as ApiResponse<AuthResponse>);

      if (!apiResponse.success || !apiResponse.data) {
        logger.error('Registration failed:', apiResponse.error);
        return false;
      }

      this.setAuthData(apiResponse.data);
      logger.info('Registration successful');
      return true;
    } catch (error) {
      logger.error('Registration error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      logger.info('Logging out user');

      if (this.authToken) {
        await apiService.post('/auth/logout').catch(error => {
          logger.warn('Logout endpoint failed:', error);
        });
      }

      this.clearAuthData();
      logger.info('Logout successful');

    } catch (error) {
      logger.error('Logout error:', error);
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser && this.authToken) {
        return this.currentUser;
      }

      if (this.authToken) {
        const apiResponse = await apiService.get('/auth/me');

        if (apiResponse.success && apiResponse.data) {
          const user = apiResponse.data as User; 
          this.currentUser = user;
          this.updateStoredUserData(user);
          return user;
        } else {
          this.clearAuthData();
        }
      }

      return null;

    } catch (error) {
      logger.error('Error getting current user:', error);
      return this.currentUser;
    }
  }

  async updateUser(userData: Partial<User>): Promise<boolean> {
    try {
      logger.info('Updating user data');

      const apiResponse = await apiService.put('/auth/profile', userData);

      if (!apiResponse.success || !apiResponse.data) {
        logger.error('User update failed:', apiResponse.error);
        return false;
      }

      if (this.currentUser) {
        const updatedUser: User = { ...this.currentUser, ...apiResponse.data };
        this.currentUser = updatedUser;
        this.updateStoredUserData(updatedUser); 
      }

      logger.info('User data updated successfully');
      return true;

    } catch (error) {
      logger.error('Error updating user:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.authToken);
  }

  hasRole(role: 'USER' | 'ADMIN' | 'MODERATOR'): boolean {
    return this.currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  private setAuthData(authData: AuthResponse): void {
    this.currentUser = authData.user;
    this.authToken = authData.token;
    this.refreshToken = authData.refreshToken ?? null;

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', this.authToken);
      localStorage.setItem('user_data', JSON.stringify(this.currentUser));
      if (this.refreshToken) {
        localStorage.setItem('refresh_token', this.refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }
    }
  }

  private clearAuthData(): void {
    this.currentUser = null;
    this.authToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('refresh_token');
    }
  }

  private updateStoredUserData(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const authService = new AuthService();
export default authService;
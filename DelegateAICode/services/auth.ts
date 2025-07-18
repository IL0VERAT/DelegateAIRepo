/**
 * SIMPLIFIED AUTHENTICATION SERVICE
 * =================================
 * 
 * Streamlined auth service without complex dependencies
 */

import { apiService } from './api';
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

      const response = await apiService.post('/auth/login', { email, password });

      if (!response.success) {
        logger.error('Login failed:', response.error);
        return false;
      }

      const authData: AuthResponse = response.data;
      this.setAuthData(authData);

      logger.info('Login successful');
      return true;

    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  }

  async register(email: string, password: string, name?: string): Promise<boolean> {
    try {
      logger.info('Attempting registration for user:', email);

      const response = await apiService.post('/auth/register', { email, password, name });

      if (!response.success) {
        logger.error('Registration failed:', response.error);
        return false;
      }

      const authData: AuthResponse = response.data;
      this.setAuthData(authData);

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
        const response = await apiService.get('/auth/me');

        if (response.success) {
          const user = response.data; 
          this.currentUser = user;
          this.updateStoredUserData(user);
          return this.currentUser;
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

      const response = await apiService.put('/auth/profile', userData);

      if (!response.success) {
        logger.error('User update failed:', response.error);
        return false;
      }

      if (this.currentUser) {
        const updatedUser: User = { ...this.currentUser, ...response.data };
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', this.authToken);
      localStorage.setItem('user_data', JSON.stringify(this.currentUser));
    }
  }

  private clearAuthData(): void {
    this.currentUser = null;
    this.authToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
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
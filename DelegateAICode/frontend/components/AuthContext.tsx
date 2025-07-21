/**
 * ENHANCED AUTH CONTEXT WITH SUBSCRIPTION INTEGRATION
 * ==================================================
 * 
 * Updated authentication context to include subscription management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User } from '../services/auth';
import { subscriptionService, type Subscription } from '../services/subscriptionService';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit: (type: 'voice' | 'campaign' | 'ai' | 'export', amount?: number) => Promise<{ allowed: boolean; remaining?: number; limit?: number }>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if user is already authenticated
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        // Load subscription data
        await loadSubscription();
      }

    } catch (error) {
      logger.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const subscriptionData = await subscriptionService.getCurrentSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      logger.error('Error loading subscription:', error);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const success = await authService.login(email, password);
      
      if (success) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Load subscription after login
        await loadSubscription();
        
        logger.info('User logged in successfully');
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const success = await authService.register(email, password, name);
      
      if (success) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Load subscription after registration (should create free tier)
        await loadSubscription();
        
        logger.info('User registered successfully');
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setSubscription(null);
      
      // Clear subscription cache
      subscriptionService.clearCache();
      
      logger.info('User logged out successfully');

    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const success = await authService.updateUser(userData);
      
      if (success && user) {
        setUser({ ...user, ...userData });
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Error updating user:', error);
      return false;
    }
  };

  // ============================================================================
  // SUBSCRIPTION METHODS
  // ============================================================================

  const refreshSubscription = async (): Promise<void> => {
    try {
      if (!user) return;
      
      const subscriptionData = await subscriptionService.getCurrentSubscription();
      setSubscription(subscriptionData);
      
    } catch (error) {
      logger.error('Error refreshing subscription:', error);
    }
  };

  const checkUsageLimit = async (
    type: 'voice' | 'campaign' | 'ai' | 'export',
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining?: number; limit?: number }> => {
    try {
      if (!user) {
        return { allowed: false };
      }

      return await subscriptionService.checkUsageLimit(type, amount);

    } catch (error) {
      logger.error('Error checking usage limit:', error);
      return { allowed: false };
    }
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextType = {
    user,
    subscription,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshSubscription,
    checkUsageLimit
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK FOR USING AUTH CONTEXT
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export types for external use
export type { AuthContextType };
export default AuthContext;
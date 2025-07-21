/**
 * FRONTEND SUBSCRIPTION SERVICE
 * =============================
 * 
 * Client-side subscription management and API integration
 */

import { api } from './api';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SubscriptionTier {
  tier: string;
  monthlyVoiceMinutes: number;
  monthlyCampaigns: number;
  monthlyAIInteractions: number;
  monthlyExports: number;
  maxConcurrentSessions: number;
  maxStorageGB: number;
  maxTeamMembers: number;
  price: number;
  stripePriceId?: string;
}

export interface Subscription {
  id: string;
  tier: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  limits?: SubscriptionLimits;
  invoices?: Invoice[];
}

export interface SubscriptionLimits {
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

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  paymentFailedAt?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  createdAt: string;
}

export interface UsageData {
  subscription: Subscription;
  limits: SubscriptionLimits;
  usage: Record<string, number>;
  billingPeriod: {
    start: string;
    end: string;
  };
}

export interface SubscriptionPlans {
  tiers: SubscriptionTier[];
  features: Record<string, string[]>;
}

// ============================================================================
// SUBSCRIPTION SERVICE CLASS
// ============================================================================

class SubscriptionService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const cacheKey = 'current-subscription';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      logger.info('Fetching current subscription');

      const response = await api('/subscriptions/current', {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subscription');
      }

      this.setCache(cacheKey, response.data);
      return response.data;

    } catch (error) {
      logger.error('Error fetching current subscription:', error);
      return null;
    }
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlans | null> {
    try {
      const cacheKey = 'subscription-plans';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      logger.info('Fetching subscription plans');

      const response = await api('/subscriptions/plans', {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch plans');
      }

      // Cache for longer since plans don't change often
      this.setCache(cacheKey, response.data, 60 * 60 * 1000); // 1 hour
      return response.data;

    } catch (error) {
      logger.error('Error fetching subscription plans:', error);
      return null;
    }
  }

  /**
   * Create checkout session for subscription upgrade
   */
  async createCheckoutSession(tier: string, annual: boolean = false): Promise<{ sessionId: string; url: string } | null> {
    try {
      logger.info('Creating checkout session for tier:', tier);

      const response = await api('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier, annual })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create checkout session');
      }

      // Clear subscription cache since it will change
      this.clearSubscriptionCache();

      return response.data;

    } catch (error) {
      logger.error('Error creating checkout session:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(immediate: boolean = false): Promise<boolean> {
    try {
      logger.info('Canceling subscription', { immediate });

      const response = await api('/subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify({ immediate })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel subscription');
      }

      // Clear cache
      this.clearSubscriptionCache();

      return true;

    } catch (error) {
      logger.error('Error canceling subscription:', error);
      return false;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<boolean> {
    try {
      logger.info('Reactivating subscription');

      const response = await api('/subscriptions/reactivate', {
        method: 'POST'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to reactivate subscription');
      }

      // Clear cache
      this.clearSubscriptionCache();

      return true;

    } catch (error) {
      logger.error('Error reactivating subscription:', error);
      return false;
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      logger.info('Updating payment method');

      const response = await api('/subscriptions/payment-method', {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update payment method');
      }

      // Clear cache
      this.clearSubscriptionCache();

      return true;

    } catch (error) {
      logger.error('Error updating payment method:', error);
      return false;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageData(): Promise<UsageData | null> {
    try {
      const cacheKey = 'usage-data';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      logger.info('Fetching usage data');

      const response = await api('/subscriptions/usage', {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch usage data');
      }

      // Cache for shorter time since usage changes frequently
      this.setCache(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes
      return response.data;

    } catch (error) {
      logger.error('Error fetching usage data:', error);
      return null;
    }
  }

  /**
   * Check if user can perform action based on limits
   */
  async checkUsageLimit(
    usageType: 'voice' | 'campaign' | 'ai' | 'export',
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
    try {
      const usageData = await this.getUsageData();
      if (!usageData?.limits) {
        return { allowed: false };
      }

      const { limits } = usageData;
      let used: number;
      let limit: number;

      switch (usageType) {
        case 'voice':
          used = limits.usedVoiceMinutes;
          limit = limits.monthlyVoiceMinutes;
          break;
        case 'campaign':
          used = limits.usedCampaigns;
          limit = limits.monthlyCampaigns;
          break;
        case 'ai':
          used = limits.usedAIInteractions;
          limit = limits.monthlyAIInteractions;
          break;
        case 'export':
          used = limits.usedExports;
          limit = limits.monthlyExports;
          break;
        default:
          return { allowed: false };
      }

      const remaining = limit - used;
      const allowed = remaining >= amount;

      return {
        allowed,
        remaining,
        limit
      };

    } catch (error) {
      logger.error('Error checking usage limit:', error);
      return { allowed: false };
    }
  }

  /**
   * Get subscription status display
   */
  getSubscriptionStatusDisplay(subscription: Subscription): {
    status: string;
    color: string;
    description: string;
  } {
    switch (subscription.status) {
      case 'ACTIVE':
        if (subscription.cancelAtPeriodEnd) {
          return {
            status: 'Canceling',
            color: 'text-orange-600',
            description: `Will cancel on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
          };
        }
        return {
          status: 'Active',
          color: 'text-green-600',
          description: `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
        };
      case 'TRIALING':
        return {
          status: 'Trial',
          color: 'text-blue-600',
          description: `Trial ends on ${new Date(subscription.trialEnd!).toLocaleDateString()}`
        };
      case 'PAST_DUE':
        return {
          status: 'Past Due',
          color: 'text-red-600',
          description: 'Payment required to continue service'
        };
      case 'CANCELED':
        return {
          status: 'Canceled',
          color: 'text-gray-600',
          description: 'Subscription has been canceled'
        };
      case 'UNPAID':
        return {
          status: 'Unpaid',
          color: 'text-red-600',
          description: 'Payment failed - please update payment method'
        };
      default:
        return {
          status: 'Unknown',
          color: 'text-gray-600',
          description: 'Contact support for assistance'
        };
    }
  }

  /**
   * Calculate usage percentage
   */
  calculateUsagePercentage(used: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  /**
   * Get tier display information
   */
  getTierDisplay(tier: string): { name: string; color: string; icon: string } {
    switch (tier) {
      case 'FREE':
        return {
          name: 'Free',
          color: 'text-gray-600',
          icon: '🆓'
        };
      case 'PRO':
        return {
          name: 'Pro',
          color: 'text-blue-600',
          icon: '⭐'
        };
      case 'ENTERPRISE':
        return {
          name: 'Enterprise',
          color: 'text-purple-600',
          icon: '🚀'
        };
      case 'LIFETIME':
        return {
          name: 'Lifetime',
          color: 'text-gold-600',
          icon: '👑'
        };
      default:
        return {
          name: 'Unknown',
          color: 'text-gray-600',
          icon: '❓'
        };
    }
  }

  /**
   * Format price for display
   */
  formatPrice(cents: number, currency: string = 'USD'): string {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Check if subscription is in trial
   */
  isInTrial(subscription: Subscription): boolean {
    if (!subscription.trialEnd) return false;
    return new Date(subscription.trialEnd) > new Date();
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trialEnd) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && expiry > Date.now()) {
      return this.cache.get(key);
    }
    // Clean up expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, value: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  private clearSubscriptionCache(): void {
    const keys = ['current-subscription', 'usage-data'];
    keys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
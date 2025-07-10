/**
 * SUBSCRIPTION SERVICE - BUSINESS LOGIC
 * ====================================
 * 
 * Core subscription management and usage tracking service
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class SubscriptionService {
  /**
   * Check if user can perform action based on subscription limits
   */
  static async checkUsageLimit(
    userId: string, 
    usageType: 'VOICE_MINUTES' | 'CAMPAIGN_SESSION' | 'AI_INTERACTION' | 'EXPORT',
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        include: { limits: true }
      });

      if (!subscription || !subscription.limits) {
        return { allowed: false };
      }

      const limits = subscription.limits;
      let used: number;
      let limit: number;

      switch (usageType) {
        case 'VOICE_MINUTES':
          used = limits.usedVoiceMinutes;
          limit = limits.monthlyVoiceMinutes;
          break;
        case 'CAMPAIGN_SESSION':
          used = limits.usedCampaigns;
          limit = limits.monthlyCampaigns;
          break;
        case 'AI_INTERACTION':
          used = limits.usedAIInteractions;
          limit = limits.monthlyAIInteractions;
          break;
        case 'EXPORT':
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
   * Record usage for billing and limit tracking
   */
  static async recordUsage(
    userId: string,
    usageType: 'VOICE_MINUTES' | 'CAMPAIGN_SESSION' | 'AI_INTERACTION' | 'EXPORT' | 'STORAGE' | 'API_CALL',
    amount: number,
    metadata?: any
  ): Promise<void> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        include: { limits: true }
      });

      if (!subscription) {
        logger.warn('No subscription found for user:', userId);
        return;
      }

      // Get billing period
      const billingPeriodStart = subscription.currentPeriodStart;
      const billingPeriodEnd = subscription.currentPeriodEnd;

      // Record usage in database
      await prisma.usage.create({
        data: {
          userId,
          type: usageType,
          amount,
          unit: this.getUnitForUsageType(usageType),
          metadata,
          billingPeriodStart,
          billingPeriodEnd
        }
      });

      // Update subscription limits
      if (subscription.limits) {
        const updateData: any = {};

        switch (usageType) {
          case 'VOICE_MINUTES':
            updateData.usedVoiceMinutes = { increment: amount };
            break;
          case 'CAMPAIGN_SESSION':
            updateData.usedCampaigns = { increment: amount };
            break;
          case 'AI_INTERACTION':
            updateData.usedAIInteractions = { increment: amount };
            break;
          case 'EXPORT':
            updateData.usedExports = { increment: amount };
            break;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.subscriptionLimits.update({
            where: { subscriptionId: subscription.id },
            data: updateData
          });
        }
      }

      logger.info('Usage recorded:', { userId, usageType, amount });

    } catch (error) {
      logger.error('Error recording usage:', error);
    }
  }

  /**
   * Reset monthly usage counters
   */
  static async resetMonthlyUsage(subscriptionId: string): Promise<void> {
    try {
      await prisma.subscriptionLimits.update({
        where: { subscriptionId },
        data: {
          usedVoiceMinutes: 0,
          usedCampaigns: 0,
          usedAIInteractions: 0,
          usedExports: 0,
          usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      });

      logger.info('Monthly usage reset for subscription:', subscriptionId);
    } catch (error) {
      logger.error('Error resetting monthly usage:', error);
    }
  }

  /**
   * Get subscription status and features
   */
  static async getSubscriptionFeatures(userId: string): Promise<{
    tier: string;
    features: string[];
    limits: any;
    trialDaysRemaining?: number;
  }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        include: { limits: true }
      });

      if (!subscription) {
        return {
          tier: 'FREE',
          features: [],
          limits: null
        };
      }

      const features = this.getFeaturesForTier(subscription.tier);
      
      let trialDaysRemaining: number | undefined;
      if (subscription.trialEnd) {
        const now = new Date();
        const trialEnd = new Date(subscription.trialEnd);
        const diffTime = trialEnd.getTime() - now.getTime();
        trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        tier: subscription.tier,
        features,
        limits: subscription.limits,
        trialDaysRemaining
      };

    } catch (error) {
      logger.error('Error getting subscription features:', error);
      return {
        tier: 'FREE',
        features: [],
        limits: null
      };
    }
  }

  /**
   * Check if subscription is active and in good standing
   */
  static async isSubscriptionActive(userId: string): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId }
      });

      if (!subscription) return false;

      return ['ACTIVE', 'TRIALING'].includes(subscription.status);

    } catch (error) {
      logger.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get usage analytics for user
   */
  static async getUsageAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usage = await prisma.usage.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by day and type
      const analytics = usage.reduce((acc, record) => {
        const day = record.createdAt.toISOString().split('T')[0];
        if (!acc[day]) acc[day] = {};
        if (!acc[day][record.type]) acc[day][record.type] = 0;
        acc[day][record.type] += record.amount;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      return analytics;

    } catch (error) {
      logger.error('Error getting usage analytics:', error);
      return {};
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static getUnitForUsageType(usageType: string): string {
    switch (usageType) {
      case 'VOICE_MINUTES':
        return 'minutes';
      case 'STORAGE':
        return 'bytes';
      case 'CAMPAIGN_SESSION':
      case 'AI_INTERACTION':
      case 'EXPORT':
      case 'API_CALL':
        return 'count';
      default:
        return 'count';
    }
  }

  private static getFeaturesForTier(tier: string): string[] {
    switch (tier) {
      case 'FREE':
        return [
          '60 minutes of voice interaction per month',
          '5 campaign sessions per month',
          '100 AI interactions per month',
          '3 exports per month',
          '1 concurrent session',
          '1GB storage',
          'Community support'
        ];
      case 'PRO':
        return [
          '300 minutes of voice interaction per month',
          '50 campaign sessions per month',
          '1,000 AI interactions per month',
          '25 exports per month',
          '3 concurrent sessions',
          '10GB storage',
          'Priority support',
          'Advanced analytics',
          'Custom voice training'
        ];
      case 'ENTERPRISE':
        return [
          '1,000 minutes of voice interaction per month',
          '200 campaign sessions per month',
          '5,000 AI interactions per month',
          '100 exports per month',
          '10 concurrent sessions',
          '100GB storage',
          'Dedicated support',
          'Advanced analytics',
          'Custom voice training',
          'Team management',
          'SSO integration',
          'Custom integrations'
        ];
      default:
        return [];
    }
  }
}

export default SubscriptionService;
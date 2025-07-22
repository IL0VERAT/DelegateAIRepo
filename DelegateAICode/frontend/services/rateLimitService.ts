/**
 * RATE LIMITING SERVICE - GENTLE USER LIMITS
 * ==========================================
 * 
 * Implements gentle rate limiting for user word usage:
 * - 3,000 words per day limit for non-admin users
 * - Excludes admin users from all rate limiting
 * - Gentle notifications at 80%, 90%, and 100% usage
 * - Daily reset at midnight local time
 * - Graceful degradation and error handling
 * - Local storage persistence with fallback
 */

import { toast } from 'sonner';

// Rate limiting constants
const DAILY_WORD_LIMIT = 3000;
const WARNING_THRESHOLDS = {
  EARLY_WARNING: 0.8,  // 80% - 2,400 words
  FINAL_WARNING: 0.9,  // 90% - 2,700 words
  LIMIT_REACHED: 1.0   // 100% - 3,000 words
};

// Storage keys
const STORAGE_KEYS = {
  WORD_COUNT: 'delegate-ai-daily-word-count',
  LAST_RESET: 'delegate-ai-last-reset-date',
  WARNING_SHOWN: 'delegate-ai-warning-shown'
} as const;

// Word usage tracking interface
export interface WordUsageData {
  totalWords: number;
  lastResetDate: string;
  lastUpdateTime: number;
  warningLevel: 'none' | 'early' | 'final' | 'exceeded';
  isLimitExceeded: boolean;
}

// Rate limit check result
export interface RateLimitResult {
  allowed: boolean;
  remainingWords: number;
  usedWords: number;
  percentageUsed: number;
  warningLevel: 'none' | 'early' | 'final' | 'exceeded';
  message?: string;
}

class RateLimitService {
  private currentUsage: WordUsageData = {
    totalWords: 0,
    lastResetDate: this.getTodayDateString(),
    lastUpdateTime: Date.now(),
    warningLevel: 'none',
    isLimitExceeded: false
  };

  private warningsShown: Set<string> = new Set();

  constructor() {
    this.loadUsageData();
    this.checkDailyReset();
  }

  /**
   * Count words in a text string with improved accuracy
   */
  private countWords(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    // Clean the text and split into words
    const words = text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s'-]/g, ' ') // Replace punctuation with spaces
      .split(' ')
      .filter(word => word.length > 0);

    return words.length;
  }

  /**
   * Get today's date as a string for comparison
   */
  private getTodayDateString(): string {
    return new Date().toDateString();
  }

  /**
   * Check if we need to reset daily counters
   */
  private checkDailyReset(): void {
    const today = this.getTodayDateString();
    
    if (this.currentUsage.lastResetDate !== today) {
      console.log('🔄 Daily rate limit reset triggered');
      this.resetDailyCounters();
    }
  }

  /**
   * Reset daily counters at midnight
   */
  private resetDailyCounters(): void {
    const today = this.getTodayDateString();
    
    this.currentUsage = {
      totalWords: 0,
      lastResetDate: today,
      lastUpdateTime: Date.now(),
      warningLevel: 'none',
      isLimitExceeded: false
    };

    this.warningsShown.clear();
    this.saveUsageData();

    console.log('✅ Daily word count reset to 0');
  }

  /**
   * Load usage data from localStorage
   */
  private loadUsageData(): void {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.WORD_COUNT);
      const storedWarnings = localStorage.getItem(STORAGE_KEYS.WARNING_SHOWN);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        this.currentUsage = {
          ...this.currentUsage,
          ...parsed
        };
      }

      if (storedWarnings) {
        const warnings = JSON.parse(storedWarnings);
        this.warningsShown = new Set(warnings);
      }

      console.log('📊 Rate limit data loaded:', {
        words: this.currentUsage.totalWords,
        percentage: ((this.currentUsage.totalWords / DAILY_WORD_LIMIT) * 100).toFixed(1)
      });
    } catch (error) {
      console.warn('⚠️ Failed to load rate limit data, using defaults:', error);
      this.currentUsage = {
        totalWords: 0,
        lastResetDate: this.getTodayDateString(),
        lastUpdateTime: Date.now(),
        warningLevel: 'none',
        isLimitExceeded: false
      };
    }
  }

  /**
   * Save usage data to localStorage
   */
  private saveUsageData(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORD_COUNT, JSON.stringify(this.currentUsage));
      localStorage.setItem(STORAGE_KEYS.WARNING_SHOWN, JSON.stringify(Array.from(this.warningsShown)));
    } catch (error) {
      console.warn('⚠️ Failed to save rate limit data:', error);
    }
  }

  /**
   * Calculate warning level based on current usage
   */
  private getWarningLevel(wordCount: number): 'none' | 'early' | 'final' | 'exceeded' {
    const percentage = wordCount / DAILY_WORD_LIMIT;

    if (percentage >= WARNING_THRESHOLDS.LIMIT_REACHED) {
      return 'exceeded';
    } else if (percentage >= WARNING_THRESHOLDS.FINAL_WARNING) {
      return 'final';
    } else if (percentage >= WARNING_THRESHOLDS.EARLY_WARNING) {
      return 'early';
    }

    return 'none';
  }

  /**
   * Show gentle notification based on warning level
   */
  private showGentleNotification(warningLevel: string, remainingWords: number, percentageUsed: number): void {
    const today = this.getTodayDateString();
    const notificationKey = `${today}-${warningLevel}`;

    // Don't show the same warning multiple times per day
    if (this.warningsShown.has(notificationKey)) {
      return;
    }

    let title: string;
    let message: string;
    let duration: number = 5000;

    switch (warningLevel) {
      case 'early':
        title = 'Approaching Daily Limit';
        message = `You've used ${percentageUsed.toFixed(0)}% of your daily word allowance. ${remainingWords.toLocaleString()} words remaining.`;
        break;

      case 'final':
        title = 'Daily Limit Almost Reached';
        message = `You're close to your daily limit. Only ${remainingWords.toLocaleString()} words remaining today.`;
        duration = 8000;
        break;

      case 'exceeded':
        title = 'Daily Word Limit Reached';
        message = 'You\'ve reached your daily limit of 3,000 words. Your limit will reset tomorrow.';
        duration = 10000;
        break;

      default:
        return;
    }

    // Show gentle toast notification
    toast.info(title, {
      description: message,
      duration,
      action: warningLevel === 'exceeded' ? {
        label: 'Learn More',
        onClick: () => {
          // Could redirect to help page or show more info
          console.log('User clicked to learn more about rate limits');
        }
      } : undefined
    });

    // Mark this warning as shown
    this.warningsShown.add(notificationKey);
    this.saveUsageData();

    console.log(`📢 Rate limit notification shown: ${warningLevel} (${percentageUsed.toFixed(1)}% used)`);
  }

  /**
   * Check if user can send a message with the given word count
   */
  public checkRateLimit(
    wordCount: number, 
    isAdmin: boolean = false, 
    isDemoMode: boolean = false
  ): RateLimitResult {
    // Always allow admin users
    if (isAdmin) {
      return {
        allowed: true,
        remainingWords: DAILY_WORD_LIMIT,
        usedWords: 0,
        percentageUsed: 0,
        warningLevel: 'none',
        message: 'Admin user - no limits'
      };
    }

    // Always allow in demo mode (but still track for UX consistency)
    if (isDemoMode) {
      return {
        allowed: true,
        remainingWords: DAILY_WORD_LIMIT,
        usedWords: 0,
        percentageUsed: 0,
        warningLevel: 'none',
        message: 'Demo mode - no limits'
      };
    }

    // Check daily reset
    this.checkDailyReset();

    const currentTotal = this.currentUsage.totalWords;
    const projectedTotal = currentTotal + wordCount;
    const remainingWords = Math.max(0, DAILY_WORD_LIMIT - currentTotal);
    const percentageUsed = (currentTotal / DAILY_WORD_LIMIT) * 100;
    const warningLevel = this.getWarningLevel(currentTotal);

    // Check if this message would exceed the limit
    const wouldExceedLimit = projectedTotal > DAILY_WORD_LIMIT;

    return {
      allowed: !wouldExceedLimit,
      remainingWords,
      usedWords: currentTotal,
      percentageUsed,
      warningLevel,
      message: wouldExceedLimit 
        ? `This message would exceed your daily limit. You have ${remainingWords} words remaining.`
        : undefined
    };
  }

  /**
   * Record word usage for a message
   */
  public recordWordUsage(
    text: string, 
    isAdmin: boolean = false, 
    isDemoMode: boolean = false
  ): RateLimitResult {
    const wordCount = this.countWords(text);

    // Don't track usage for admin users
    if (isAdmin) {
      return {
        allowed: true,
        remainingWords: DAILY_WORD_LIMIT,
        usedWords: 0,
        percentageUsed: 0,
        warningLevel: 'none',
        message: 'Admin user - no tracking'
      };
    }

    // Don't track usage in demo mode
    if (isDemoMode) {
      return {
        allowed: true,
        remainingWords: DAILY_WORD_LIMIT,
        usedWords: 0,
        percentageUsed: 0,
        warningLevel: 'none',
        message: 'Demo mode - no tracking'
      };
    }

    // Check daily reset
    this.checkDailyReset();

    // Update usage
    this.currentUsage.totalWords += wordCount;
    this.currentUsage.lastUpdateTime = Date.now();
    
    const remainingWords = Math.max(0, DAILY_WORD_LIMIT - this.currentUsage.totalWords);
    const percentageUsed = (this.currentUsage.totalWords / DAILY_WORD_LIMIT) * 100;
    const warningLevel = this.getWarningLevel(this.currentUsage.totalWords);
    
    this.currentUsage.warningLevel = warningLevel;
    this.currentUsage.isLimitExceeded = this.currentUsage.totalWords >= DAILY_WORD_LIMIT;

    // Save updated data
    this.saveUsageData();

    // Show notifications if needed
    if (warningLevel !== 'none') {
      this.showGentleNotification(warningLevel, remainingWords, percentageUsed);
    }

    console.log(`📝 Word usage recorded: +${wordCount} words (total: ${this.currentUsage.totalWords}/${DAILY_WORD_LIMIT})`);

    return {
      allowed: true,
      remainingWords,
      usedWords: this.currentUsage.totalWords,
      percentageUsed,
      warningLevel,
      message: undefined
    };
  }

  /**
   * Get current usage status
   */
  public getCurrentUsage(): WordUsageData {
    this.checkDailyReset();
    return { ...this.currentUsage };
  }

  /**
   * Get usage summary for display
   */
  public getUsageSummary(): {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    warningLevel: string;
    isLimitExceeded: boolean;
    resetTime: string;
  } {
    this.checkDailyReset();
    const { nextResetTime } = this.getTimeUntilReset();
    
    
    const remaining = Math.max(0, DAILY_WORD_LIMIT - this.currentUsage.totalWords);
    const percentage = (this.currentUsage.totalWords / DAILY_WORD_LIMIT) * 100;

    return {
      used: this.currentUsage.totalWords,
      limit: DAILY_WORD_LIMIT,
      remaining,
      percentage,
      warningLevel: this.currentUsage.warningLevel,
      isLimitExceeded: this.currentUsage.isLimitExceeded,
      resetTime: nextResetTime.toISOString(),
    };
  }

  /**
   * Manual reset (for testing or admin purposes)
   */
  public manualReset(): void {
    console.log('🔄 Manual rate limit reset triggered');
    this.resetDailyCounters();
  }

  /**
   * Get time until next reset
   */
  public getTimeUntilReset(): {
    hours: number;
    minutes: number;
    nextResetTime: Date;
  } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hours,
      minutes,
      nextResetTime: tomorrow
    };
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();

// Export types and constants
export { DAILY_WORD_LIMIT, WARNING_THRESHOLDS };
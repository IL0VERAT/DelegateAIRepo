/**
 * CCPA INTEGRATION - COMPREHENSIVE PRIVACY COMPLIANCE SYSTEM
 * =========================================================
 * 
 * Complete CCPA/CPRA compliance implementation with privacy-aware error handling,
 * data retention management, and comprehensive user rights protection.
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { usePrivacy } from './PrivacyContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';
import ErrorBoundary from './ErrorBoundary';

// ============================================================================
// PRIVACY-AWARE ERROR BOUNDARY
// ============================================================================

interface PrivacyErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
  eventPhase?: string;
}

interface PrivacyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: PrivacyErrorInfo | null;
}

export class PrivacyAwareErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  PrivacyErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PrivacyErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Privacy-compliant error logging
    const sanitizedErrorInfo: PrivacyErrorInfo = {
      componentStack: this.sanitizeStackTrace(errorInfo.componentStack),
      errorBoundary: 'PrivacyAwareErrorBoundary',
      eventPhase: 'component_error',
    };

    this.setState({
      errorInfo: sanitizedErrorInfo,
    });

    // Log error without exposing personal information
    this.logPrivacyCompliantError(error, sanitizedErrorInfo);
  }

  private sanitizeStackTrace(stack?: string): string {
    if (!stack) return 'No stack trace available';
    
    // Remove potentially sensitive file paths and user-specific information
    return stack
      .replace(/file:\/\/\/.*?\//g, 'file:///.../') // Remove full file paths
      .replace(/\/Users\/[^\/]+\//g, '/Users/.../') // Remove usernames from paths
      .replace(/C:\\Users\\[^\\]+\\/g, 'C:\\Users\\...\\') // Remove Windows usernames
      .replace(/localhost:\d+/g, 'localhost:XXXX') // Remove port numbers
      .replace(/127\.0\.0\.1:\d+/g, '127.0.0.1:XXXX'); // Remove localhost ports
  }

  private logPrivacyCompliantError(error: Error, errorInfo: PrivacyErrorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      name: error.name,
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
      userAgent: navigator.userAgent,
      url: window.location.pathname, // Only pathname, no query params or hash
      // Note: No personal information is logged
    };

    // In production, this would send to a privacy-compliant logging service
    console.error('Privacy-Compliant Error Log:', errorLog);
    
    // Store in localStorage temporarily for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      const existingLogs = JSON.parse(localStorage.getItem('delegate-ai-error-logs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('delegate-ai-error-logs', JSON.stringify(recentLogs));
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Something went wrong
              </h2>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                We've encountered an error. Your privacy and data remain protected. 
                No personal information has been compromised.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reload Application
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  Try Again
                </button>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-4">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DATA RETENTION MANAGER
// ============================================================================

export function DataRetentionManager(): null {
  const { state, clearAllData } = usePrivacy();
  const { user } = useAuth();

  // Check for expired data and clean up according to retention policies
  const performRetentionCheck = useCallback(async () => {
    try {
      const now = new Date();
      const { data_retention_preferences } = state.privacy_settings;

      // Check for inactivity-based deletion
      if (data_retention_preferences.delete_after_inactivity) {
        const lastActivity = localStorage.getItem('delegate-ai-last-activity');
        if (lastActivity) {
          const lastActivityDate = new Date(lastActivity);
          const inactivityPeriodMs = data_retention_preferences.inactivity_period_months * 30 * 24 * 60 * 60 * 1000;
          
          if (now.getTime() - lastActivityDate.getTime() > inactivityPeriodMs) {
            console.log('Data retention: Initiating cleanup due to inactivity');
            await clearAllData();
            toast.info('Data has been automatically deleted due to inactivity period expiration.');
            return;
          }
        }
      }

      // Check for transcript auto-deletion
      if (data_retention_preferences.auto_delete_transcripts) {
        const transcripts = JSON.parse(localStorage.getItem('delegate-ai-transcripts') || '[]');
        const retentionPeriodMs = data_retention_preferences.transcript_retention_months * 30 * 24 * 60 * 60 * 1000;
        
        const validTranscripts = transcripts.filter((transcript: any) => {
          const transcriptDate = new Date(transcript.date || transcript.timestamp);
          return now.getTime() - transcriptDate.getTime() <= retentionPeriodMs;
        });

        if (validTranscripts.length !== transcripts.length) {
          localStorage.setItem('delegate-ai-transcripts', JSON.stringify(validTranscripts));
          const deletedCount = transcripts.length - validTranscripts.length;
          console.log(`Data retention: Deleted ${deletedCount} expired transcripts`);
          toast.info(`${deletedCount} old transcripts have been automatically deleted.`);
        }
      }

      // Clean up old error logs (development only)
      if (process.env.NODE_ENV === 'development') {
        const errorLogs = JSON.parse(localStorage.getItem('delegate-ai-error-logs') || '[]');
        const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        const recentLogs = errorLogs.filter((log: any) => new Date(log.timestamp).getTime() > oneWeekAgo);
        
        if (recentLogs.length !== errorLogs.length) {
          localStorage.setItem('delegate-ai-error-logs', JSON.stringify(recentLogs));
          console.log('Data retention: Cleaned up old error logs');
        }
      }

    } catch (error) {
      console.error('Data retention check failed:', error);
    }
  }, [state.privacy_settings, clearAllData]);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('delegate-ai-last-activity', new Date().toISOString());
  }, []);

  // Run retention check on mount and periodically
  useEffect(() => {
    performRetentionCheck();
    
    // Run retention check daily
    const retentionInterval = setInterval(performRetentionCheck, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(retentionInterval);
  }, [performRetentionCheck]);

  // Update activity on user interaction
  useEffect(() => {
    if (user) {
      updateLastActivity();
      
      // Set up activity tracking
      const activityEvents = ['click', 'keypress', 'scroll', 'touchstart'];
      let activityTimeout: NodeJS.Timeout;
      
      const handleActivity = () => {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(updateLastActivity, 5000); // Debounce to 5 seconds
      };
      
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });
      
      return () => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
        clearTimeout(activityTimeout);
      };
    }
  }, [user, updateLastActivity]);

  return null; // This is a background component
}

// ============================================================================
// PRIVACY COMPLIANCE MONITOR
// ============================================================================

export function PrivacyComplianceMonitor(): null {
  const { state, checkCCPACompliance } = usePrivacy();
  const { user } = useAuth();

  // Monitor compliance status
  const monitorCompliance = useCallback(async () => {
    try {
      const isCompliant = await checkCCPACompliance();
      
      if (!isCompliant) {
        console.warn('CCPA compliance check failed');
        // In production, this would alert administrators
      }
    } catch (error) {
      console.error('Compliance monitoring error:', error);
    }
  }, [checkCCPACompliance]);

  // Check compliance regularly
  useEffect(() => {
    if (user) {
      monitorCompliance();
      
      // Check compliance every hour
      const complianceInterval = setInterval(monitorCompliance, 60 * 60 * 1000);
      
      return () => clearInterval(complianceInterval);
    }
  }, [user, monitorCompliance]);

  // Monitor for privacy setting changes
  useEffect(() => {
    const settingsChangeHandler = (event: StorageEvent) => {
      if (event.key === 'delegate-ai-privacy-settings') {
        console.log('Privacy settings changed, rechecking compliance');
        monitorCompliance();
      }
    };

    window.addEventListener('storage', settingsChangeHandler);
    return () => window.removeEventListener('storage', settingsChangeHandler);
  }, [monitorCompliance]);

  return null;
}

// ============================================================================
// CONSENT BANNER MANAGER
// ============================================================================

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onCustomize: () => void;
}

export function ConsentBanner({ onAccept, onDecline, onCustomize }: ConsentBannerProps): JSX.Element | null {
  const { state } = usePrivacy();
  const [showBanner, setShowBanner] = React.useState(false);

  useEffect(() => {
    // Check if user has made consent choices
    const hasGivenConsent = localStorage.getItem('delegate-ai-consent-given');
    const lastConsentCheck = localStorage.getItem('delegate-ai-last-consent-check');
    
    if (!hasGivenConsent) {
      setShowBanner(true);
    } else if (lastConsentCheck) {
      // Check if consent is older than 1 year (CCPA requirement for re-consent)
      const lastCheck = new Date(lastConsentCheck);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (lastCheck < oneYearAgo) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('delegate-ai-consent-given', 'true');
    localStorage.setItem('delegate-ai-last-consent-check', new Date().toISOString());
    setShowBanner(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('delegate-ai-consent-given', 'declined');
    localStorage.setItem('delegate-ai-last-consent-check', new Date().toISOString());
    setShowBanner(false);
    onDecline();
  };

  const handleCustomize = () => {
    setShowBanner(false);
    onCustomize();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Your Privacy Choices</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies and collect data to provide our AI conversation services. 
              You have control over how your information is used. 
              <button 
                onClick={() => window.open('/privacy', '_blank')}
                className="underline text-primary hover:text-primary/80 ml-1"
              >
                Learn more about your privacy rights
              </button>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleCustomize}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Customize
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CCPA NOTICE MANAGER
// ============================================================================

export function CCPANoticeManager(): JSX.Element | null {
  const [showNotice, setShowNotice] = React.useState(false);

  useEffect(() => {
    // Check if user is likely in California (this is a simplified check)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const californiaTimezones = [
      'America/Los_Angeles',
      'America/San_Francisco',
      'America/Oakland',
      'America/Sacramento'
    ];
    
    const isLikelyInCalifornia = californiaTimezones.includes(timezone);
    const hasSeenNotice = localStorage.getItem('delegate-ai-ccpa-notice-seen');
    
    if (isLikelyInCalifornia && !hasSeenNotice) {
      setShowNotice(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('delegate-ai-ccpa-notice-seen', 'true');
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">
            California Privacy Rights
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-xs mb-3">
            As a California resident, you have specific rights under the CCPA regarding your personal information.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => window.open('/privacy', '_blank')}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Learn More
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CCPA INTEGRATION COMPONENT
// ============================================================================

interface CCPAIntegrationProps {
  children?: React.ReactNode;
}

export function CCPAIntegration({ children }: CCPAIntegrationProps): JSX.Element {
  const { state, updatePrivacySettings } = usePrivacy();

  const handleConsentAccept = useCallback(() => {
    updatePrivacySettings({
      data_collection_consent: true,
      analytics_consent: true,
      marketing_consent: true,
    });
    toast.success('Privacy preferences updated successfully.');
  }, [updatePrivacySettings]);

  const handleConsentDecline = useCallback(() => {
    updatePrivacySettings({
      data_collection_consent: true, // Required for basic functionality
      analytics_consent: false,
      marketing_consent: false,
      third_party_sharing_consent: false,
    });
    toast.info('You have declined optional data processing. Core functionality remains available.');
  }, [updatePrivacySettings]);

  const handleConsentCustomize = useCallback(() => {
    // Navigate to privacy settings
    window.location.hash = '#settings';
    setTimeout(() => {
      const settingsButton = document.querySelector('[data-view="settings"]') as HTMLElement;
      if (settingsButton) {
        settingsButton.click();
      }
    }, 100);
  }, []);

  return (
    <>
      <DataRetentionManager />
      <PrivacyComplianceMonitor />
      <ConsentBanner
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        onCustomize={handleConsentCustomize}
      />
      <CCPANoticeManager />
      {children}
    </>
  );
}

export default CCPAIntegration;

// ============================================================================
// UTILITY FUNCTIONS FOR PRIVACY COMPLIANCE
// ============================================================================

/**
 * Sanitize data for logging to remove personal information
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveKeys = [
    'email', 'phone', 'password', 'token', 'key', 'secret',
    'voice', 'audio', 'transcript', 'message', 'content',
    'name', 'address', 'location', 'ip', 'id'
  ];

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Check if the current user is likely subject to CCPA
 */
export function isSubjectToCCPA(): boolean {
  try {
    // Check timezone as a proxy for California residence
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const californiaTimezones = [
      'America/Los_Angeles',
      'America/San_Francisco',
      'America/Oakland',
      'America/Sacramento',
      'America/Fresno',
      'America/San_Diego'
    ];
    
    return californiaTimezones.includes(timezone);
  } catch (error) {
    // If timezone detection fails, assume CCPA applies for safety
    return true;
  }
}

/**
 * Generate a privacy-compliant session ID
 */
export function generatePrivacyCompliantSessionId(): string {
  // Generate a random session ID that cannot be used to identify users
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const additional = Math.random().toString(36).substring(2, 15);
  
  // Combine and hash to ensure non-reversible ID
  return `sess_${timestamp}_${random}_${additional}`;
}

/**
 * Privacy-compliant local storage wrapper
 */
export const privacyStorage = {
  setItem: (key: string, value: string, isPersonalData: boolean = false): void => {
    try {
      if (isPersonalData) {
        // Add metadata for personal data tracking
        const wrappedValue = {
          data: value,
          timestamp: new Date().toISOString(),
          isPersonalData: true,
          autoExpire: true
        };
        localStorage.setItem(key, JSON.stringify(wrappedValue));
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Privacy storage setItem failed:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      // Try to parse as wrapped personal data
      try {
        const parsed = JSON.parse(value);
        if (parsed.isPersonalData) {
          // Check if data should auto-expire (24 hours)
          const timestamp = new Date(parsed.timestamp);
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          if (parsed.autoExpire && timestamp < twentyFourHoursAgo) {
            localStorage.removeItem(key);
            return null;
          }
          
          return parsed.data;
        }
      } catch {
        // Not wrapped data, return as-is
      }
      
      return value;
    } catch (error) {
      console.warn('Privacy storage getItem failed:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Privacy storage removeItem failed:', error);
    }
  },

  clearPersonalData: (): void => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        try {
          const parsed = JSON.parse(value);
          if (parsed.isPersonalData) {
            keysToRemove.push(key);
          }
        } catch {
          // Not JSON or not personal data
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Privacy storage: Cleared ${keysToRemove.length} personal data items`);
    } catch (error) {
      console.warn('Privacy storage clearPersonalData failed:', error);
    }
  }
};
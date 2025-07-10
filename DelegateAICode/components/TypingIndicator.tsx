/**
 * TYPING INDICATOR COMPONENT WITH SECURITY INTEGRATION
 * ==================================================
 * 
 * Enhanced typing indicator with:
 * - Smooth animation effects
 * - Security-aware status display
 * - CSP-compliant styling
 * - Accessibility features
 * - Integration with input validation system
 */

import React from 'react';
import { Bot, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { useInputValidation } from '../services/inputValidation';

interface TypingIndicatorProps {
  isSecureSession?: boolean;
  showSecurityStatus?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function TypingIndicator({ 
  isSecureSession = true, 
  showSecurityStatus = false,
  className = '',
  variant = 'default'
}: TypingIndicatorProps) {
  const { getSecurityAuditLog } = useInputValidation();

  // Get recent security stats for enhanced display
  const auditLog = getSecurityAuditLog();
  const recentThreats = auditLog.slice(-5).filter(entry => entry.threatLevel === 'high').length;
  const recentWarnings = auditLog.slice(-5).filter(entry => entry.threatLevel === 'medium').length;

  const renderCompactIndicator = () => (
    <div className={`flex items-center gap-2 p-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      {showSecurityStatus && isSecureSession && (
        <Shield className="w-3 h-3 text-green-500" />
      )}
    </div>
  );

  const renderDetailedIndicator = () => (
    <div className={`flex flex-col gap-2 p-4 bg-card rounded-lg border ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">AI is thinking</span>
            <div className="flex gap-1 ml-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {showSecurityStatus && (
          <div className="flex items-center gap-2 ml-auto">
            {isSecureSession ? (
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Secure
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Validating
              </Badge>
            )}
          </div>
        )}
      </div>

      {showSecurityStatus && (recentThreats > 0 || recentWarnings > 0) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Security Active</span>
          </div>
          {recentThreats > 0 && (
            <span className="text-red-600">
              {recentThreats} threat{recentThreats !== 1 ? 's' : ''} blocked
            </span>
          )}
          {recentWarnings > 0 && (
            <span className="text-amber-600">
              {recentWarnings} warning{recentWarnings !== 1 ? 's' : ''} issued
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderDefaultIndicator = () => (
    <div className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">AI is responding</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
          {showSecurityStatus && (
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Response being validated for security
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompactIndicator();
    case 'detailed':
      return renderDetailedIndicator();
    default:
      return renderDefaultIndicator();
  }
}

// Export as default to match the import in ChatInterface
export default TypingIndicator;
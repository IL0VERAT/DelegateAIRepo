/**
 * Rate Limit Bar Component
 * ========================
 * 
 * Visual progress bar for daily word usage limits with smooth animations
 * and color-coded progress indication. Resets every 24 hours.
 */

import React, { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { rateLimitService } from '../services/rateLimitService';

interface RateLimitBarProps {
  /** Additional CSS classes */
  className?: string;
  /** Show compact version (smaller) */
  compact?: boolean;
  /** Show detailed information in tooltip */
  showDetails?: boolean;
}

interface RateLimitData {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
  resetTime: string;
}

export function RateLimitBar({ 
  className = '', 
  compact = false, 
  showDetails = true 
}: RateLimitBarProps): JSX.Element {
  const [rateLimitData, setRateLimitData] = useState<RateLimitData>(() => 
    rateLimitService.getUsageSummary()
  );
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [previousPercentage, setPreviousPercentage] = useState<number>(0);

  // Update rate limit data periodically
  useEffect(() => {
    const updateData = () => {
      const newData = rateLimitService.getUsageSummary();
      setPreviousPercentage(rateLimitData.percentage);
      setRateLimitData(newData);
    };

    // Update immediately
    updateData();

    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, [rateLimitData.percentage]);

  // Calculate time until reset
  useEffect(() => {
    const calculateTimeUntilReset = () => {
      try {
        const resetTime = new Date(rateLimitData.resetTime);
        const now = new Date();
        const timeLeft = resetTime.getTime() - now.getTime();

        if (timeLeft <= 0) {
          setTimeUntilReset('Resetting...');
          // Trigger a data refresh when reset time passes
          setRateLimitData(rateLimitService.getUsageSummary());
          return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeUntilReset(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilReset(`${minutes}m`);
        }
      } catch (error) {
        setTimeUntilReset('24h');
      }
    };

    calculateTimeUntilReset();
    const interval = setInterval(calculateTimeUntilReset, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [rateLimitData.resetTime]);

  // Determine progress bar color based on usage percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-emerald-500'; // Green
    if (percentage < 70) return 'bg-blue-500';    // Blue
    if (percentage < 85) return 'bg-yellow-500';  // Yellow
    if (percentage < 95) return 'bg-orange-500';  // Orange
    return 'bg-red-500';                          // Red
  };

  // Determine background color based on usage percentage
  const getBackgroundColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-emerald-50 dark:bg-emerald-950/20';
    if (percentage < 70) return 'bg-blue-50 dark:bg-blue-950/20';
    if (percentage < 85) return 'bg-yellow-50 dark:bg-yellow-950/20';
    if (percentage < 95) return 'bg-orange-50 dark:bg-orange-950/20';
    return 'bg-red-50 dark:bg-red-950/20';
  };

  // Determine border color based on usage percentage
  const getBorderColor = (percentage: number): string => {
    if (percentage < 50) return 'borde-blue-100 dark:border-blue-800';
    if (percentage < 70) return 'border-blue-200 dark:border-blue-800';
    if (percentage < 85) return 'border-yellow-200 dark:border-yellow-800';
    if (percentage < 95) return 'border-orange-200 dark:border-orange-800';
    return 'border-red-200 dark:border-red-800';
  };

  // Get status icon based on usage percentage
  const getStatusIcon = (percentage: number): JSX.Element => {
    if (percentage < 70) {
      return <Target className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
    }
    if (percentage < 90) {
      return <TrendingUp className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
    }
    return <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />;
  };

  // Format usage text
  const formatUsage = (used: number, limit: number): string => {
    if (used >= 1000 && limit >= 1000) {
      return `${(used / 1000).toFixed(1)}k / ${(limit / 1000).toFixed(1)}k`;
    }
    return `${used} / ${limit}`;
  };

  const progressColor = getProgressColor(rateLimitData.percentage);
  const backgroundColor = getBackgroundColor(rateLimitData.percentage);
  const borderColor = getBorderColor(rateLimitData.percentage);

  const barContent = (
    <div 
      className={`
        rate-limit-bar-container relative rounded-lg border
        ${backgroundColor} ${borderColor} ${className}
        ${compact ? 'p-2' : 'p-3'}
        ${rateLimitData.percentage >= 95 ? 'rate-limit-bar-warning' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(rateLimitData.percentage)}
          <span className={`font-medium text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            Daily Usage
          </span>
          {rateLimitData.percentage > 90 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
              Near Limit
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Resets in {timeUntilReset}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          {/* Background track */}
          <div className={`
            w-full rounded-full bg-muted/50
            ${compact ? 'h-1.5' : 'h-2'}
          `} />
          
          {/* Animated progress fill */}
          <div 
            className={`
              absolute top-0 left-0 h-full rounded-full rate-limit-bar-fill
              ${progressColor}
              ${rateLimitData.percentage > 85 ? 'rate-limit-bar-glow' : ''}
            `}
            style={{ 
              width: `${Math.min(rateLimitData.percentage, 100)}%`
            }}
          />
          
          {/* Glow effect for high usage */}
          {rateLimitData.percentage > 85 && (
            <div 
              className={`
                absolute top-0 left-0 h-full rounded-full opacity-40 blur-sm
                ${progressColor}
              `}
              style={{ 
                width: `${Math.min(rateLimitData.percentage, 100)}%`
              }}
            />
          )}

          {/* Shimmer effect for near-full usage */}
          {rateLimitData.percentage > 95 && (
            <div 
              className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
              style={{ width: `${Math.min(rateLimitData.percentage, 100)}%` }}
            >
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="flex items-center justify-between">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-foreground`}>
            {formatUsage(rateLimitData.used, rateLimitData.limit)} words
          </span>
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {rateLimitData.percentage.toFixed(1)}%
          </span>
        </div>

        {/* Remaining words indicator */}
        {rateLimitData.remaining > 0 && rateLimitData.percentage < 100 && (
          <div className={`text-xs text-muted-foreground ${compact ? 'hidden' : 'block'}`}>
            {rateLimitData.remaining.toLocaleString()} words remaining
          </div>
        )}

        {/* Limit reached indicator */}
        {rateLimitData.percentage >= 100 && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
            ⚠️ Daily limit reached
          </div>
        )}
      </div>
    </div>
  );

  if (!showDetails) {
    return barContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {barContent}
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="p-3 max-w-sm"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="font-medium text-sm">Usage Details</div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Words used: {rateLimitData.used.toLocaleString()}</div>
              <div>Daily limit: {rateLimitData.limit.toLocaleString()}</div>
              <div>Remaining: {rateLimitData.remaining.toLocaleString()}</div>
              <div>Resets: {timeUntilReset}</div>
              <div>Progress: {rateLimitData.percentage.toFixed(2)}%</div>
            </div>
            {rateLimitData.percentage > 80 && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 border-t pt-2">
                💡 Consider upgrading for unlimited usage
              </div>
            )}
            {rateLimitData.percentage >= 100 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-2 border-t pt-2">
                🚫 Daily limit reached - usage will reset in {timeUntilReset}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default RateLimitBar;
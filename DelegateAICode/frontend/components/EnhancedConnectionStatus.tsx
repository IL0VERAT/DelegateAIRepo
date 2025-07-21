/**
 * ENHANCED CONNECTION STATUS COMPONENT
 * ===================================
 * 
 * Production-ready connection status display with:
 * ✅ Specific error codes and user-friendly messages
 * ✅ Retry mechanisms with exponential backoff
 * ✅ Status page integration
 * ✅ Estimated time to resolution
 * ✅ Contact support options
 * ✅ Graceful offline mode degradation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WifiOff, 
  Server, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  MessageCircle, 
  Mail,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { useApp } from './AppContext';
import { 
  connectionStatusManager,
  ConnectionIssue,
  IssueSeverity,
  ServiceStatus,
  ServiceStatusInfo
} from '../services/connectionStatus';
import { config } from '../config/environment';

interface EnhancedConnectionStatusProps {
  className?: string;
}

export function EnhancedConnectionStatus({ className = "" }: EnhancedConnectionStatusProps) {
  const { isOnline, isWebSocketConnected, apiHealthy, errors, reconnectWebSocket, checkApiHealth } = useApp();
  const [currentIssues, setCurrentIssues] = useState<ConnectionIssue[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatusInfo[]>([]);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});

  // Subscribe to connection issues
  useEffect(() => {
    const unsubscribe = connectionStatusManager.subscribe(setCurrentIssues);
    return unsubscribe;
  }, []);

  // Load service status
  useEffect(() => {
    const loadServiceStatus = async () => {
      try {
        const status = await connectionStatusManager.getStatusPageService().getServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        console.warn('Failed to load service status:', error);
      }
    };

    loadServiceStatus();
    const interval = setInterval(loadServiceStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Update issues based on connection state
  useEffect(() => {
    if (!isOnline) {
      connectionStatusManager.addIssue(
        connectionStatusManager.createIssue('NETWORK_OFFLINE' as any)
      );
    } else {
      connectionStatusManager.removeIssue('NETWORK_OFFLINE' as any);
    }

    if (isOnline && !apiHealthy) {
      connectionStatusManager.addIssue(
        connectionStatusManager.createIssue('API_SERVER_DOWN' as any)
      );
    } else {
      connectionStatusManager.removeIssue('API_SERVER_DOWN' as any);
    }

    if (isOnline && apiHealthy && !isWebSocketConnected) {
      connectionStatusManager.addIssue(
        connectionStatusManager.createIssue('WEBSOCKET_CONNECTION_FAILED' as any)
      );
    } else {
      connectionStatusManager.removeIssue('WEBSOCKET_CONNECTION_FAILED' as any);
    }
  }, [isOnline, apiHealthy, isWebSocketConnected]);

  // Handle retry operations with visual feedback
  const handleRetry = useCallback(async (operation: () => Promise<void>, operationId: string) => {
    setIsRetrying(prev => ({ ...prev, [operationId]: true }));
    
    try {
      await connectionStatusManager.getRetryManager().executeWithRetry(
        operation,
        operationId
      );
    } catch (error) {
      console.error(`Retry failed for ${operationId}:`, error);
    } finally {
      setIsRetrying(prev => ({ ...prev, [operationId]: false }));
    }
  }, []);

  // Get severity icon and color
  const getSeverityDisplay = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/20', borderColor: 'border-red-200 dark:border-red-800' };
      case IssueSeverity.HIGH:
        return { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/20', borderColor: 'border-orange-200 dark:border-orange-800' };
      case IssueSeverity.MEDIUM:
        return { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', borderColor: 'border-yellow-200 dark:border-yellow-800' };
      case IssueSeverity.LOW:
        return { icon: Info, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/20', borderColor: 'border-blue-200 dark:border-blue-800' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-950/20', borderColor: 'border-gray-200 dark:border-gray-800' };
    }
  };

  // Get service status display
  const getServiceStatusDisplay = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', text: 'Operational' };
      case ServiceStatus.DEGRADED_PERFORMANCE:
        return { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', text: 'Degraded' };
      case ServiceStatus.PARTIAL_OUTAGE:
        return { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', text: 'Partial Outage' };
      case ServiceStatus.MAJOR_OUTAGE:
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', text: 'Major Outage' };
      case ServiceStatus.MAINTENANCE:
        return { icon: Activity, color: 'text-blue-600 dark:text-blue-400', text: 'Maintenance' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600 dark:text-gray-400', text: 'Unknown' };
    }
  };

  // Demo mode handling
  if (config.enableMockData) {
    if (!isOnline) {
      return (
        <div className={`border-b bg-yellow-50 dark:bg-yellow-950/20 ${className}`}>
          <div className="container mx-auto px-4 py-2">
            <Alert className="border-yellow-200 dark:border-yellow-800">
              <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                <div className="flex items-center justify-between">
                  <span>No internet connection. Demo mode continues to work offline.</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Offline Mode
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
    return null;
  }

  // No issues - don't render anything
  if (currentIssues.length === 0) {
    return null;
  }

  // Get the most severe issue to display prominently
  const primaryIssue = connectionStatusManager.getMostSevereIssue();
  if (!primaryIssue) return null;

  const { icon: PrimaryIcon, color, bgColor, borderColor } = getSeverityDisplay(primaryIssue.severity);
  const supportService = connectionStatusManager.getSupportService();
  const statusPageService = connectionStatusManager.getStatusPageService();

  return (
    <div className={`border-b ${bgColor} ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <Alert className={`${borderColor} bg-transparent`}>
          <PrimaryIcon className={`h-4 w-4 ${color}`} />
          <AlertDescription>
            <div className="space-y-3">
              {/* Primary Issue Display */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${color.replace('text-', 'text-').replace('dark:text-', 'dark:text-')}`}>
                      {primaryIssue.message}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {primaryIssue.severity.toUpperCase()}
                    </Badge>
                    {primaryIssue.estimatedResolution > 0 && (
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Clock className="h-3 w-3" />
                        <span>~{connectionStatusManager.formatTimeEstimate(primaryIssue.estimatedResolution)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mb-2">
                    {primaryIssue.description}
                  </p>
                  
                  {/* Affected Services */}
                  {primaryIssue.affectedServices.length > 0 && (
                    <div className="flex items-center gap-2 text-xs opacity-75 mb-2">
                      <span>Affected:</span>
                      <div className="flex gap-1">
                        {primaryIssue.affectedServices.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs py-0">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Retry Buttons */}
                  {primaryIssue.retryable && (
                    <>
                      {primaryIssue.code.includes('API') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRetrying.api}
                          onClick={() => handleRetry(() => checkApiHealth(), 'api')}
                          className="h-8 text-xs"
                        >
                          {isRetrying.api ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Retry API
                        </Button>
                      )}
                      
                      {primaryIssue.code.includes('WEBSOCKET') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRetrying.websocket}
                          onClick={() => handleRetry(() => reconnectWebSocket(), 'websocket')}
                          className="h-8 text-xs"
                        >
                          {isRetrying.websocket ? (
                            <Server className="h-3 w-3 mr-1 animate-pulse" />
                          ) : (
                            <Server className="h-3 w-3 mr-1" />
                          )}
                          Reconnect
                        </Button>
                      )}
                    </>
                  )}

                  {/* Details Toggle */}
                  <Collapsible open={isDetailsExpanded} onOpenChange={setIsDetailsExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 text-xs">
                        Details
                        {isDetailsExpanded ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </div>

              {/* Expandable Details */}
              <Collapsible open={isDetailsExpanded} onOpenChange={setIsDetailsExpanded}>
                <CollapsibleContent className="space-y-4">
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* User Actions */}
                    <Card className="bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          What You Can Do
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm space-y-1">
                          {primaryIssue.userActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-brand-blue mt-1 text-xs">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Support & Status */}
                    <Card className="bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Get Help
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="justify-start h-8"
                            onClick={() => window.open(statusPageService.getStatusPageUrl(), '_blank')}
                          >
                            <Activity className="h-3 w-3 mr-2" />
                            <span>Status Page</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="justify-start h-8"
                            onClick={() => window.open(supportService.generateSupportUrl(primaryIssue), '_blank')}
                          >
                            <MessageCircle className="h-3 w-3 mr-2" />
                            <span>Contact Support</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="justify-start h-8"
                            onClick={() => window.open(supportService.generateEmailUrl(primaryIssue), '_blank')}
                          >
                            <Mail className="h-3 w-3 mr-2" />
                            <span>Email Support</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Service Status */}
                  {serviceStatus.length > 0 && (
                    <Card className="bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Service Status
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Current status of all services
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-2">
                          {serviceStatus.map((service, index) => {
                            const { icon: StatusIcon, color: statusColor, text } = getServiceStatusDisplay(service.status);
                            return (
                              <div key={index} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                                  <span className="text-sm">{service.service}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs opacity-75">
                                  {service.responseTime && (
                                    <span>{service.responseTime}ms</span>
                                  )}
                                  <Badge variant="outline" className="text-xs py-0">
                                    {text}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Multiple Issues */}
                  {currentIssues.length > 1 && (
                    <Card className="bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Other Issues ({currentIssues.length - 1})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {currentIssues.slice(1).map((issue, index) => {
                            const { icon: IssueIcon, color: issueColor } = getSeverityDisplay(issue.severity);
                            return (
                              <div key={index} className="flex items-center justify-between py-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <IssueIcon className={`h-3 w-3 ${issueColor}`} />
                                  <span>{issue.message}</span>
                                </div>
                                <Badge variant="outline" className="text-xs py-0">
                                  {issue.severity}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Technical Details */}
                  {primaryIssue.technicalDetails && (
                    <Card className="bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Technical Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                          {primaryIssue.technicalDetails}
                        </code>
                      </CardContent>
                    </Card>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
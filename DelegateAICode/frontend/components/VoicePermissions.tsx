import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AudioRecorderService } from '../services/audioRecorder';
import { environment } from '../config/environment';
import { 
  Mic, 
  MicOff, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  Lock,
  ExternalLink,
  Upload,
  Code
} from 'lucide-react';

export interface VoicePermissionsProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  autoRequest?: boolean;
  showDeviceSelector?: boolean;
  className?: string;
}

interface EnvironmentInfo {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
  hasUserMedia: boolean;
  hasMediaRecorder: boolean;
  isInIframe: boolean;
  protocol: string;
  userAgent: string;
  canOpenNewTab: boolean;
  currentUrl: string;
}

export function VoicePermissions({
  onPermissionGranted,
  onPermissionDenied,
  autoRequest = false,
  showDeviceSelector = false,
  className = '',
}: VoicePermissionsProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<EnvironmentInfo | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    // If we're in demo mode with mock voice permissions, grant automatically
    if (environment.ENABLE_MOCK_DATA) {
      setPermissionState('granted');
      setIsSupported(true);
      // Create mock devices
      const mockDevices = [
      { deviceId: 'mock-mic-1', label: 'Mock Microphone', kind: 'audioinput', groupId: 'mock-group' },
      { deviceId: 'mock-mic-2', label: 'Demo Audio Input',   kind: 'audioinput', groupId: 'mock-group' },
      ] as unknown as MediaDeviceInfo[];
      setDevices(mockDevices);
      setSelectedDevice('mock-mic-1');
      onPermissionGranted?.();
      return;
    }

    

    // Gather environment information for debugging
    const currentUrl = window.location.href;
    const canOpenNewTab = !currentUrl.includes('figma.com') && 
                         !currentUrl.includes('localhost') && 
                         currentUrl.startsWith('http') &&
                         !currentUrl.includes('about:blank');

    const envInfo: EnvironmentInfo = {
      isSecureContext: window.isSecureContext,
      hasMediaDevices: !!(navigator.mediaDevices),
      hasUserMedia: !!(navigator.mediaDevices?.getUserMedia),
      hasMediaRecorder: !!(window.MediaRecorder),
      isInIframe: window !== window.top,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.slice(0, 100) + '...',
      canOpenNewTab,
      currentUrl: currentUrl.slice(0, 100) + '...',
    };
    setDebugInfo(envInfo);

AudioRecorderService.isSupported()
    .then(supported => {
      setIsSupported(supported);
      if (!supported) {
        setError('Voice recording is not supported in this environment');
        return;
      }
      return checkPermissions();
    })
    .then(() => {
      if (autoRequest && isSupported && debugInfo?.isSecureContext && !debugInfo?.isInIframe) {
        setTimeout(requestPermission, 1000);
      }
    })
    .catch(err => {
      console.error('Error initializing voice permissions:', err);
      setError('Error initializing voice permissions');
    });
  }, [autoRequest]);

  const checkPermissions = async () => {
    try {
      const state = await AudioRecorderService.checkPermissions();
      setPermissionState(state);
      
      if (state === 'granted') {
        await loadDevices();
        onPermissionGranted?.();
      } else if (state === 'denied') {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setError(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadDevices = async () => {
    try {
      const deviceList = await AudioRecorderService.getAudioInputDevices();
      setDevices(deviceList);
      
      // Select default device if none selected
      if (!selectedDevice && deviceList.length > 0) {
        setSelectedDevice(deviceList[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to load audio devices:', error);
      setError(`Failed to load audio devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const requestPermission = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    setError(null);

    try {
      // Check environment first
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires a secure context (HTTPS)');
      }

      if (window !== window.top) {
        setError('Microphone access may be restricted in embedded contexts. Deploy your app to test voice features fully.');
        setIsRequesting(false);
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not available in this browser');
      }

      const granted = await AudioRecorderService.requestPermission();;
      
      if (granted) {
        setPermissionState('granted');
        await loadDevices();
        onPermissionGranted?.();
      } else {
        setPermissionState('denied');
        setError('Microphone access was denied. Please allow microphone access to use voice features.');
        onPermissionDenied?.();
      }
      
      //recorder.dispose();
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      
      let errorMessage = 'Failed to request microphone access.';
      
      if (error instanceof Error) {
        if (error.message.includes('NotAllowedError') || error.message.includes('Permission denied')) {
          errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
          setPermissionState('denied');
        } else if (error.message.includes('NotFoundError')) {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.message.includes('NotSupportedError')) {
          errorMessage = 'Microphone access is not supported in this browser or environment.';
        } else if (error.message.includes('secure context')) {
          errorMessage = 'Microphone access requires HTTPS. Please deploy your app to a secure URL.';
        } else {
          errorMessage = `${errorMessage} Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setPermissionState('denied');
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNewTabAction = () => {
    if (debugInfo?.canOpenNewTab) {
      // Try to open in new tab if we have a real URL
      const currentUrl = window.location.href;
      window.open(currentUrl, '_blank');
    } else {
      // Show deployment guidance
      setError('To test voice features fully, deploy your application to a web server with HTTPS. Voice features require microphone permissions which work best on deployed applications.');
    }
  };

  const getPermissionIcon = () => {
    switch (permissionState) {
      case 'granted':
        return <ShieldCheck className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <ShieldX className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPermissionBadge = () => {
    if (environment.ENABLE_MOCK_DATA) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Demo Mode</Badge>;
    }
    
    switch (permissionState) {
      case 'granted':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPermissionDescription = () => {
    if (environment.ENABLE_MOCK_DATA) {
      return 'Demo mode active - voice features are simulated without requiring microphone access.';
    }
    
    switch (permissionState) {
      case 'granted':
        return 'Microphone access has been granted. You can now use voice features.';
      case 'denied':
        return 'Microphone access has been denied. Voice features will not work.';
      default:
        return 'Microphone access is required for voice features to work properly.';
    }
  };

  const getInstructions = () => {
    if (environment.ENABLE_MOCK_DATA) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800/30">
            <Code className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Demo Mode Active
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Voice features are simulated - no microphone permissions needed for testing.
              </p>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Demo Features:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li>Mock voice input/output without real microphone</li>
              <li>All voice UI animations and states work</li>
              <li>Perfect for testing and development</li>
              <li>Switch off demo mode for real voice features</li>
            </ul>
          </div>
        </div>
      );
    }

    if (debugInfo?.isInIframe && !debugInfo?.canOpenNewTab) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800/30">
            <Upload className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Deploy to Test Voice Features
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Voice features require microphone permissions, which work best on deployed applications with HTTPS.
              </p>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">To enable voice functionality:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
              <li>Deploy your app to a web hosting service (Vercel, Netlify, etc.)</li>
              <li>Ensure your deployment uses HTTPS</li>
              <li>Open the deployed URL in your browser</li>
              <li>Allow microphone access when prompted</li>
            </ol>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs opacity-75">
              Voice features are currently limited in embedded development environments for security reasons.
            </p>
          </div>
        </div>
      );
    }

    if (debugInfo?.isInIframe && debugInfo?.canOpenNewTab) {
      return (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
            <Globe className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-200">
              You're viewing this in an embedded environment
            </span>
          </div>
          <p>Microphone access may be restricted. Try these solutions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Open in New Tab" below</li>
            <li>Use Chrome, Firefox, or Safari</li>
            <li>Ensure you're on HTTPS</li>
            <li>Allow microphone access when prompted</li>
          </ol>
        </div>
      );
    }

    if (permissionState === 'denied') {
      return (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>To enable voice features:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click the microphone icon in your browser's address bar</li>
            <li>Select "Allow" or "Always allow"</li>
            <li>Refresh this page</li>
          </ol>
          <p className="text-xs">
            You can also go to your browser settings and manage site permissions manually.
          </p>
        </div>
      );
    }
    return null;
  };

  // In demo mode, always show as supported
  if (!isSupported && !(environment.ENABLE_MOCK_DATA)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5 text-red-600" />
            Voice Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support voice recording. Please use a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>

          {debugInfo && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-xs text-muted-foreground"
              >
                <Info className="h-3 w-3 mr-1" />
                {showDebugInfo ? 'Hide' : 'Show'} Debug Info
              </Button>
              
              {showDebugInfo && (
                <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted rounded">
                  <div>Secure Context: {debugInfo.isSecureContext ? '✓' : '✗'}</div>
                  <div>Media Devices API: {debugInfo.hasMediaDevices ? '✓' : '✗'}</div>
                  <div>getUserMedia: {debugInfo.hasUserMedia ? '✓' : '✗'}</div>
                  <div>MediaRecorder: {debugInfo.hasMediaRecorder ? '✓' : '✗'}</div>
                  <div>Protocol: {debugInfo.protocol}</div>
                  <div>In iframe: {debugInfo.isInIframe ? 'Yes' : 'No'}</div>
                  <div>Can open new tab: {debugInfo.canOpenNewTab ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Microphone Permissions
          {getPermissionBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          {getPermissionIcon()}
          <div className="space-y-2">
            <p className="text-sm">{getPermissionDescription()}</p>
            {getInstructions()}
          </div>
        </div>

        {error && (
          <Alert variant={error.includes('Deploy') ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo?.isInIframe && !debugInfo?.canOpenNewTab && !(environment.ENABLE_MOCK_DATA) && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Voice features require deployment to work fully. This is because microphone permissions need a secure, non-embedded environment.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons - Only show if not in demo mode */}
        {!(environment.ENABLE_MOCK_DATA) && (
          <div className="space-y-2">
            {permissionState === 'prompt' && !debugInfo?.isInIframe && (
              <Button 
                onClick={requestPermission} 
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Requesting Access...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Allow Microphone Access
                  </>
                )}
              </Button>
            )}

            {permissionState === 'denied' && (
              <Button 
                onClick={checkPermissions} 
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Permissions Again
              </Button>
            )}
            
            {/* Single Open in New Tab button - only show when needed and can actually work */}
            {debugInfo?.isInIframe && debugInfo?.canOpenNewTab && (
              <Button 
                onClick={handleNewTabAction} 
                className="w-full"
                variant={permissionState === 'denied' ? 'default' : 'outline'}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            )}
          </div>
        )}

        {permissionState === 'granted' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {environment.ENABLE_MOCK_DATA 
                ? 'Demo mode active! Voice features are simulated and ready to test.'
                : 'Microphone access granted! Voice features are now available.'
              }
            </AlertDescription>
          </Alert>
        )}

        {showDeviceSelector && permissionState === 'granted' && devices.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select {environment.ENABLE_MOCK_DATA ? 'Demo ' : ''}Microphone:
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        )}

        {permissionState === 'granted' && devices.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>
                {environment.ENABLE_MOCK_DATA ? 'Demo: ' : ''}
                {devices.length} microphone{devices.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
        )}

        {/* Debug info toggle */}
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-xs text-muted-foreground w-full"
          >
            <Info className="h-3 w-3 mr-1" />
            {showDebugInfo ? 'Hide' : 'Show'} Technical Details
          </Button>
          
          {showDebugInfo && debugInfo && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1 p-2 bg-muted rounded">
              <div className="font-medium">Environment Information:</div>
              <div>Demo Mode: {environment.ENABLE_MOCK_DATA ? '✓ Enabled' : '✗ Disabled'}</div>
              <div>Mock Voice: {environment.ENABLE_MOCK_DATA ? '✓ Enabled' : '✗ Disabled'}</div>
              <div>Secure Context (HTTPS): {debugInfo.isSecureContext ? '✓ Yes' : '✗ No'}</div>
              <div>Media Devices API: {debugInfo.hasMediaDevices ? '✓ Available' : '✗ Missing'}</div>
              <div>getUserMedia: {debugInfo.hasUserMedia ? '✓ Available' : '✗ Missing'}</div>
              <div>MediaRecorder: {debugInfo.hasMediaRecorder ? '✓ Available' : '✗ Missing'}</div>
              <div>Protocol: {debugInfo.protocol}</div>
              <div>In iframe: {debugInfo.isInIframe ? 'Yes (may restrict access)' : 'No'}</div>
              <div>Can open new tab: {debugInfo.canOpenNewTab ? 'Yes' : 'No (deployment needed)'}</div>
              <div className="truncate">Current URL: {debugInfo.currentUrl}</div>
              <div className="truncate">User Agent: {debugInfo.userAgent}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
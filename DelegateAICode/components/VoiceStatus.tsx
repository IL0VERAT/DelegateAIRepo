import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Mic, Volume2, Bot, Loader2, AlertTriangle } from 'lucide-react';

export interface VoiceStatusProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  isRecording?: boolean;
  recordingDuration?: number;
  volume?: number;
  transcription?: string;
  isPlaying?: boolean;
  className?: string;
}

export function VoiceStatus({
  state,
  isRecording = false,
  recordingDuration = 0,
  volume = 0,
  transcription,
  isPlaying = false,
  className = '',
}: VoiceStatusProps) {
  const [displayDuration, setDisplayDuration] = useState(0);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDisplayDuration(prev => prev + 0.1);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setDisplayDuration(0);
    }
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateInfo = () => {
    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          label: 'Listening',
          color: 'bg-blue-500',
          description: 'Speak naturally into your microphone',
        };
      case 'processing':
        return {
          icon: Loader2,
          label: 'Processing',
          color: 'bg-amber-500',
          description: 'Converting speech to text and generating response',
        };
      case 'speaking':
        return {
          icon: Bot,
          label: 'Speaking',
          color: 'bg-green-500',
          description: 'AI is responding',
        };
      default:
        return {
          icon: Mic,
          label: 'Ready',
          color: 'bg-gray-500',
          description: 'Tap to start conversation',
        };
    }
  };

  const stateInfo = getStateInfo();
  const StateIcon = stateInfo.icon;

  if (state === 'idle') {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* State indicator */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${stateInfo.color}`} />
            {(state === 'listening' || state === 'speaking') && (
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${stateInfo.color} animate-ping opacity-75`} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StateIcon className={`h-4 w-4 ${state === 'processing' ? 'animate-spin' : ''}`} />
              <span className="font-medium">{stateInfo.label}</span>
              <Badge variant="outline" className="text-xs">
                {state}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{stateInfo.description}</p>
          </div>
        </div>

        {/* Recording indicators */}
        {state === 'listening' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recording</span>
              <span className="font-mono">{formatDuration(displayDuration)}</span>
            </div>
            
            {/* Volume indicator */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Volume2 className="h-3 w-3" />
                <span>Input Level</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-100 ease-out"
                  style={{ width: `${Math.min(100, volume)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {state === 'processing' && (
          <div className="space-y-2">
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Converting speech and generating response...
            </p>
          </div>
        )}

        {/* Transcription display */}
        {transcription && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Transcription:</p>
            <p className="text-sm">"{transcription}"</p>
          </div>
        )}

        {/* Playback indicator */}
        {state === 'speaking' && isPlaying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span>Playing AI response...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
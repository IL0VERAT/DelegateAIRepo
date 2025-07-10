import { useState, useEffect } from 'react';
import { Mic, Bot } from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface AnimatedVoiceIconProps {
  state: VoiceState;
  isConversationActive: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AnimatedVoiceIcon({ 
  state, 
  isConversationActive, 
  size = '2xl', 
  className = '' 
}: AnimatedVoiceIconProps) {
  const [previousState, setPreviousState] = useState<VoiceState>(state);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [iconKey, setIconKey] = useState(0);

  // Handle state transitions with smooth animations
  useEffect(() => {
    if (state !== previousState) {
      setIsTransitioning(true);
      setIconKey(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousState(state);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state, previousState]);

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      case '2xl':
        return 'h-20 w-20';
      default:
        return 'h-20 w-20';
    }
  };

  const getAnimationClasses = () => {
    switch (state) {
      case 'listening':
        return 'animate-breathe-ultra';
      case 'speaking':
        return 'animate-wave-ultra';
      case 'processing':
        return 'animate-rotate-glow-ultra';
      default:
        return '';
    }
  };

  const getIconColor = () => {
    // For the button, always use white for good contrast
    return 'text-white';
  };

  const iconSize = getIconSize();
  const animationClasses = getAnimationClasses();
  const iconColor = getIconColor();

  return (
    <div className={`relative inline-flex items-center justify-center voice-element ${animationClasses} ${className}`}>
      {/* Icon with smooth transitions */}
      <div 
        key={iconKey}
        className={`
          relative flex items-center justify-center
          ${isTransitioning ? 'animate-state-crossfade-ultra' : ''}
          voice-transition-ultra
          voice-performance-base
        `}
      >
        {isConversationActive ? (
          <Bot className={`
            ${iconSize} ${iconColor} 
            voice-transition-ultra
            ${isTransitioning ? 'animate-icon-morph-ultra' : ''}
          `} />
        ) : (
          <Mic className={`
            ${iconSize} ${iconColor} 
            voice-transition-ultra
            ${isTransitioning ? 'animate-icon-morph-ultra' : ''}
          `} />
        )}
      </div>

      {/* Visual indicators for different states */}
      {state === 'listening' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '250ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '500ms' }}></div>
        </div>
      )}

      {state === 'speaking' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5 items-end">
          <div className="w-1.5 bg-white rounded-full animate-speaking-bars-ultra voice-performance-base" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 bg-white rounded-full animate-speaking-bars-ultra voice-performance-base" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 bg-white rounded-full animate-speaking-bars-ultra voice-performance-base" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1.5 bg-white rounded-full animate-speaking-bars-ultra voice-performance-base" style={{ animationDelay: '450ms' }}></div>
          <div className="w-1.5 bg-white rounded-full animate-speaking-bars-ultra voice-performance-base" style={{ animationDelay: '600ms' }}></div>
        </div>
      )}

      {state === 'processing' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-listening-dots-ultra voice-performance-base" style={{ animationDelay: '600ms' }}></div>
        </div>
      )}
    </div>
  );
}
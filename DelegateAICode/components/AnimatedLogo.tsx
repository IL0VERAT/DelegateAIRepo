import { ImageWithFallback } from './figma/ImageWithFallback';
import delegateLogo from 'figma:asset/98d43dcf6b53047cfa083d0de0852d8ec35cb88d.png';

// Define VoiceState type locally since it's not exported from AppContext
export type VoiceState = 'idle' | 'listening' | 'speaking' | 'processing';

interface AnimatedLogoProps {
  state?: VoiceState;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AnimatedLogo({ state = 'idle', size = 'lg', className = '' }: AnimatedLogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-16 h-16';
      case 'lg':
        return 'w-20 h-20';
      case 'xl':
        return 'w-24 h-24';
      case '2xl':
        return 'w-32 h-32';
      default:
        return 'w-20 h-20';
    }
  };

  const getAnimationClasses = () => {
    switch (state) {
      case 'listening':
        return 'animate-breathe';
      case 'speaking':
        return 'animate-wave';
      case 'processing':
        return 'animate-rotate-glow';
      default:
        return '';
    }
  };

  const getRingClasses = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse-ring border-brand-blue';
      case 'speaking':
        return 'animate-wave-ring border-green-500';
      case 'processing':
        return 'animate-pulse-ring border-amber-500';
      default:
        return 'border-transparent';
    }
  };

  const sizeClasses = getSizeClasses();
  const animationClasses = getAnimationClasses();
  const ringClasses = getRingClasses();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Animated ring */}
      {state !== 'idle' && (
        <div className={`absolute inset-0 rounded-full border-2 ${ringClasses} ${sizeClasses}`} />
      )}
      
      {/* Logo container */}
      <div className={`relative ${sizeClasses} ${animationClasses} rounded-full overflow-hidden bg-white dark:bg-gray-900 shadow-lg`}>
        <ImageWithFallback
          src={delegateLogo}
          alt="Delegate AI Logo"
          className="w-full h-full object-contain p-2"
        />
      </div>

      {/* Additional visual indicators for different states */}
      {state === 'listening' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-listening-dots" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-listening-dots" style={{ animationDelay: '160ms' }}></div>
          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-listening-dots" style={{ animationDelay: '320ms' }}></div>
        </div>
      )}

      {state === 'speaking' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 items-end">
          <div className="w-1 bg-green-500 rounded-full animate-speaking-bars" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 bg-green-500 rounded-full animate-speaking-bars" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1 bg-green-500 rounded-full animate-speaking-bars" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1 bg-green-500 rounded-full animate-speaking-bars" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1 bg-green-500 rounded-full animate-speaking-bars" style={{ animationDelay: '400ms' }}></div>
        </div>
      )}

      {state === 'processing' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-listening-dots" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-listening-dots" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-listening-dots" style={{ animationDelay: '400ms' }}></div>
        </div>
      )}
    </div>
  );
}
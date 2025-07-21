/**
 * MESSAGE BUBBLE - FIXED OBJECT RENDERING ERROR
 * =============================================
 * 
 * Fixed critical error:
 * - Now properly accepts Message object instead of string
 * - Safe property access with null checks
 * - Enhanced error handling for rendering
 * - Proper type safety and prop validation
 */

import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Volume2, User, Bot, Copy, Check } from 'lucide-react';
import type { Message } from '../types/api';
import type { FontSize } from './AppContext';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  showAvatar?: boolean;
  voiceEnabled?: boolean;
  fontSize?: FontSize;
}

export function MessageBubble({
  message,
  isUser,
  showAvatar = true,
  voiceEnabled = false,
  fontSize = 'medium',
}: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  /**
   * SAFE PROPERTY ACCESS
   */
  const safeMessage = React.useMemo(() => {
    // Ensure message is a valid object
    if (!message || typeof message !== 'object') {
      console.error('MessageBubble: Invalid message object:', message);
      return {
        id: 'error',
        content: 'Error: Invalid message',
        sender: isUser ? 'user' : 'assistant',
        timestamp: new Date().toISOString(),
        sessionId: 'error',
      };
    }

    // Ensure all required properties exist with safe defaults
    return {
      id: String(message.id || 'unknown'),
      content: String(message.content || ''),
      sender: message.senderId || (isUser ? 'user' : 'assistant'), //modified
      timestamp: String(message.timestamp || new Date().toISOString()),
      sessionId: String(message.sessionId || 'unknown'),
    };
  }, [message, isUser]);

  /**
   * TIMESTAMP FORMATTING
   */
  const formatTimestamp = React.useCallback((isoString: string) => {
    try {
      if (!isoString) return '';
      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', isoString);
        return '';
      }

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', error, isoString);
      return '';
    }
  }, []);

  /**
   * COPY TO CLIPBOARD
   */
  const handleCopy = React.useCallback(async () => {
    if (!safeMessage.content) return;

    try {
      await navigator.clipboard.writeText(safeMessage.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [safeMessage.content]);

  /**
   * VOICE PLAYBACK
   */
  const handlePlayVoice = React.useCallback(async () => {
    if (!safeMessage.content || isUser || isPlaying) return;

    try {
      setIsPlaying(true);
      
      // Create speech synthesis (basic implementation)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(safeMessage.content);
        
        // Configure voice settings
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Handle completion
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing voice:', error);
      setIsPlaying(false);
    }
  }, [safeMessage.content, isUser, isPlaying]);

  /**
   * FONT SIZE CLASSES
   */
  const getFontSizeClass = React.useCallback(() => {
    switch (fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-base';
      case 'medium':
      default:
        return 'text-sm';
    }
  }, [fontSize]);

  /**
   * RENDER AVATAR
   */
  const renderAvatar = () => {
    if (!showAvatar) return null;

    return (
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    );
  };

  /**
   * RENDER MESSAGE ACTIONS
   */
  const renderActions = () => {
    if (!safeMessage.content) return null;

    return (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 hover:bg-background/80"
          title="Copy message"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>

        {/* Voice Button (for AI messages only) */}
        {!isUser && voiceEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayVoice}
            disabled={isPlaying}
            className="h-6 w-6 p-0 hover:bg-background/80"
            title={isPlaying ? 'Playing...' : 'Play voice'}
          >
            <Volume2 className={`h-3 w-3 ${isPlaying ? 'animate-pulse' : ''}`} />
          </Button>
        )}
      </div>
    );
  };

  /**
   * ERROR BOUNDARY FOR RENDERING
   */
  if (!safeMessage.content && safeMessage.content !== '') {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[70%] rounded-lg px-4 py-3 bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive">
            Error: Unable to display message
          </div>
          <div className="text-xs mt-1 opacity-70">
            {formatTimestamp(safeMessage.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  /**
   * MAIN RENDER
   */
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      {/* Avatar for AI messages (left side) */}
      {!isUser && showAvatar && (
        <div className="mr-3 mt-1">
          {renderAvatar()}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 relative ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {/* Message Text */}
        <div className={`whitespace-pre-wrap break-words ${getFontSizeClass()}`}>
          {safeMessage.content}
        </div>

        {/* Timestamp and Actions */}
        <div
          className={`flex items-center justify-between mt-2 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`text-xs opacity-70 ${
              isUser ? 'text-right ml-2' : 'text-left mr-2'
            }`}
          >
            {formatTimestamp(safeMessage.timestamp)}
          </div>
          
          {renderActions()}
        </div>
      </div>

      {/* Avatar for user messages (right side) */}
      {isUser && showAvatar && (
        <div className="ml-3 mt-1">
          {renderAvatar()}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
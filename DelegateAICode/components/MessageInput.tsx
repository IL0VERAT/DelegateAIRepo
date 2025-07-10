/**
 * STREAMLINED MESSAGE INPUT - OPTIMIZED FOR SMOOTH TYPING
 * ======================================================
 * 
 * Optimized for excellent typing experience:
 * - No real-time validation while typing
 * - Clean, responsive interface
 * - Validation only on send (when necessary)
 * - Focus on user experience over security theater
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useApp } from './AppContext';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  isVoiceActive?: boolean;
  isVoiceSupported?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  onSendMessage,
  onStartVoice,
  onStopVoice,
  isVoiceActive = false,
  isVoiceSupported = false,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentPersonality } = useApp();

  /**
   * Handle input change - simple and fast
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Prevent input beyond max length
    if (newValue.length > maxLength) {
      return;
    }

    setMessage(newValue);
  };

  /**
   * Handle sending message - clean and simple
   */
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Send the message directly
    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  /**
   * Handle key press events
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle voice toggle
   */
  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      onStopVoice?.();
    } else {
      onStartVoice?.();
    }
  };

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  /**
   * Get send button state
   */
  const canSendMessage = message.trim() && !disabled;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Input Container */}
        <div className="relative">
          <div className="flex items-end space-x-2 p-4 bg-card rounded-lg border">
            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? "Please wait..." : placeholder}
                disabled={disabled}
                className="min-h-[44px] max-h-[150px] resize-none border-0 focus:ring-0 focus:border-0 p-0 bg-transparent"
                aria-label="Message input"
              />
              
              {/* Character Count */}
              <div className="flex items-center justify-end mt-2 px-1">
                <div className={`text-xs ${
                  message.length > maxLength * 0.9 
                    ? message.length >= maxLength 
                      ? 'text-red-500' 
                      : 'text-amber-500'
                    : 'text-muted-foreground'
                }`}>
                  {message.length}/{maxLength}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Voice Button */}
              {isVoiceSupported && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isVoiceActive ? "destructive" : "ghost"}
                      size="sm"
                      onClick={handleVoiceToggle}
                      disabled={disabled}
                      className="h-10 w-10 p-0"
                      aria-label={isVoiceActive ? "Stop voice input" : "Start voice input"}
                    >
                      {isVoiceActive ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isVoiceActive ? "Stop voice input" : "Start voice input"}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Send Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSendMessage}
                    size="sm"
                    className="h-10 w-10 p-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!canSendMessage 
                    ? !message.trim()
                      ? "Enter a message to send"
                      : "Cannot send message"
                    : "Send message (Enter)"
                  }
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* AI Personality Indicator */}
          {currentPersonality && (
            <div className="absolute -top-2 left-4 px-2 py-1 bg-card border rounded text-xs text-muted-foreground">
              AI Mode: <span className="font-medium">{currentPersonality.charAt(0).toUpperCase() + currentPersonality.slice(1)}</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ml-1">Shift + Enter</kbd> for new line
        </div>
      </div>
    </TooltipProvider>
  );
}

export default MessageInput;
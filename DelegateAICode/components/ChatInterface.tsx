/**
 * MODERN CHAT INTERFACE COMPONENT - GEMINI ONLY
 * =============================================
 * 
 * Modern, subtle redesign with enhanced UX and visual hierarchy.
 * Features real-time conversation, message history, and enhanced aesthetics.
 * 
 * MODERN DESIGN UPDATES:
 * - Refined visual hierarchy with subtle gradients
 * - Enhanced message bubble design with improved spacing
 * - Smooth micro-animations and transitions
 * - Better input area with modern styling
 * - Improved header with refined controls
 * - Subtle shadows and backdrop blur effects
 * - Enhanced responsive design
 * 
 * GEMINI ONLY: Updated to work exclusively with Google Gemini API
 * UPDATED: Removed rate limit bar (now in main App header) and made interface taller
 */

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { MessageInput } from './MessageInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { apiService, ChatMessage } from '../services/api';
import { rateLimitService } from '../services/rateLimitService';
import { aiServiceManager } from '../services/aiServiceManager';
import { 
  Settings, 
  Trash2, 
  Download, 
  Copy, 
  RefreshCw,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Chat Actions Context
interface ChatActionsContextType {
  onCopyChat: () => void;
  onExportChat: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

const ChatActionsContext = createContext<ChatActionsContextType | null>(null);

export const useChatActions = () => {
  const context = useContext(ChatActionsContext);
  return context; // Return null if not in chat context
};

interface ChatInterfaceProps {
  onCopyChat?: () => void;
  onExportChat?: () => void;
  onClearChat?: () => void;
}

export function ChatInterface({ 
  onCopyChat: externalOnCopyChat,
  onExportChat: externalOnExportChat, 
  onClearChat: externalOnClearChat 
}: ChatInterfaceProps = {}): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const { settings, speechSpeed } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('online');
  const [rateLimitData, setRateLimitData] = useState(() => rateLimitService.getUsageSummary());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // CONNECTION STATUS MONITORING
  // ============================================================================

  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    const handleOnline = () => {
      setConnectionStatus('online');
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateConnectionStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ============================================================================
  // RATE LIMIT TRACKING
  // ============================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitData(rateLimitService.getUsageSummary());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // AUTO-SCROLL TO BOTTOM
  // ============================================================================

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ============================================================================
  // WELCOME MESSAGE
  // ============================================================================

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello! I'm your AI assistant powered by Google Gemini. I can help you with a wide range of topics including:

• Answering questions and providing explanations
• Creative writing and brainstorming
• Code review and programming help
• Research and analysis
• Problem-solving and decision making

How can I assist you today?`,
        role: 'assistant',
        timestamp: new Date(),
        model: 'gemini-1.5-pro-latest'
      };
      
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const handleSendMessage = useCallback(async (content: string, options?: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  }) => {
    if (!content.trim() || isLoading) return;

    // Check rate limits
    const isAdmin = user?.role === 'admin';
    const isDemoMode = !isAuthenticated;
    
    if (!isAdmin && !isDemoMode) {
      const rateLimitCheck = rateLimitService.checkRateLimit(
        rateLimitService.getUsageSummary().used,
        isAdmin,
        isDemoMode
      );

      if (!rateLimitCheck.allowed) {
        toast.error(rateLimitCheck.message || 'Daily word limit reached');
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Set connection status to connecting
      setConnectionStatus('connecting');

      const response = await apiService.sendMessage({
        message: content.trim(),
        conversationId: conversationId || undefined,
        model: options?.model || settings.selectedModel || 'gemini-1.5-pro-latest',
        temperature: options?.temperature || settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 2048,
        systemPrompt: options?.systemPrompt,
        speechSpeed: speechSpeed // Pass speech speed setting to API
      });

      const assistantMessage: ChatMessage = {
        id: response.messageId,
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        model: response.model,
        usage: response.usage
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.conversationId);
      
      // Update rate limit data
      setRateLimitData(rateLimitService.getUsageSummary());
      
      // Restore connection status
      setConnectionStatus('online');

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
        model: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Show user-friendly error toast
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          toast.error('Rate limit reached. Please wait before sending another message.');
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          toast.error('Network error. Please check your internet connection.');
          setConnectionStatus('offline');
        } else {
          toast.error('AI service temporarily unavailable. Please try again.');
        }
      }
      
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, user, isAuthenticated, conversationId, settings, speechSpeed]);

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setConversationId('');
    toast.success('Chat cleared');
  }, []);

  const handleExportChat = useCallback(() => {
    const chatData = {
      conversation: {
        id: conversationId,
        timestamp: new Date().toISOString(),
        model: 'Google Gemini',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          model: msg.model
        }))
      }
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat exported successfully');
  }, [conversationId, messages]);

  const handleCopyChat = useCallback(() => {
    const chatText = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(chatText).then(() => {
      toast.success('Chat copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy chat');
    });
  }, [messages]);

  // Use external handlers if provided, otherwise use internal ones
  const finalOnCopyChat = externalOnCopyChat || handleCopyChat;
  const finalOnExportChat = externalOnExportChat || handleExportChat;
  const finalOnClearChat = externalOnClearChat || handleClearChat;

  // Context value for chat actions
  const chatActionsValue: ChatActionsContextType = {
    onCopyChat: finalOnCopyChat,
    onExportChat: finalOnExportChat,
    onClearChat: finalOnClearChat,
    hasMessages: messages.length > 1
  };

  // ============================================================================
  // SERVICE STATUS
  // ============================================================================

  const serviceStatus = aiServiceManager.getStatus();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ChatActionsContext.Provider value={chatActionsValue}>
      <div className="flex flex-col h-full max-h-full overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* Connection/Service warnings */}
      {(!serviceStatus.isReady || connectionStatus === 'offline') && (
        <div className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-4">
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {!serviceStatus.isReady && 'AI service not available. '}
                {connectionStatus === 'offline' && 'No internet connection. '}
                Some features may not work properly.
                {connectionStatus === 'connecting' && (
                  <span className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Thinking...</span>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Messages area with enhanced styling */}
      <ScrollArea className="flex-1 px-4 lg:px-6" ref={scrollAreaRef}>
        <div className="space-y-6 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 mb-4">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything! I can help with questions, creative writing, code review, research, and more.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <ModernMessageBubble
                message={message}
                isLoading={false}
                isFirst={index === 0}
                isLast={index === messages.length - 1}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="max-w-xs lg:max-w-md">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Modern input area */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || !serviceStatus.isReady || connectionStatus === 'offline'}
              placeholder={
                !serviceStatus.isReady ? 'AI service not available...' :
                connectionStatus === 'offline' ? 'No internet connection...' :
                'Ask me anything... (Powered by Google Gemini)'
              }
            />
            
            {/* Enhanced status indicators */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center gap-4">
                {/* Demo mode indicator */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <span>Demo mode • Sign in for 3,000 words/day</span>
                  </div>
                )}
                
                {/* Rate limit warning for authenticated users */}
                {!user?.role?.includes('admin') && isAuthenticated && rateLimitData.percentage > 80 && (
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      rateLimitData.percentage > 95 ? 'bg-destructive animate-pulse' : 'bg-yellow-500'
                    }`}></div>
                    <span className={rateLimitData.percentage > 95 ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}>
                      {rateLimitData.percentage > 95 ? 
                        `Almost at daily limit: ${rateLimitData.remaining} words remaining` :
                        `Daily usage: ${rateLimitData.used}/${rateLimitData.limit} words (${rateLimitData.percentage.toFixed(0)}%)`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              {/* Connection status */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'online' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-blue-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ChatActionsContext.Provider>
  );
}

// ============================================================================
// MODERN MESSAGE BUBBLE COMPONENT
// ============================================================================

interface ModernMessageBubbleProps {
  message: ChatMessage;
  isLoading: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

function ModernMessageBubble({ message, isLoading, isFirst, isLast }: ModernMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.model === 'error';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Message copied');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  }, [message.content]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 mt-1 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : isError
              ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-200 dark:border-red-800'
              : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-200 dark:border-purple-800'
          }`}>
            {isUser ? (
              <span className="text-xs font-medium">You</span>
            ) : isError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`relative rounded-2xl px-4 py-3 shadow-sm border transition-all duration-200 hover:shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/20'
              : isError
              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              : 'bg-card text-card-foreground border-border/50 hover:border-border'
          }`}>
            {/* Message text */}
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? 'justify-start' : 'justify-end'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={`h-6 w-6 p-0 ${
                  isUser 
                    ? 'hover:bg-white/20 text-white/80 hover:text-white'
                    : 'hover:bg-muted/80'
                }`}
                title="Copy message"
              >
                {copied ? (
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-muted-foreground mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {formatTime(message.timestamp)}
            {message.model && message.model !== 'error' && (
              <span className="ml-2 opacity-60">• {message.model}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
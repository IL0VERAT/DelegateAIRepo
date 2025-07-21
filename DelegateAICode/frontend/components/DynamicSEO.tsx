import { useEffect } from 'react';
import { useSEO } from './SEOManager';

interface DynamicSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Component for applying dynamic SEO to specific pages/sections
export const DynamicSEO: React.FC<DynamicSEOProps> = ({
  title,
  description,
  keywords,
  image,
  type,
  author,
  publishedTime,
  modifiedTime
}) => {
  const customSEO = {
    ...(title && { title }),
    ...(description && { description }),
    ...(keywords && { keywords }),
    ...(image && { image }),
    ...(type && { type }),
    ...(author && { author }),
    ...(publishedTime && { publishedTime }),
    ...(modifiedTime && { modifiedTime }),
  };

  useSEO(customSEO);

  return null; // This component doesn't render anything
};

// Hook for conversation-specific SEO
export const useConversationSEO = (conversationTitle?: string, messageCount?: number) => {
  const customSEO = conversationTitle ? {
    title: `${conversationTitle} - Delegate AI`,
    description: `AI conversation: ${conversationTitle}${messageCount ? ` (${messageCount} messages)` : ''}. Chat with Delegate AI's intelligent assistant featuring multiple personality modes.`,
    keywords: ['AI conversation', 'chat history', 'AI assistant', 'delegate AI', conversationTitle.toLowerCase()],
    type: 'article' as const,
    modifiedTime: new Date().toISOString(),
  } : undefined;

  useSEO(customSEO);
};

// Hook for transcript-specific SEO
export const useTranscriptSEO = (transcriptTitle?: string, transcriptType?: 'chat' | 'voice') => {
  const customSEO = transcriptTitle ? {
    title: `${transcriptTitle} - AI ${transcriptType === 'voice' ? 'Voice' : 'Chat'} Transcript`,
    description: `${transcriptType === 'voice' ? 'Voice conversation' : 'Chat'} transcript: ${transcriptTitle}. Review your AI assistant interaction with full conversation history and timestamps.`,
    keywords: [
      'AI transcript', 
      `${transcriptType} transcript`, 
      'conversation history', 
      'AI assistant', 
      'delegate AI',
      transcriptTitle.toLowerCase()
    ],
    type: 'article' as const,
    author: 'Delegate AI',
    modifiedTime: new Date().toISOString(),
  } : undefined;

  useSEO(customSEO);
};

// Hook for error page SEO
export const useErrorSEO = (errorType: string, errorMessage?: string) => {
  const customSEO = {
    title: `${errorType} - Delegate AI`,
    description: `${errorType} on Delegate AI. ${errorMessage || 'Please try again or contact support for assistance with your AI assistant.'} Return to chat or voice interface.`,
    keywords: ['error', 'AI assistant', 'delegate AI', 'support', errorType.toLowerCase()],
    type: 'website' as const,
  };

  useSEO(customSEO);
};

// Hook for authentication-related SEO
export const useAuthSEO = (authType: 'login' | 'signup' | 'reset') => {
  const titles = {
    login: 'Sign In - Delegate AI',
    signup: 'Create Account - Delegate AI', 
    reset: 'Reset Password - Delegate AI'
  };

  const descriptions = {
    login: 'Sign in to your Delegate AI account to access personalized AI conversations, save chat history, and customize your AI assistant preferences.',
    signup: 'Create your Delegate AI account to unlock personalized AI conversations, save transcripts, and access advanced AI personality modes.',
    reset: 'Reset your Delegate AI password to regain access to your personalized AI assistant and conversation history.'
  };

  const customSEO = {
    title: titles[authType],
    description: descriptions[authType],
    keywords: ['AI login', 'AI account', 'delegate AI', 'AI assistant access', 'personalized AI'],
    type: 'website' as const,
  };

  useSEO(customSEO);
};

// Hook for settings-specific SEO with current personality mode
export const useSettingsSEO = (currentPersonality?: string) => {
  const personalityNames = {
    collaborative: 'Collaborative AI Mode',
    gentle: 'Gentle AI Mode',
    balanced: 'Balanced AI Mode', 
    challenging: 'Challenging AI Mode',
    aggressive: 'Aggressive AI Mode'
  };

  const customSEO = currentPersonality ? {
    title: `Settings - ${personalityNames[currentPersonality as keyof typeof personalityNames]} - Delegate AI`,
    description: `Configure your Delegate AI settings with ${personalityNames[currentPersonality as keyof typeof personalityNames]} selected. Customize AI personality, voice preferences, and privacy settings for optimal AI assistance.`,
    keywords: [
      'AI settings', 
      'AI personality', 
      currentPersonality, 
      'AI preferences', 
      'delegate AI configuration',
      'AI assistant customization'
    ],
    type: 'website' as const,
  } : undefined;

  useSEO(customSEO);
};

// Helper function to generate Open Graph image URLs for dynamic content
export const generateOGImageUrl = (
  text: string, 
  subtitle?: string, 
  theme: 'light' | 'dark' = 'light'
): string => {
  const baseUrl = 'https://og-image-generator.vercel.app';
  const encodedText = encodeURIComponent(text);
  const encodedSubtitle = subtitle ? encodeURIComponent(subtitle) : '';
  
  return `${baseUrl}/${encodedText}.png?theme=${theme}&md=1&fontSize=100px${subtitle ? `&subtitle=${encodedSubtitle}` : ''}`;
};
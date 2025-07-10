/**
 * AI SERVICE MANAGER - GEMINI ONLY WITH SPEED CONTROL
 * ===================================================
 * 
 * Manages AI interactions using only Google's Gemini API.
 * Provides a unified interface for all AI operations in the application.
 * 
 * GEMINI ONLY: Removed OpenAI integration, uses only Google Gemini
 * FIXED: Using safe environment variable access utilities
 * ENHANCED: Added speech speed control instructions for Gemini
 */

import { toast } from 'sonner@2.0.3';
import { safeGetEnv } from '../config/env-utils';

// Types for AI responses
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  speechSpeed?: number; // NEW: Speech speed setting (0.7 to 1.2)
}

class AIServiceManager {
  private geminiApiKey: string | null = null;
  private isInitialized: boolean = false;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the AI service manager
   */
  private async initialize(): Promise<void> {
    try {
      // Get Gemini API key from environment using safe access
      this.geminiApiKey = safeGetEnv('VITE_GEMINI_API_KEY') || null;
      
      if (!this.geminiApiKey) {
        console.warn('⚠️ No Gemini API key found - AI features will be limited');
        console.warn('Please set VITE_GEMINI_API_KEY in your .env file');
        this.isInitialized = false;
        return;
      }

      this.isInitialized = true;
      console.log('✅ AI Service Manager initialized with Gemini');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service Manager:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.geminiApiKey;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return [
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-pro'
    ];
  }

  /**
   * Generate speech speed instructions for Gemini
   */
  private generateSpeedInstructions(speechSpeed: number): string {
    if (speechSpeed === 1.0) {
      return ''; // No instructions needed for normal speed
    }

    const speedPercent = Math.round((speechSpeed - 1.0) * 100);
    const isSlower = speechSpeed < 1.0;
    const isFaster = speechSpeed > 1.0;

    if (isSlower) {
      const slowPercent = Math.abs(speedPercent);
      return `

SPEECH TEMPO INSTRUCTIONS:
Please structure your response for SLOWER speech delivery (${slowPercent}% slower than normal pace). 
- Use shorter, more digestible sentences
- Include natural pauses and breaks in your phrasing
- Add transitional phrases that allow for comfortable pacing
- Structure information in smaller, clear chunks
- Use punctuation that naturally encourages slower delivery
- Consider adding emphasis markers for important points

This helps ensure your response works well when spoken at a deliberate, thoughtful pace.`;
    }

    if (isFaster) {
      return `

SPEECH TEMPO INSTRUCTIONS:
Please structure your response for FASTER speech delivery (${speedPercent}% faster than normal pace).
- Use more concise, direct phrasing
- Minimize filler words and unnecessary transitions
- Structure information efficiently with clear, flowing sentences
- Use active voice and dynamic language
- Keep explanations crisp and to-the-point
- Organize content for smooth, quick delivery

This helps ensure your response works well when spoken at an energetic, efficient pace.`;
    }

    return '';
  }

  /**
   * Generate a response using Gemini with speed control
   */
  async generateResponse(
    messages: AIMessage[],
    config: AIConfig = { model: 'gemini-1.5-pro-latest' }
  ): Promise<AIResponse> {
    if (!this.isReady()) {
      throw new Error('AI Service Manager not properly initialized. Please check your Gemini API key.');
    }

    try {
      // Generate speed instructions if speechSpeed is provided
      let enhancedSystemPrompt = config.systemPrompt || '';
      
      if (config.speechSpeed && config.speechSpeed !== 1.0) {
        const speedInstructions = this.generateSpeedInstructions(config.speechSpeed);
        enhancedSystemPrompt = enhancedSystemPrompt + speedInstructions;
      }

      // Convert messages to Gemini format with enhanced system prompt
      const geminiMessages = this.convertMessagesToGeminiFormat(messages, enhancedSystemPrompt);
      
      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 2048,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(`${this.baseUrl}/${config.model}:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini');
      }

      const content = candidate.content.parts[0].text;

      return {
        content,
        model: config.model,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0
        } : undefined,
        metadata: {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings,
          speechSpeed: config.speechSpeed || 1.0
        }
      };

    } catch (error) {
      console.error('❌ Gemini API error:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          toast.error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('rate limit')) {
          toast.error('Rate limit reached. Please wait a moment before trying again.');
        } else if (error.message.includes('API key')) {
          toast.error('Invalid API key. Please check your Gemini API configuration.');
        } else {
          toast.error('AI service temporarily unavailable. Please try again.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Convert messages to Gemini format
   */
  private convertMessagesToGeminiFormat(messages: AIMessage[], systemPrompt?: string): any[] {
    const geminiMessages: any[] = [];

    // Add system prompt as first user message if provided
    if (systemPrompt) {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      geminiMessages.push({
        role: 'model',
        parts: [{ text: 'I understand. I will follow these instructions carefully, including any speech tempo guidance you\'ve provided.' }]
      });
    }

    // Convert messages
    for (const message of messages) {
      if (message.role === 'system') {
        // System messages are handled above
        continue;
      }

      const role = message.role === 'assistant' ? 'model' : 'user';
      geminiMessages.push({
        role,
        parts: [{ text: message.content }]
      });
    }

    return geminiMessages;
  }

  /**
   * Generate a streaming response (for real-time chat) with speed control
   */
  async generateStreamingResponse(
    messages: AIMessage[],
    config: AIConfig = { model: 'gemini-1.5-pro-latest' },
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.isReady()) {
      throw new Error('AI Service Manager not properly initialized. Please check your Gemini API key.');
    }

    try {
      // Generate speed instructions if speechSpeed is provided
      let enhancedSystemPrompt = config.systemPrompt || '';
      
      if (config.speechSpeed && config.speechSpeed !== 1.0) {
        const speedInstructions = this.generateSpeedInstructions(config.speechSpeed);
        enhancedSystemPrompt = enhancedSystemPrompt + speedInstructions;
      }

      const geminiMessages = this.convertMessagesToGeminiFormat(messages, enhancedSystemPrompt);
      
      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 2048,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(`${this.baseUrl}/${config.model}:streamGenerateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const data = JSON.parse(line);
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0]?.text || '';
                if (text) {
                  fullContent += text;
                  onChunk(text);
                }
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return {
        content: fullContent,
        model: config.model,
        metadata: { 
          streaming: true,
          speechSpeed: config.speechSpeed || 1.0
        }
      };

    } catch (error) {
      console.error('❌ Gemini streaming error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings (if supported by Gemini)
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.isReady()) {
      throw new Error('AI Service Manager not properly initialized. Please check your Gemini API key.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embedding-001:embedContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini embeddings error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding?.values || [];

    } catch (error) {
      console.error('❌ Gemini embeddings error:', error);
      throw error;
    }
  }

  /**
   * Analyze text sentiment using Gemini with speed awareness
   */
  async analyzeSentiment(text: string, speechSpeed: number = 1.0): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Analyze the sentiment of the following text and respond with only a JSON object containing "sentiment" (positive/negative/neutral) and "confidence" (0-1): "${text}"`
      }
    ];

    try {
      const response = await this.generateResponse(messages, {
        model: 'gemini-1.5-flash-latest',
        temperature: 0.1,
        speechSpeed // Pass speech speed for consistent response formatting
      });

      const result = JSON.parse(response.content);
      return {
        sentiment: result.sentiment || 'neutral',
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.warn('❌ Sentiment analysis failed:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    provider: string;
    models: string[];
  } {
    return {
      isReady: this.isReady(),
      provider: 'Google Gemini',
      models: this.getAvailableModels()
    };
  }
}

// Export singleton instance
export const aiServiceManager = new AIServiceManager();

// Export types
export type { AIResponse, AIMessage, AIConfig };
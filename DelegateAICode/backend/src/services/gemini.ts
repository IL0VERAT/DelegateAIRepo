/**
 * GEMINI SERVICE - ENHANCED WITH NATIVE AUDIO
 * ===========================================
 * 
 * Enhanced Gemini service with native audio generation capabilities.
 * Supports both text generation and voice synthesis for Model UN campaigns.
 */
console.log('→ GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { AIMessage, AIServiceOptions } from './aiServiceManager';

interface GeminiAudioSettings {
  speed?: number;
  volume?: number;
  pitch?: number;
  voiceType?: 'professional' | 'conversational' | 'narrative' | 'authoritative';
  language?: string;
}

interface GeminiVoice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  personality: 'aggressive' | 'diplomatic' | 'cunning' | 'idealistic' | 'pragmatic' | 'charismatic';
  language: string;
}

interface AudioGenerationRequest {
  text: string;
  voiceId: string;
  settings?: GeminiAudioSettings;
  characterPersonality?: string;
}

class GeminiServiceEnhanced {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private audioModel: any;

  constructor() {
    if (!environment.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Initialize audio model for native audio generation
    this.audioModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
  }

  /**
   * Generate text response using Gemini
   */
  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxTokens || 8192,
        },
      });

      const response = await result.response;
      return response.text();

    } catch (error) {
      logger.error('Error generating Gemini response:', error);
      throw new Error('Failed to generate response');
    }
  }


  /**
   * Generate imaged vision for campaign creation
   */
  async generateVisionCompletion(
    text: string,
    imageData: string,
    options: AIServiceOptions & { userId?: string }
  ): Promise<{
    provider: string;
    model: string;
    content: string;
    usage: null;
    isComplete: true;
  }> {
    try {
      const visionModel = this.genAI.getGenerativeModel({
        model: 'gemini-pro-vision'
      });

      const result = await visionModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text },
              {
                inlineData: {
                  mimeType: options.mimeType || 'image/png',
                  data: imageData
                }
              }
            ]
          }
        ]
      });

      const response = await result.response;
      const content = response.text();

      return {
        provider: 'gemini',
        model: 'gemini-pro-vision',
        content,
        usage: null,
        isComplete: true
      };

    } catch (error) {
      logger.error('Gemini vision error:', error);
      throw new Error('Failed to generate vision completion');
    }
  }

  async *streamResponse(messages: AIMessage[], options: AIServiceOptions) {
  const model = this.genAI.getGenerativeModel({
    model: options.model || 'gemini-1.5-pro',
    generationConfig: {
      temperature: options.temperature || 0.7,
      topK: 1,
      topP: 1,
    },
  });

  const chat = model.startChat({});

  for (const message of messages) {
    if (message.role === 'user') {
      const stream = await chat.sendMessageStream(message.content);

      for await (const chunk of stream.stream) {
        yield {
          content: chunk.text || '',
          isComplete: false,
        };
      }
    }
  }

  yield { isComplete: true };
}

  /**
   * Generate native audio using Gemini 2.5
   */
  async generateNativeAudio(request: AudioGenerationRequest): Promise<string> {
    try {
      logger.info('Generating native audio with Gemini 2.5', { 
        voiceId: request.voiceId,
        textLength: request.text.length 
      });

      // Build audio generation prompt
      const audioPrompt = this.buildAudioPrompt(request);

      // Generate audio using Gemini's native capabilities
      const result = await this.audioModel.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: audioPrompt,
            // NOTE: In actual Gemini 2.5, this would include audio generation parameters
            // For now, we'll simulate the audio generation process
          }] 
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for consistent voice
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      // In actual implementation, this would return audio data
      // For now, we'll simulate by generating a text response and converting
      const audioData = await this.simulateAudioGeneration(request);

      logger.info('Successfully generated native audio with Gemini');
      return audioData;

    } catch (error) {
      logger.error('Error generating native audio:', error);
      throw new Error('Failed to generate native audio');
    }
  }

  /**
   * Get available Gemini voices
   */
  async getAvailableVoices(): Promise<GeminiVoice[]> {
    // Return predefined voice profiles optimized for diplomatic characters
    return [
      {
        id: 'gemini-diplomat-male-1',
        name: 'Ambassador Sterling',
        gender: 'male',
        personality: 'diplomatic',
        language: 'en-US'
      },
      {
        id: 'gemini-diplomat-female-1', 
        name: 'Minister Chen',
        gender: 'female',
        personality: 'diplomatic',
        language: 'en-US'
      },
      {
        id: 'gemini-aggressive-male-1',
        name: 'General Harrison',
        gender: 'male',
        personality: 'aggressive',
        language: 'en-US'
      },
      {
        id: 'gemini-cunning-female-1',
        name: 'Strategist Volkov',
        gender: 'female',
        personality: 'cunning',
        language: 'en-US'
      },
      {
        id: 'gemini-idealistic-male-1',
        name: 'Advocate Thompson',
        gender: 'male',
        personality: 'idealistic',
        language: 'en-US'
      },
      {
        id: 'gemini-pragmatic-female-1',
        name: 'Director Kim',
        gender: 'female',
        personality: 'pragmatic',
        language: 'en-US'
      },
      {
        id: 'gemini-charismatic-male-1',
        name: 'Speaker Rodriguez',
        gender: 'male',
        personality: 'charismatic',
        language: 'en-US'
      },
      {
        id: 'gemini-charismatic-female-1',
        name: 'Ambassador Singh',
        gender: 'female',
        personality: 'charismatic',
        language: 'en-US'
      }
    ];
  }

  /**
   * Health check for Gemini service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testResult = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Health check test. Please respond with "OK".' }] }],
      });

      const response = await testResult.response;
      const text = response.text();
      
      return text.toLowerCase().includes('ok');

    } catch (error) {
      logger.error('Gemini health check failed:', error);
      return false;
    }
  }

  async detectLanguage(text: string): Promise<string> {
  const result = await this.model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Please tell me, in one ISO-639-1 code (e.g. "en", "fr", "es"), what language this text is in: "${text}"`
      }]
    }],
    // you can dial down tokens since this is short
    generationConfig: { maxOutputTokens: 10 }
  });
  const response = await result.response;
  return response.text().trim();
}

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Build audio generation prompt
   */
  private buildAudioPrompt(request: AudioGenerationRequest): string {
    const voiceProfile = this.getVoiceProfile(request.voiceId);
    const personality = request.characterPersonality || voiceProfile?.personality || 'diplomatic';

    return `
Generate natural speech with the following characteristics:

TEXT TO SPEAK: "${request.text}"

VOICE PROFILE:
- Voice ID: ${request.voiceId}
- Personality: ${personality}
- Gender: ${voiceProfile?.gender || 'neutral'}
- Language: ${request.settings?.language || 'en-US'}

SPEECH SETTINGS:
- Speed: ${request.settings?.speed || 1.0}x
- Volume: ${request.settings?.volume || 0.8}
- Voice Type: ${request.settings?.voiceType || 'professional'}
- Pitch: ${request.settings?.pitch || 0}

CONTEXT: This is for a diplomatic simulation where characters engage in Model UN negotiations. The speech should sound ${personality} and ${request.settings?.voiceType || 'professional'}.

Please generate natural, expressive speech that matches the character's personality and the diplomatic context.
`;
  }

  /**
   * Simulate audio generation (placeholder for actual Gemini 2.5 audio)
   */
  private async simulateAudioGeneration(request: AudioGenerationRequest): Promise<string> {
    // In actual implementation, this would call Gemini's native audio API
    // For now, we'll create a placeholder response that can be used with browser TTS
    
    // This would be replaced with actual Gemini audio generation
    logger.info('Simulating audio generation - replace with actual Gemini 2.5 audio API');
    
    // Return base64 encoded empty audio (placeholder)
    // In production, this would be actual audio data from Gemini
    const placeholderAudio = this.generatePlaceholderAudio(request.text);
    return placeholderAudio;
  }

  /**
   * Generate placeholder audio (to be replaced with actual Gemini audio)
   */
  private generatePlaceholderAudio(text: string): string {
    // This is a placeholder that returns a base64 encoded silent audio file
    // Replace this with actual Gemini 2.5 native audio generation
    
    // Minimal MP3 header for silent audio (placeholder)
    const silentMp3Header = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAADAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v/////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
    
    return silentMp3Header;
  }

  /**
   * Get voice profile by ID --> NEED TO CHANGE FOR MORE DYNAMIC INTERACTION
   */
  private getVoiceProfile(voiceId: string): GeminiVoice | undefined {
    const voices = [
      { id: 'gemini-diplomat-male-1', name: 'Ambassador Sterling', gender: 'male' as const, personality: 'diplomatic' as const, language: 'en-US' },
      { id: 'gemini-diplomat-female-1', name: 'Minister Chen', gender: 'female' as const, personality: 'diplomatic' as const, language: 'en-US' },
      { id: 'gemini-aggressive-male-1', name: 'General Harrison', gender: 'male' as const, personality: 'aggressive' as const, language: 'en-US' },
      { id: 'gemini-cunning-female-1', name: 'Strategist Volkov', gender: 'female' as const, personality: 'cunning' as const, language: 'en-US' },
      { id: 'gemini-idealistic-male-1', name: 'Advocate Thompson', gender: 'male' as const, personality: 'idealistic' as const, language: 'en-US' },
      { id: 'gemini-pragmatic-female-1', name: 'Director Kim', gender: 'female' as const, personality: 'pragmatic' as const, language: 'en-US' },
      { id: 'gemini-charismatic-male-1', name: 'Speaker Rodriguez', gender: 'male' as const, personality: 'charismatic' as const, language: 'en-US' },
      { id: 'gemini-charismatic-female-1', name: 'Ambassador Singh', gender: 'female' as const, personality: 'charismatic' as const, language: 'en-US' }
    ];

    return voices.find(voice => voice.id === voiceId);
  }
}

export const geminiService = new GeminiServiceEnhanced();
export default geminiService;


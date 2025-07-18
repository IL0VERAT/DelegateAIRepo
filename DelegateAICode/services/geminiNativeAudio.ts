/**
 * GEMINI NATIVE AUDIO SERVICE
 * ===========================
 * 
 * Service for generating speech using Gemini 2.5 Native Audio.
 */

//NOTE TO SELF --> AI can pick from any of the available for voices and assign it to the correct character; --> ensure this functions
import { api } from './api';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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
  sample?: string;
}

interface AudioGenerationRequest {
  text: string;
  voiceId: string;
  settings?: GeminiAudioSettings;
  characterPersonality?: string;
}

// ============================================================================
// GEMINI NATIVE AUDIO SERVICE CLASS
// ============================================================================

class GeminiNativeAudioService {
  private baseUrl = '/api';
  private retryAttempts = 3;
  private retryDelay = 1000;
  private audioCache = new Map<string, Blob>();

  // Pre-defined voice profiles optimized for diplomatic characters
  private voiceProfiles: GeminiVoice[] = [
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

  /**
   * Generate speech using Gemini Native Audio
   */
  async generateSpeech(
    text: string, 
    voiceId: string, 
    settings?: GeminiAudioSettings
  ): Promise<Blob> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(text, voiceId, settings);
      const cachedAudio = this.audioCache.get(cacheKey);
      
      if (cachedAudio) {
        logger.info('Returning cached audio for voice:', voiceId);
        return cachedAudio;
      }

      logger.info('Generating speech with Gemini Native Audio:', { voiceId, textLength: text.length });

      // Get voice profile
      const voiceProfile = this.getVoiceProfile(voiceId);
      
      // Generate speech using backend Gemini service
      const audioBlob = await this.callGeminiAudioAPI({
        text,
        voiceId,
        settings: {
          ...settings,
          voiceType: this.getVoiceTypeFromPersonality(voiceProfile?.personality)
        },
        characterPersonality: voiceProfile?.personality
      });

      // Cache the result
      this.audioCache.set(cacheKey, audioBlob);

      logger.info('Successfully generated speech with Gemini Native Audio');
      return audioBlob;

    } catch (error) {
      logger.error('Error generating speech with Gemini Native Audio:', error);
      throw new Error('Failed to generate speech with Gemini Native Audio');
    }
  }

  /**
   * Get available Gemini voices
   */
  async getAvailableVoices(): Promise<GeminiVoice[]> {
    try {
      logger.info('Fetching available Gemini voices');

      const response = await this.makeRequest('/voice/gemini/voices', {
        method: 'GET'
      });

      if (!response.success) {
        logger.warn('Backend voice fetch failed, using default voices');
        return this.voiceProfiles;
      }

      return response.data || this.voiceProfiles;

    } catch (error) {
      logger.error('Error fetching Gemini voices:', error);
      return this.voiceProfiles;
    }
  }

  /**
   * Select best voice for character personality
   */
  selectVoiceForPersonality(
    personality: string, 
    usedVoices: string[] = [],
    preferredGender?: 'male' | 'female'
  ): string {
    const availableVoices = this.voiceProfiles.filter(voice => 
      voice.personality === personality && 
      !usedVoices.includes(voice.id) &&
      (!preferredGender || voice.gender === preferredGender)
    );

    if (availableVoices.length > 0) {
      return availableVoices[0].id;
    }

    // Fallback to any voice with matching personality
    const fallbackVoices = this.voiceProfiles.filter(voice => 
      voice.personality === personality && 
      !usedVoices.includes(voice.id)
    );

    if (fallbackVoices.length > 0) {
      return fallbackVoices[0].id;
    }

    // Final fallback to any unused voice
    const unusedVoices = this.voiceProfiles.filter(voice => 
      !usedVoices.includes(voice.id)
    );

    return unusedVoices.length > 0 ? unusedVoices[0].id : this.voiceProfiles[0].id;
  }

  /**
   * Health check for Gemini Audio service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/voice/gemini/health', {
        method: 'GET'
      });

      return response.success;

    } catch (error) {
      logger.error('Gemini Audio health check failed:', error);
      return false;
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    logger.info('Gemini audio cache cleared');
  }

  /**
   * Get cache size information
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.audioCache.size,
      keys: Array.from(this.audioCache.keys())
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Call Gemini Audio API through backend
   */
  private async callGeminiAudioAPI(request: AudioGenerationRequest): Promise<Blob> {
    const response = await this.makeRequest('/voice/gemini/generate', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate audio');
    }

    // Convert base64 audio to blob
    const audioData = response.data.audioData;
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    return new Blob([audioBuffer], { type: 'audio/mpeg' });
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await api(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        return response;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`Gemini Audio API attempt ${attempt} failed:`, error);

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get voice profile by ID
   */
  private getVoiceProfile(voiceId: string): GeminiVoice | undefined {
    return this.voiceProfiles.find(voice => voice.id === voiceId);
  }

  /**
   * Convert personality to voice type
   */
  private getVoiceTypeFromPersonality(personality?: string): 'professional' | 'conversational' | 'narrative' | 'authoritative' {
    switch (personality) {
      case 'aggressive':
        return 'authoritative';
      case 'diplomatic':
        return 'professional';
      case 'cunning':
        return 'conversational';
      case 'idealistic':
        return 'narrative';
      case 'pragmatic':
        return 'professional';
      case 'charismatic':
        return 'conversational';
      default:
        return 'professional';
    }
  }

  /**
   * Generate cache key for audio
   */
  private getCacheKey(text: string, voiceId: string, settings?: GeminiAudioSettings): string {
    const settingsStr = settings ? JSON.stringify(settings) : '';
    const combined = `${text}-${voiceId}-${settingsStr}`;
    
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const geminiNativeAudio = new GeminiNativeAudioService();
export default geminiNativeAudio;
export type { GeminiAudioSettings, GeminiVoice };
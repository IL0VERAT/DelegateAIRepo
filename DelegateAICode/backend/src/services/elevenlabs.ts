/**
 * ElevenLabs Service for Delegate AI
 * ==================================
 * 
 * Advanced text-to-speech service using ElevenLabs API supporting:
 * - High-quality voice synthesis with multiple voices
 * - Voice cloning and custom voice creation
 * - Real-time streaming audio generation
 * - Voice settings optimization (stability, clarity, style)
 * - Multi-language support with language detection
 * - Production-ready error handling and monitoring
 * - Cost tracking and usage analytics
 */

/*import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ElevenLabs API configuration
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

// Voice configurations
const VOICE_PRESETS = {
  // Professional voices
  'rachel': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Professional female voice, clear and articulate',
    category: 'professional',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Female'
  },
  'drew': {
    id: '29vD33N1CtxCmqQRPOHJ',
    name: 'Drew',
    description: 'Professional male voice, warm and confident',
    category: 'professional',
    accent: 'American',
    age: 'Middle Aged',
    gender: 'Male'
  },
  'bella': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Friendly female voice, conversational and engaging',
    category: 'conversational',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Female'
  },
  'antoni': {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    description: 'Sophisticated male voice, articulate and professional',
    category: 'professional',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Male'
  },
  'elli': {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    description: 'Energetic female voice, youthful and dynamic',
    category: 'energetic',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Female'
  },
  'josh': {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Deep male voice, authoritative and calm',
    category: 'authoritative',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Male'
  },
  'arnold': {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Distinctive male voice, character-rich and memorable',
    category: 'character',
    accent: 'Austrian',
    age: 'Middle Aged',
    gender: 'Male'
  },
  'sam': {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    description: 'Versatile male voice, adaptable and clear',
    category: 'versatile',
    accent: 'American',
    age: 'Young Adult',
    gender: 'Male'
  }
};

// Language detection and voice mapping
const LANGUAGE_VOICE_MAPPING = {
  'en': ['rachel', 'drew', 'bella', 'antoni', 'josh', 'sam'],
  'es': ['bella', 'antoni'],
  'fr': ['antoni', 'bella'],
  'de': ['antoni', 'drew'],
  'it': ['bella', 'antoni'],
  'pt': ['bella', 'antoni'],
  'pl': ['antoni', 'drew'],
  'hi': ['antoni', 'bella'],
  'ja': ['antoni', 'bella'],
  'ko': ['antoni', 'bella'],
  'zh': ['antoni', 'bella']
};

interface VoiceSettings {
  stability: number;      // 0.0-1.0
  similarityBoost: number; // 0.0-1.0
  style?: number;         // 0.0-1.0 (for v2 voices)
  useSpeakerBoost?: boolean;
}

interface GenerateOptions {
  voiceId?: string;
  voiceSettings?: VoiceSettings;
  modelId?: string;
  languageCode?: string;
  speed?: number;
  optimizeStreamingLatency?: number;
  outputFormat?: 'mp3_22050_32' | 'mp3_44100_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
}

interface GenerateResponse {
  audioBuffer: Buffer;
  contentType: string;
  audioLength: number;
  cost: number;
  voiceId: string;
  modelId: string;
  responseTime: number;
}

interface VoiceInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  accent: string;
  age: string;
  gender: string;
  previewUrl?: string;
  isCustom: boolean;
  isAvailable: boolean;
}

/**
 * ElevenLabs Service Class
 */
/*export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY!;
    this.baseUrl = ELEVENLABS_API_BASE;
    
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
  }

  /**
   * Generate Speech from Text
   */
  /*async generateSpeech(
    text: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResponse> {
    const startTime = Date.now();
    
    try {
      const {
        voiceId = 'rachel',
        voiceSettings = {
          stability: 0.75,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true
        },
        modelId = 'eleven_multilingual_v2',
        speed = 1.0,
        optimizeStreamingLatency = 0,
        outputFormat = 'mp3_44100_128'
      } = options;

      // Get voice ID from preset if it's a preset name
      const actualVoiceId = VOICE_PRESETS[voiceId as keyof typeof VOICE_PRESETS]?.id || voiceId;

      logger.info('Generating ElevenLabs speech', {
        textLength: text.length,
        voiceId: actualVoiceId,
        modelId,
        speed,
        outputFormat
      });

      // Prepare request body
      const requestBody = {
        text: text.trim(),
        model_id: modelId,
        voice_settings: voiceSettings
      };

      // Make API request
      const response = await fetch(`${this.baseUrl}/text-to-speech/${actualVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          ...(speed !== 1.0 && { 'xi-speed': speed.toString() }),
          ...(optimizeStreamingLatency > 0 && { 'xi-optimize-streaming-latency': optimizeStreamingLatency.toString() }),
          ...(outputFormat && { 'xi-output-format': outputFormat })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const responseTime = Date.now() - startTime;
      
      // Calculate approximate cost (ElevenLabs charges per character)
      const cost = this.calculateCost(text.length);

      const result: GenerateResponse = {
        audioBuffer,
        contentType: response.headers.get('content-type') || 'audio/mpeg',
        audioLength: audioBuffer.length,
        cost,
        voiceId: actualVoiceId,
        modelId,
        responseTime
      };

      logger.info('ElevenLabs speech generation successful', {
        textLength: text.length,
        audioLength: result.audioLength,
        cost,
        responseTime,
        voiceId: actualVoiceId
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('ElevenLabs speech generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        textLength: text.length,
        voiceId: options.voiceId
      });
      throw error;
    }
  }

  /**
   * Generate Streaming Speech
   */
  /*async generateStreamingSpeech(
    text: string,
    options: GenerateOptions = {}
  ): Promise<ReadableStream> {
    try {
      const {
        voiceId = 'rachel',
        voiceSettings = {
          stability: 0.75,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true
        },
        modelId = 'eleven_multilingual_v2',
        speed = 1.0,
        optimizeStreamingLatency = 3
      } = options;

      const actualVoiceId = VOICE_PRESETS[voiceId as keyof typeof VOICE_PRESETS]?.id || voiceId;

      logger.info('Starting ElevenLabs streaming speech', {
        textLength: text.length,
        voiceId: actualVoiceId,
        modelId,
        speed
      });

      const response = await fetch(`${this.baseUrl}/text-to-speech/${actualVoiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          'xi-speed': speed.toString(),
          'xi-optimize-streaming-latency': optimizeStreamingLatency.toString()
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: modelId,
          voice_settings: voiceSettings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs streaming API error (${response.status}): ${errorText}`);
      }

      return response.body!;
    } catch (error) {
      logger.error('ElevenLabs streaming speech generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        textLength: text.length,
        voiceId: options.voiceId
      });
      throw error;
    }
  }

  /**
   * Get Available Voices
   */
  /*async getVoices(): Promise<VoiceInfo[]> {
    try {
      logger.info('Fetching ElevenLabs voices');

      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      const voices: VoiceInfo[] = [];

      // Add preset voices
      Object.entries(VOICE_PRESETS).forEach(([key, voice]) => {
        voices.push({
          id: voice.id,
          name: voice.name,
          description: voice.description,
          category: voice.category,
          accent: voice.accent,
          age: voice.age,
          gender: voice.gender,
          isCustom: false,
          isAvailable: true
        });
      });

      // Add custom voices from API
      if (data.voices) {
        data.voices.forEach((voice: any) => {
          // Skip if already in presets
          if (Object.values(VOICE_PRESETS).some(preset => preset.id === voice.voice_id)) {
            return;
          }

          voices.push({
            id: voice.voice_id,
            name: voice.name,
            description: voice.description || 'Custom voice',
            category: voice.category || 'custom',
            accent: voice.labels?.accent || 'Unknown',
            age: voice.labels?.age || 'Unknown',
            gender: voice.labels?.gender || 'Unknown',
            previewUrl: voice.preview_url,
            isCustom: true,
            isAvailable: voice.available_for_tiers?.includes('free') || voice.available_for_tiers?.includes('starter')
          });
        });
      }

      logger.info('Successfully fetched ElevenLabs voices', {
        totalVoices: voices.length,
        presetVoices: Object.keys(VOICE_PRESETS).length,
        customVoices: voices.filter(v => v.isCustom).length
      });

      return voices;
    } catch (error) {
      logger.error('Failed to fetch ElevenLabs voices', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return preset voices as fallback
      return Object.entries(VOICE_PRESETS).map(([key, voice]) => ({
        id: voice.id,
        name: voice.name,
        description: voice.description,
        category: voice.category,
        accent: voice.accent,
        age: voice.age,
        gender: voice.gender,
        isCustom: false,
        isAvailable: true
      }));
    }
  }

  /**
   * Get Voice Details
   */
  /*async getVoiceDetails(voiceId: string): Promise<VoiceInfo | null> {
    try {
      // Check if it's a preset voice first
      const presetVoice = Object.entries(VOICE_PRESETS).find(
        ([key, voice]) => voice.id === voiceId || key === voiceId
      );

      if (presetVoice) {
        const [key, voice] = presetVoice;
        return {
          id: voice.id,
          name: voice.name,
          description: voice.description,
          category: voice.category,
          accent: voice.accent,
          age: voice.age,
          gender: voice.gender,
          isCustom: false,
          isAvailable: true
        };
      }

      // Fetch from API for custom voices
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch voice details: ${response.status}`);
      }

      const voice = await response.json();
      
      return {
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || 'Custom voice',
        category: voice.category || 'custom',
        accent: voice.labels?.accent || 'Unknown',
        age: voice.labels?.age || 'Unknown',
        gender: voice.labels?.gender || 'Unknown',
        previewUrl: voice.preview_url,
        isCustom: true,
        isAvailable: voice.available_for_tiers?.includes('free') || voice.available_for_tiers?.includes('starter')
      };
    } catch (error) {
      logger.error('Failed to fetch voice details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        voiceId
      });
      return null;
    }
  }

  /**
   * Detect Language and Suggest Voice
   */
  /*detectLanguageAndSuggestVoice(text: string): { language: string; voiceId: string; confidence: number } {
    // Simple language detection based on character patterns
    // In production, you might want to use a proper language detection library
    
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëîïôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãáàâéêíóôõú]/i,
      'pl': /[ąćęłńóśźż]/i
    };

    let detectedLanguage = 'en';
    let confidence = 0.5;

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const matchRatio = matches.length / text.length;
        if (matchRatio > confidence) {
          detectedLanguage = lang;
          confidence = Math.min(0.9, 0.5 + matchRatio);
        }
      }
    }

    // Get available voices for the detected language
    const availableVoices = LANGUAGE_VOICE_MAPPING[detectedLanguage as keyof typeof LANGUAGE_VOICE_MAPPING] || ['rachel'];
    const suggestedVoice = availableVoices[0];

    return {
      language: detectedLanguage,
      voiceId: suggestedVoice,
      confidence
    };
  }

  /**
   * Calculate Cost (Approximate)
   */
  /*private calculateCost(characterCount: number): number {
    // ElevenLabs pricing (approximate): $0.30 per 1K characters for standard voices
    const costPer1000Chars = 0.30;
    return (characterCount / 1000) * costPer1000Chars;
  }

  /**
   * Get Optimal Voice Settings for Different Use Cases
   */
  /*getOptimalVoiceSettings(useCase: 'conversation' | 'narration' | 'presentation' | 'character'): VoiceSettings {
    switch (useCase) {
      case 'conversation':
        return {
          stability: 0.70,
          similarityBoost: 0.80,
          style: 0.15,
          useSpeakerBoost: true
        };
      case 'narration':
        return {
          stability: 0.85,
          similarityBoost: 0.75,
          style: 0.05,
          useSpeakerBoost: false
        };
      case 'presentation':
        return {
          stability: 0.90,
          similarityBoost: 0.70,
          style: 0.10,
          useSpeakerBoost: true
        };
      case 'character':
        return {
          stability: 0.60,
          similarityBoost: 0.85,
          style: 0.40,
          useSpeakerBoost: true
        };
      default:
        return {
          stability: 0.75,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true
        };
    }
  }

  /**
   * Validate API Key
   */
  /*async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.ok;
    } catch (error) {
      logger.error('ElevenLabs API key validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Get Usage Statistics
   */
 /* async getUsageStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get usage stats: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        characterCount: data.character_count || 0,
        characterLimit: data.character_limit || 0,
        canExtendCharacterLimit: data.can_extend_character_limit || false,
        allowedToExtendCharacterLimit: data.allowed_to_extend_character_limit || false,
        nextCharacterCountResetUnix: data.next_character_count_reset_unix || 0,
        voiceLimit: data.voice_limit || 0,
        maxVoiceAddEdits: data.max_voice_add_edits || 0,
        voiceAddEditCounter: data.voice_add_edit_counter || 0,
        professionalVoiceLimit: data.professional_voice_limit || 0,
        canExtendVoiceLimit: data.can_extend_voice_limit || false,
        canUseInstantVoiceCloning: data.can_use_instant_voice_cloning || false,
        availableModels: data.available_models || []
      };
    } catch (error) {
      logger.error('Failed to get ElevenLabs usage statistics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        characterCount: 0,
        characterLimit: 0,
        error: 'Failed to fetch usage statistics'
      };
    }
  }

  /**
   * Health Check
   */
  /*async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: 'healthy',
          details: {
            responseTime,
            apiKeyValid: true,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          status: 'unhealthy',
          details: {
            responseTime,
            apiKeyValid: false,
            httpStatus: response.status,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          apiKeyValid: false,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();

// Export types and presets
export type {
  VoiceSettings,
  GenerateOptions,
  GenerateResponse,
  VoiceInfo
};

export { VOICE_PRESETS, LANGUAGE_VOICE_MAPPING }; */
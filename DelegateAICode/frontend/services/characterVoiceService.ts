/**
 * CHARACTER VOICE SERVICE - GEMINI ONLY
 * =====================================
 * 
 * Production-ready service for managing character voices in Model UN campaigns.
 * Uses ONLY Gemini Native Audio with browser fallback (NO OpenAI).
 */

import { api } from './api';
import { logger } from '../utils/logger';
import { geminiNativeAudio, type GeminiAudioSettings, type GeminiVoice } from './geminiNativeAudio';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface VoiceSettings {
  enabled: boolean;
  autoplay: boolean;
  speechRate: number;
  volume: number;
  characterVoices: Record<string, string>;
}

interface CampaignSession {
  id: string;
  playerCharacter: any;
  aiCharacters: any[];
  voiceSettings: VoiceSettings;
}

interface VoiceAssignment {
  characterId: string;
  voiceId: string;
  voiceName: string;
  provider: 'gemini' | 'browser';
}

// ============================================================================
// CHARACTER VOICE SERVICE CLASS
// ============================================================================

class CharacterVoiceService {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;
  private voiceCache = new Map<string, Blob>();
  private retryAttempts = 3;
  private retryDelay = 1000;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the voice service
   */
  private async initializeService(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        logger.info('Initializing Character Voice Service...');

        // Check if Gemini Native Audio is available
        const geminiHealthy = await geminiNativeAudio.healthCheck();
        
        // Check if browser speech synthesis is available
        const browserSupported = 'speechSynthesis' in window;

        if (!geminiHealthy && !browserSupported) {
          logger.warn('No voice services available');
        } else {
          logger.info('Voice service initialized successfully', {
            gemini: geminiHealthy,
            browser: browserSupported
          });
        }

        this.initialized = true;

      } catch (error) {
        logger.error('Failed to initialize voice service:', error);
        // Set as initialized anyway to prevent blocking
        this.initialized = true;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Check if the voice service is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Wait for the service to be ready
   */
  async waitForReady(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    ready: boolean;
    gemini: boolean;
    browser: boolean;
    cacheSize: number;
  }> {
    await this.waitForReady();
    
    const geminiHealthy = await geminiNativeAudio.healthCheck();
    const browserSupported = 'speechSynthesis' in window;

    return {
      ready: this.initialized,
      gemini: geminiHealthy,
      browser: browserSupported,
      cacheSize: this.voiceCache.size
    };
  }

  /**
   * Assign voices to all characters in a campaign session
   */
  async assignVoices(session: CampaignSession): Promise<void> {
    await this.waitForReady();

    try {
      logger.info('Assigning Gemini voices for campaign session:', session.id);

      // Get available Gemini voices
      const availableVoices = await geminiNativeAudio.getAvailableVoices();
      
      // Assign voices to AI characters based on personality
      const voiceAssignments: VoiceAssignment[] = [];
      const usedVoiceIds: string[] = [];
      
      for (let i = 0; i < session.aiCharacters.length; i++) {
        const character = session.aiCharacters[i];
        
        // Select voice based on character personality
        const voiceId = geminiNativeAudio.selectVoiceForPersonality(
          character.personality,
          usedVoiceIds,
          this.getPreferredGender(character)
        );
        
        character.voiceId = voiceId;
        usedVoiceIds.push(voiceId);
        
        const voice = availableVoices.find(v => v.id === voiceId);
        voiceAssignments.push({
          characterId: character.id,
          voiceId: voiceId,
          voiceName: voice?.name || 'Unknown Voice',
          provider: 'gemini'
        });
      }

      // Save voice assignments to backend
      await this.saveVoiceAssignments(session.id, voiceAssignments);

      logger.info('Successfully assigned Gemini voices to all characters');

    } catch (error) {
      logger.error('Error assigning Gemini voices:', error);
      // Fallback to default voice assignments
      this.assignFallbackVoices(session);
    }
  }

  /**
   * Speak text using character's assigned Gemini voice
   */
  async speak(text: string, characterVoiceId: string, voiceSettings?: VoiceSettings): Promise<void> {
    await this.waitForReady();

    try {
      if (!voiceSettings?.enabled) {
        return;
      }

      logger.info('Generating speech with Gemini Native Audio for voice:', characterVoiceId);

      // Check cache first
      const cacheKey = `${characterVoiceId}-${this.hashText(text)}`;
      let audioBlob = this.voiceCache.get(cacheKey);

      if (!audioBlob) {
        // Generate speech using Gemini Native Audio
        audioBlob = await this.generateSpeechWithGemini(text, characterVoiceId, voiceSettings);
        
        // Cache the audio for future use
        this.voiceCache.set(cacheKey, audioBlob);
      }

      // Play the audio
      await this.playAudio(audioBlob, voiceSettings);

      logger.info('Successfully played Gemini-generated speech');

    } catch (error) {
      logger.error('Error speaking text with Gemini:', error);
      // Fallback to browser speech synthesis only
      this.browserSpeak(text, voiceSettings);
    }
  }

  /**
   * Generate speech using Gemini Native Audio
   */
  private async generateSpeechWithGemini(
    text: string, 
    voiceId: string, 
    settings?: VoiceSettings
  ): Promise<Blob> {
    const geminiSettings: GeminiAudioSettings = {
      speed: settings?.speechRate || 1.0,
      volume: settings?.volume || 0.8,
      voiceType: 'professional', // Default for diplomatic context
      language: 'en-US'
    };

    return await geminiNativeAudio.generateSpeech(text, voiceId, geminiSettings);
  }

  /**
   * Browser speech synthesis fallback (only fallback now)
   */
  private browserSpeak(text: string, settings?: VoiceSettings): void {
    if ('speechSynthesis' in window) {
      logger.info('Using browser speech synthesis as fallback');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings?.speechRate || 1.0;
      utterance.volume = settings?.volume || 0.8;
      
      // Try to select a professional-sounding voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Alex') || 
         voice.name.includes('Samantha') || 
         voice.name.includes('Daniel') ||
         voice.name.includes('Fiona') ||
         voice.name.includes('Karen'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        logger.info('Using preferred browser voice:', preferredVoice.name);
      }
      
      speechSynthesis.speak(utterance);
    } else {
      logger.warn('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Play audio blob
   */
  private async playAudio(audioBlob: Blob, settings?: VoiceSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      audio.volume = settings?.volume || 0.8;
      audio.playbackRate = settings?.speechRate || 1.0;

      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Stop audio elements
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    this.isPlaying = false;
    logger.info('Stopped all voice playback');
  }

  /**
   * Set voice settings
   */
  setSettings(settings: Partial<VoiceSettings>): void {
    // This method is for compatibility with voice interface
    logger.info('Voice settings updated:', settings);
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<GeminiVoice[]> {
    await this.waitForReady();
    return await geminiNativeAudio.getAvailableVoices();
  }

  /**
   * Get voices filtered by gender
   */
  async getVoicesByGender(gender?: 'male' | 'female'): Promise<GeminiVoice[]> {
    await this.waitForReady();
    
    try {
      const allVoices = await geminiNativeAudio.getAvailableVoices();
      
      if (!gender) {
        return allVoices;
      }
      
      // Filter voices by gender if specified
      return allVoices.filter(voice => {
        // Use voice metadata or name patterns to determine gender
        // This is a simplified implementation - in production, you'd use proper voice metadata
        if (gender === 'male') {
          return voice.name.toLowerCase().includes('male') || 
                 voice.name.includes('Daniel') ||
                 voice.name.includes('Alex') ||
                 voice.name.includes('Tom') ||
                 voice.name.includes('John') ||
                 voice.gender === 'male';
        } else if (gender === 'female') {
          return voice.name.toLowerCase().includes('female') || 
                 voice.name.includes('Samantha') ||
                 voice.name.includes('Fiona') ||
                 voice.name.includes('Karen') ||
                 voice.name.includes('Sarah') ||
                 voice.gender === 'female';
        }
        
        return true;
      });
      
    } catch (error) {
      logger.error('Error getting voices by gender:', error);
      return [];
    }
  }

  /**
   * Test voice generation
   */
  async testVoice(voiceId: string, testText: string = 'Hello, this is a voice test.'): Promise<boolean> {
    try {
      await this.speak(testText, voiceId, {
        enabled: true,
        autoplay: true,
        speechRate: 1.0,
        volume: 0.5,
        characterVoices: {}
      });
      return true;
    } catch (error) {
      logger.error('Voice test failed:', error);
      return false;
    }
  }

  /**
   * Save voice assignments to backend
   */
  private async saveVoiceAssignments(sessionId: string, assignments: VoiceAssignment[]): Promise<void> {
    try {
      await this.makeRequest('/voice/save-assignments', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionId,
          assignments: assignments
        })
      });
    } catch (error) {
      logger.error('Error saving voice assignments:', error);
    }
  }

  /**
   * Clear audio queue and cache
   */
  clearQueue(): void {
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioQueue = [];
    this.isPlaying = false;
    this.voiceCache.clear();
    
    // Clear Gemini cache as well
    geminiNativeAudio.clearCache();
  }

  /**
   * Get health status of voice services
   */
  async getHealthStatus(): Promise<{ gemini: boolean; browser: boolean }> {
    const geminiHealthy = await geminiNativeAudio.healthCheck();
    const browserHealthy = 'speechSynthesis' in window;
    
    return {
      gemini: geminiHealthy,
      browser: browserHealthy
    };
  }

  /**
   * Get cache information
   */
  getCacheInfo(): { size: number; geminiCache: any } {
    return {
      size: this.voiceCache.size,
      geminiCache: geminiNativeAudio.getCacheInfo()
    };
  }

  /**
   * Get preferred gender for character (can be enhanced with character data)
   */
  private getPreferredGender(character: any): 'male' | 'female' | undefined {
    // Logic to determine preferred gender based on character name or other data
    // For now, return undefined to let the service choose
    return undefined;
  }

  /**
   * Hash text for caching
   */
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
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
        logger.warn(`Voice API request attempt ${attempt} failed:`, error);

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
   * Assign fallback voices when Gemini fails
   */
  private assignFallbackVoices(session: CampaignSession): void {
    logger.info('Assigning fallback browser voices');
    
    session.aiCharacters.forEach((character, index) => {
      character.voiceId = `browser-fallback-${index}`;
    });
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const characterVoiceService = new CharacterVoiceService();
export default characterVoiceService;
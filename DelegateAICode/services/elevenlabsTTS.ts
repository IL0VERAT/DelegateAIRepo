/**
 * ELEVENLABS TTS SERVICE - REMOVED
 * =================================
 * 
 * This service has been removed in favor of Gemini 2.5 Native Audio.
 * Keeping stub for compatibility but all functionality moved to Gemini.
 */

// Stub interface for compatibility
export interface ElevenLabsVoiceSettings {
  speed?: number;
  volume?: number;
}

// Stub class for compatibility
class ElevenLabsTTSStub {
  async generateSpeech(text: string, voiceId: string, settings?: ElevenLabsVoiceSettings): Promise<Blob> {
    throw new Error('ElevenLabs TTS has been removed. Please use Gemini Native Audio instead.');
  }

  async getAvailableVoices(): Promise<any[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}

// Single export to fix build errors
export const elevenlabsTTS = new ElevenLabsTTSStub();
export default elevenlabsTTS;
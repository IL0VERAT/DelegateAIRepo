/**
 * OPENAI TTS SERVICE - REMOVED
 * =============================
 * 
 * This service has been removed in favor of Gemini Native Audio only.
 * Keeping stub for compatibility but all functionality moved to Gemini.
 */

// Stub interface for compatibility
export interface OpenAITTSSettings {
  speed?: number;
  volume?: number;
}

// Stub class for compatibility
class OpenAITTSStub {
  async generateSpeech(text: string, voice: string, settings?: OpenAITTSSettings): Promise<Blob> {
    throw new Error('OpenAI TTS has been removed. Please use Gemini Native Audio instead.');
  }

  async getAvailableVoices(): Promise<any[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}

// Single export to fix build errors
export const openaiTTS = new OpenAITTSStub();
export default openaiTTS;
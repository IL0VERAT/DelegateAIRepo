/**
 * AUDIO PLAYER SERVICE WITH LOCAL STORAGE
 * =======================================
 * 
 * Enhanced audio player service that handles audio playback
 * with local storage support and comprehensive controls.
 */

export interface AudioPlayerConfig {
  volume?: number;
  autoplay?: boolean;
  loop?: boolean;
  crossOrigin?: string;
  preload?: 'none' | 'metadata' | 'auto';
}

export interface AudioPlayerCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVolumeChange?: (volume: number) => void;
}

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private config: AudioPlayerConfig;
  private callbacks: AudioPlayerCallbacks = {};
  private isPlaying = false;
  private currentSource: string | null = null;
  private audioCache: Map<string, string> = new Map();

  constructor(config: AudioPlayerConfig = {}) {
    this.config = {
      volume: 1.0,
      autoplay: false,
      loop: false,
      crossOrigin: 'anonymous',
      preload: 'metadata',
      ...config
    };
  }

  // Set callbacks for various events
  set onPlay(callback: () => void) {
    this.callbacks.onPlay = callback;
  }

  set onPause(callback: () => void) {
    this.callbacks.onPause = callback;
  }

  set onStop(callback: () => void) {
    this.callbacks.onStop = callback;
  }

  set onEnded(callback: () => void) {
    this.callbacks.onEnded = callback;
  }

  set onError(callback: (error: Error) => void) {
    this.callbacks.onError = callback;
  }

  set onLoadStart(callback: () => void) {
    this.callbacks.onLoadStart = callback;
  }

  set onLoadEnd(callback: () => void) {
    this.callbacks.onLoadEnd = callback;
  }

  set onTimeUpdate(callback: (currentTime: number, duration: number) => void) {
    this.callbacks.onTimeUpdate = callback;
  }

  set onVolumeChange(callback: (volume: number) => void) {
    this.callbacks.onVolumeChange = callback;
  }

  async loadAudio(source: string | Blob): Promise<void> {
    try {
      // Create new audio element
      this.audio = new Audio();
      
      // Set up audio element configuration
      this.audio.volume = this.config.volume || 1.0;
      this.audio.autoplay = this.config.autoplay || false;
      this.audio.loop = this.config.loop || false;
      this.audio.crossOrigin = this.config.crossOrigin || 'anonymous';
      this.audio.preload = this.config.preload || 'metadata';

      // Set up event listeners
      this.setupEventListeners();

      // Handle different source types
      if (typeof source === 'string') {
        await this.loadFromUrl(source);
      } else if (source instanceof Blob) {
        await this.loadFromBlob(source);
      } else {
        throw new Error('Invalid audio source type');
      }

    } catch (error) {
      const loadError = new Error(`Failed to load audio: ${error}`);
      if (this.callbacks.onError) {
        this.callbacks.onError(loadError);
      }
      throw loadError;
    }
  }

  async playAudio(source?: string | Blob): Promise<void> {
    try {
      // Load new audio if source provided
      if (source) {
        await this.loadAudio(source);
      }

      if (!this.audio) {
        throw new Error('No audio loaded');
      }

      // Reset to beginning if audio has ended
      if (this.audio.ended) {
        this.audio.currentTime = 0;
      }

      await this.audio.play();
      this.isPlaying = true;

    } catch (error) {
      const playError = new Error(`Failed to play audio: ${error}`);
      if (this.callbacks.onError) {
        this.callbacks.onError(playError);
      }
      throw playError;
    }
  }

  async pause(): Promise<void> {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      
      if (this.callbacks.onStop) {
        this.callbacks.onStop();
      }
    }
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.config.volume = clampedVolume;
    
    if (this.audio) {
      this.audio.volume = clampedVolume;
    }
    
    if (this.callbacks.onVolumeChange) {
      this.callbacks.onVolumeChange(clampedVolume);
    }
  }

  getVolume(): number {
    return this.config.volume || 1.0;
  }

  setCurrentTime(time: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, time));
    }
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying && !this.audio?.paused;
  }

  isPaused(): boolean {
    return this.audio?.paused || false;
  }

  isEnded(): boolean {
    return this.audio?.ended || false;
  }

  private async loadFromUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      // Check if URL is a local storage reference
      if (url.startsWith('local://')) {
        this.loadFromLocalStorage(url).then(resolve).catch(reject);
        return;
      }

      this.audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      this.audio.addEventListener('error', () => reject(new Error('Failed to load audio from URL')), { once: true });
      
      this.audio.src = url;
      this.currentSource = url;
    });
  }

  private async loadFromBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      const url = URL.createObjectURL(blob);
      
      this.audio.addEventListener('canplaythrough', () => {
        resolve();
      }, { once: true });
      
      this.audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio from blob'));
      }, { once: true });
      
      this.audio.src = url;
      this.currentSource = url;
    });
  }

  private async loadFromLocalStorage(localUrl: string): Promise<void> {
    try {
      const audioId = localUrl.replace('local://', '');
      const data = localStorage.getItem(`delegate_ai_audio_${audioId}`);
      
      if (!data) {
        throw new Error('Audio not found in local storage');
      }

      const parsed = JSON.parse(data);
      const base64Audio = parsed.chunks.join('');
      
      // Convert base64 back to blob
      const byteCharacters = atob(base64Audio.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: parsed.mimeType });
      
      await this.loadFromBlob(blob);
      
    } catch (error) {
      throw new Error(`Failed to load audio from local storage: ${error}`);
    }
  }

  private setupEventListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      if (this.callbacks.onPlay) {
        this.callbacks.onPlay();
      }
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.callbacks.onPause) {
        this.callbacks.onPause();
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.callbacks.onEnded) {
        this.callbacks.onEnded();
      }
    });

    this.audio.addEventListener('error', (event) => {
      this.isPlaying = false;
      const error = new Error(`Audio playback error: ${event}`);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    this.audio.addEventListener('loadstart', () => {
      if (this.callbacks.onLoadStart) {
        this.callbacks.onLoadStart();
      }
    });

    this.audio.addEventListener('canplaythrough', () => {
      if (this.callbacks.onLoadEnd) {
        this.callbacks.onLoadEnd();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate(this.getCurrentTime(), this.getDuration());
      }
    });

    this.audio.addEventListener('volumechange', () => {
      if (this.callbacks.onVolumeChange) {
        this.callbacks.onVolumeChange(this.audio?.volume || 0);
      }
    });
  }

  // Cache management
  cacheAudio(key: string, source: string): void {
    this.audioCache.set(key, source);
  }

  getCachedAudio(key: string): string | null {
    return this.audioCache.get(key) || null;
  }

  clearCache(): void {
    this.audioCache.clear();
  }

  // Configuration updates
  updateConfig(newConfig: Partial<AudioPlayerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.audio) {
      if (newConfig.volume !== undefined) {
        this.audio.volume = newConfig.volume;
      }
      if (newConfig.loop !== undefined) {
        this.audio.loop = newConfig.loop;
      }
    }
  }

  getConfig(): AudioPlayerConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      
      // Revoke object URL if it exists
      if (this.currentSource && this.currentSource.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentSource);
      }
      
      this.audio = null;
    }
    
    this.clearCache();
    this.callbacks = {};
    this.isPlaying = false;
    this.currentSource = null;
  }

  // Static methods
  static isSupported(): boolean {
    try {
      return !!(window.Audio && new Audio().canPlayType);
    } catch {
      return false;
    }
  }

  static getSupportedFormats(): string[] {
    if (!AudioPlayer.isSupported()) {
      return [];
    }

    const audio = new Audio();
    const formats = [
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ];

    return formats.filter(format => {
      const support = audio.canPlayType(format);
      return support === 'probably' || support === 'maybe';
    });
  }
}

export default AudioPlayer;
/**
 * AUDIO RECORDER SERVICE WITH LOCAL STORAGE
 * =========================================
 * 
 * Enhanced audio recording service that works with local storage
 * and provides comprehensive voice recording capabilities.
 */

export interface AudioRecorderConfig {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
  noiseReduction?: boolean;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
}

export interface AudioRecorderCallbacks {
  onDataAvailable?: (audioBlob: Blob) => void;
  onSilenceDetected?: () => void;
  onVoiceDetected?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onStop?: () => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private isRecording = false;
  private audioChunks: Blob[] = [];
  private config: AudioRecorderConfig;
  private callbacks: AudioRecorderCallbacks = {};
  
  // Voice activity detection
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private voiceDetectionThreshold = 30; // Adjust based on environment
  private silenceTimeout = 2000; // 2 seconds of silence

  constructor(config: AudioRecorderConfig = {}) {
    this.config = {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true,
      ...config
    };
  }

  // Set callbacks for various events
  set onDataAvailable(callback: (audioBlob: Blob) => void) {
    this.callbacks.onDataAvailable = callback;
  }

  set onSilenceDetected(callback: () => void) {
    this.callbacks.onSilenceDetected = callback;
  }

  set onVoiceDetected(callback: () => void) {
    this.callbacks.onVoiceDetected = callback;
  }

  set onError(callback: (error: Error) => void) {
    this.callbacks.onError = callback;
  }

  set onStart(callback: () => void) {
    this.callbacks.onStart = callback;
  }

  set onStop(callback: () => void) {
    this.callbacks.onStop = callback;
  }

  async start(): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      // Request microphone access with audio constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseReduction,
          autoGainControl: this.config.autoGainControl
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set up audio context for voice activity detection
      this.setupVoiceActivityDetection();

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType()
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          // Call callback if provided
          if (this.callbacks.onDataAvailable) {
            this.callbacks.onDataAvailable(event.data);
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.audioChunks = [];

      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }

      console.log('Audio recording started');

    } catch (error) {
      const recordingError = new Error(`Failed to start recording: ${error}`);
      if (this.callbacks.onError) {
        this.callbacks.onError(recordingError);
      }
      throw recordingError;
    }
  }

  async stop(): Promise<Blob | null> {
    try {
      if (!this.isRecording || !this.mediaRecorder) {
        return null;
      }

      return new Promise((resolve) => {
        if (this.mediaRecorder) {
          this.mediaRecorder.onstop = () => {
            const audioBlob = this.createAudioBlob();
            this.cleanup();
            resolve(audioBlob);
          };
          
          this.mediaRecorder.stop();
        } else {
          resolve(null);
        }
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.cleanup();
      return null;
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.resume();
    }
  }

  isActive(): boolean {
    return this.isRecording;
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average amplitude
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    return sum / this.dataArray.length;
  }

  private setupVoiceActivityDetection(): void {
    try {
      if (!this.stream) return;

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Connect stream to analyser
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      // Create data array for frequency data
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      // Start voice activity detection
      this.startVoiceActivityDetection();
      
    } catch (error) {
      console.warn('Failed to set up voice activity detection:', error);
    }
  }

  private startVoiceActivityDetection(): void {
    if (!this.analyser || !this.dataArray) return;

    const detectVoiceActivity = () => {
      if (!this.isRecording) return;

      const audioLevel = this.getAudioLevel();
      
      if (audioLevel > this.voiceDetectionThreshold) {
        // Voice detected
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        
        if (this.callbacks.onVoiceDetected) {
          this.callbacks.onVoiceDetected();
        }
      } else {
        // Silence detected
        if (!this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            if (this.callbacks.onSilenceDetected) {
              this.callbacks.onSilenceDetected();
            }
          }, this.silenceTimeout);
        }
      }

      // Continue monitoring
      requestAnimationFrame(detectVoiceActivity);
    };

    detectVoiceActivity();
  }

  private handleRecordingStop(): void {
    this.isRecording = false;
    
    if (this.callbacks.onStop) {
      this.callbacks.onStop();
    }
    
    console.log('Audio recording stopped');
  }

  private createAudioBlob(): Blob {
    const mimeType = this.getSupportedMimeType();
    return new Blob(this.audioChunks, { type: mimeType });
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Default fallback
  }

  private cleanup(): void {
    // Clear timers
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(console.warn);
      this.audioContext = null;
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Reset state
    this.mediaRecorder = null;
    this.analyser = null;
    this.dataArray = null;
    this.isRecording = false;
    this.audioChunks = [];
  }

  // Static method to check if audio recording is supported
  static async isSupported(): Promise<boolean> {
    return !!(navigator.mediaDevices && 
             await navigator.mediaDevices.getUserMedia() && 
             window.MediaRecorder);
  }

  // Static method to request microphone permission
  static async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Static method to check current permission state
  static async checkPermissions(): Promise<PermissionState> {
    try {
      if (!navigator.permissions) {
        // Fallback: try to access microphone to test permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          return 'granted';
        } catch (error) {
          return 'denied';
        }
      }

      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (error) {
      console.warn('Failed to check microphone permissions:', error);
      return 'prompt';
    }
  }

  // Static method to get available audio input devices
  static async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to enumerate audio devices:', error);
      return [];
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<AudioRecorderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): AudioRecorderConfig {
    return { ...this.config };
  }

  // Set voice detection threshold
  setVoiceDetectionThreshold(threshold: number): void {
    this.voiceDetectionThreshold = Math.max(0, Math.min(100, threshold));
  }

  // Set silence timeout
  setSilenceTimeout(timeout: number): void {
    this.silenceTimeout = Math.max(500, timeout); // Minimum 500ms
  }
}

// Export as AudioRecorderService for backwards compatibility
export const AudioRecorderService = AudioRecorder;

export default AudioRecorder;
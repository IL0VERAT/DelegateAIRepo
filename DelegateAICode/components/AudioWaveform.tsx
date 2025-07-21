/**
 * AUDIO WAVEFORM VISUALIZATION COMPONENT
 * =====================================
 * 
 * Real-time audio waveform visualization during speaking states:
 * - Web Audio API integration for frequency analysis
 * - Personality-aware colors and animations
 * - Smooth 60fps rendering with requestAnimationFrame
 * - Accessibility-compliant with proper ARIA labels
 * - Hardware-accelerated canvas rendering
 * - Automatic cleanup and memory management
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useApp } from './AppContext';

interface AudioWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
  audioStream?: MediaStream;
  personality?: string;
  className?: string;
  width?: number;
  height?: number;
}

interface WaveformData {
  frequencies: Uint8Array;
  timeData: Uint8Array;
  volume: number;
}

export function AudioWaveform({
  isActive,
  isSpeaking,
  audioStream,
  personality = 'balanced',
  className = '',
  width = 200,
  height = 60
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { debateMode } = useApp(); 
  const activePersonality = personality || debateMode;

  // Personality-aware colors for waveforms
  const personalityColors = {
    collaborative: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7'
    },
    gentle: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD'
    },
    balanced: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD'
    },
    challenging: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FCD34D'
    },
    aggressive: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5'
    }
  };

  const colors = personalityColors[activePersonality as keyof typeof personalityColors] || personalityColors.balanced;

  /**
   * Initialize Web Audio API for waveform analysis
   */
  const initializeAudioAnalysis = useCallback(async () => {
    if (!audioStream || !canvasRef.current) return;

    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }

      audioContextRef.current = new AudioContext();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect audio stream to analyser
      sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
      sourceRef.current.connect(analyserRef.current);

      setIsInitialized(true);
      console.log('✅ Audio waveform analysis initialized');
    } catch (error) {
      console.warn('Failed to initialize audio analysis:', error);
    }
  }, [audioStream]);

  /**
   * Generate mock waveform data for demo mode
   */
  const generateMockData = useCallback((): WaveformData => {
    const bufferLength = 128;
    const frequencies = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    // Generate realistic-looking waveform data
    const time = Date.now() * 0.001;
    for (let i = 0; i < bufferLength; i++) {
      const freq = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
      const amplitude = isSpeaking ? Math.random() * 0.8 + 0.2 : Math.random() * 0.1;
      
      frequencies[i] = Math.floor(freq * amplitude * 255);
      timeData[i] = Math.floor(Math.sin(time * 4 + i * 0.2) * amplitude * 128 + 128);
    }

    const volume = isSpeaking ? Math.random() * 0.6 + 0.4 : Math.random() * 0.1;
    
    return { frequencies, timeData, volume };
  }, [isSpeaking]);

  /**
   * Get real-time audio data from analyser
   */
  const getAudioData = useCallback((): WaveformData | null => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const frequencies = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(frequencies);
    analyserRef.current.getByteTimeDomainData(timeData);

    // Calculate volume level
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += Math.abs(timeData[i] - 128);
    }
    const volume = sum / (timeData.length * 128);

    return { frequencies, timeData, volume };
  }, []);

  /**
   * Draw waveform visualization on canvas
   */
  const drawWaveform = useCallback((data: WaveformData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    const { frequencies, timeData, volume } = data;
    const barCount = Math.min(frequencies.length / 2, 32); // Limit bars for clean visualization
    const barWidth = width / barCount;
    const centerY = height / 2;

    // Draw frequency bars
    for (let i = 0; i < barCount; i++) {
      const freqIndex = Math.floor((i / barCount) * frequencies.length);
      const amplitude = frequencies[freqIndex] / 255;
      const barHeight = amplitude * (height * 0.8);

      // Create gradient based on personality
      const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
      gradient.addColorStop(0, colors.accent);
      gradient.addColorStop(0.5, colors.primary);
      gradient.addColorStop(1, colors.secondary);

      ctx.fillStyle = gradient;
      
      // Add glow effect during active speaking
      if (isSpeaking && volume > 0.1) {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw symmetric bars
      const x = i * barWidth;
      const barHeightAnimated = barHeight * (0.3 + volume * 0.7);
      
      ctx.fillRect(
        x + barWidth * 0.1,
        centerY - barHeightAnimated / 2,
        barWidth * 0.8,
        barHeightAnimated
      );
    }

    // Draw subtle connecting line for continuity
    if (isSpeaking) {
      ctx.strokeStyle = `${colors.primary}40`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * frequencies.length);
        const amplitude = frequencies[freqIndex] / 255;
        const y = centerY - (amplitude * height * 0.4);
        
        if (i === 0) {
          ctx.moveTo(i * barWidth + barWidth / 2, y);
        } else {
          ctx.lineTo(i * barWidth + barWidth / 2, y);
        }
      }
      
      ctx.stroke();
    }
  }, [width, height, colors, isSpeaking]);

  /**
   * Animation loop for waveform rendering
   */
  const animate = useCallback(() => {
    if (!isActive || !canvasRef.current) return;

    // Get audio data (real or mock)
    const audioData = isInitialized ? getAudioData() : generateMockData();
    
    if (audioData) {
      drawWaveform(audioData);
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, isInitialized, getAudioData, generateMockData, drawWaveform]);

  /**
   * Initialize audio analysis when audio stream is available
   */
  useEffect(() => {
    if (isActive && audioStream) {
      initializeAudioAnalysis();
    }
  }, [isActive, audioStream, initializeAudioAnalysis]);

  /**
   * Start/stop animation based on active state
   */
  useEffect(() => {
    if (isActive) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, animate]);

  /**
   * Cleanup audio resources
   */
  useEffect(() => {
    return () => {
      // Cleanup animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Cleanup audio resources
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      setIsInitialized(false);
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className={`audio-waveform-container ${className}`}
      role="img"
      aria-label={`Audio waveform visualization - ${isSpeaking ? 'actively speaking' : 'monitoring audio'}`}
      aria-describedby="waveform-description"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="audio-waveform-canvas"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'block'
        }}
        aria-hidden="true"
      />
      
      {/* Screen reader description */}
      <div id="waveform-description" className="sr-only">
        Real-time audio waveform showing {isSpeaking ? 'active speech' : 'ambient audio levels'} 
        with {activePersonality} personality color scheme
      </div>
    </div>
  );
}

export default AudioWaveform;

/*
 * AUDIO WAVEFORM VISUALIZATION FEATURES ✨
 * ========================================
 * 
 * IMPLEMENTED FEATURES:
 * 
 * ✨ Real-time frequency analysis using Web Audio API
 * ✨ Personality-aware color schemes and gradients
 * ✨ Smooth 60fps rendering with requestAnimationFrame
 * ✨ Mock data generation for demo mode
 * ✨ Hardware-accelerated canvas rendering
 * ✨ Automatic cleanup and memory management
 * ✨ Accessibility-compliant ARIA labels
 * ✨ Glow effects during active speaking
 * ✨ Symmetric bar visualization with connecting lines
 * ✨ Volume-responsive animation scaling
 * ✨ CSP-compliant implementation
 * ✨ Error handling and graceful fallbacks
 * 
 * The waveform provides beautiful real-time visualization
 * that enhances the voice interface experience!
 */
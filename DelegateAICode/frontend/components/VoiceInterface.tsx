/**
 * VOICE INTERFACE - IMMERSIVE CAMPAIGN EXPERIENCE
 * =============================================
 * 
 * Redesigned for maximum immersion with:
 * - Enhanced microphone button with pronounced speaking pulse
 * - Subtle listening pulse and emanating light rings
 * - Centered layout for focused campaign experience
 * - Minimal UI distractions
 * - FIXED: Campaign header layout overflow issues
 * - GEMINI ONLY: Removed ElevenLabs integration, uses browser TTS only
 * - ENHANCED: Animated daily usage bar with reset countdown tooltip
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AnimatedVoiceIcon } from './AnimatedVoiceIcon';
import { AudioWaveform } from './AudioWaveform';
import { geminiNativeAudio } from '../services/geminiNativeAudio';
import { aiCampaignService, CampaignSession } from '../services/aiCampaignService';
import { rateLimitService } from '../services/rateLimitService';
import { 
  Mic, 
  MicOff, 
  Settings, 
  StopCircle,
  Volume2,
  MessageSquare,
  Globe,
  Users,
  Target,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  ChevronUp,
  ChevronDown,
  Heart,
  Flame,
  Clock
} from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'campaign' | 'system';
  timestamp: Date;
  isPlaying?: boolean;
  stakeholder?: string;
  role?: 'facilitator' | 'stakeholder';
}

/**
 * Enhanced Usage Bar Component with Animations and Tooltip
 */
function EnhancedUsageBar({ rateLimitData }: { rateLimitData: any }) {
  const [previousUsage, setPreviousUsage] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Current usage values with fallbacks
  const currentUsage = rateLimitData.wordsToday || rateLimitData.used || 0;
  const dailyLimit = rateLimitData.dailyLimit || rateLimitData.limit || 3000;
  const percentage = rateLimitData.percentage || ((currentUsage / dailyLimit) * 100);

  // Calculate time until daily reset (midnight)
  const calculateTimeUntilReset = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntilReset > 0) {
      return `${hoursUntilReset}h ${minutesUntilReset}m`;
    } else {
      return `${minutesUntilReset}m`;
    }
  }, []);

  // Update time until reset every minute
  useEffect(() => {
    const updateTime = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [calculateTimeUntilReset]);

  // Trigger animation when usage increases
  useEffect(() => {
    if (currentUsage > previousUsage && previousUsage > 0) {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 700); // Match CSS animation duration
    }
    setPreviousUsage(currentUsage);
  }, [currentUsage, previousUsage]);

  // Get color based on usage percentage
  const getBarColor = useCallback(() => {
    if (percentage >= 90) {
      return 'linear-gradient(90deg, #dc2626, #b91c1c)'; // Red
    } else if (percentage >= 75) {
      return 'linear-gradient(90deg, #f59e0b, #d97706)'; // Orange
    } else {
      return 'linear-gradient(90deg, #3b82f6, #2563eb)'; // Blue
    }
  }, [percentage]);

  // Get tooltip color class based on usage
  const getTooltipColorClass = useCallback(() => {
    if (percentage >= 90) {
      return 'bg-red-900/90 text-red-100 border-red-700/50';
    } else if (percentage >= 75) {
      return 'bg-orange-900/90 text-orange-100 border-orange-700/50';
    } else {
      return 'bg-blue-900/90 text-blue-100 border-blue-700/50';
    }
  }, [percentage]);

  return (
    <div className="flex justify-center mt-3 mb-2">
      <div 
        className="w-64 max-w-[calc(100vw-2rem)] relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Usage Stats Row */}
        <div className="flex items-center justify-between text-xs text-foreground/60 mb-1.5">
          <span>Daily Usage</span>
          <span>{currentUsage.toLocaleString()}/{dailyLimit.toLocaleString()}</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className={`
          relative h-2 bg-white/20 dark:bg-gray-800/40 rounded-full overflow-hidden 
          backdrop-blur-sm border border-white/10 dark:border-gray-700/30
          rate-limit-bar-container
          ${shouldAnimate ? 'rate-limit-bar-glow' : ''}
          ${percentage >= 90 ? 'rate-limit-bar-warning' : ''}
        `}>
          {/* Progress Bar Fill */}
          <div 
            className={`
              absolute left-0 top-0 h-full rounded-full
              rate-limit-bar-fill
              ${shouldAnimate ? 'rate-limit-bar-glow' : ''}
            `}
            style={{
              width: `${Math.min(100, percentage)}%`,
              background: getBarColor(),
              transition: shouldAnimate 
                ? 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease'
                : 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Daily usage: ${currentUsage} of ${dailyLimit} words (${Math.round(percentage)}%)`}
          />
        </div>

        {/* Enhanced Tooltip */}
        {showTooltip && (
          <div className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 
            rounded-lg text-xs whitespace-nowrap z-10 shadow-lg backdrop-blur-sm border
            transition-all duration-200 ease-in-out opacity-100 scale-100
            ${getTooltipColorClass()}
          `}>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <div className="text-center">
                <div className="font-medium">Resets in {timeUntilReset}</div>
                <div className="text-xs opacity-75 mt-0.5">
                  {percentage >= 90 
                    ? 'Almost at limit!' 
                    : percentage >= 75 
                    ? 'Getting close to limit'
                    : 'Usage tracking active'
                  }
                </div>
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className={`
              absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
              border-l-4 border-r-4 border-t-4 border-transparent
              ${percentage >= 90 
                ? 'border-t-red-900/90' 
                : percentage >= 75 
                ? 'border-t-orange-900/90'
                : 'border-t-blue-900/90'
              }
            `} />
          </div>
        )}
      </div>
    </div>
  );
}

export function VoiceInterface(): JSX.Element {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================
  
  const { 
    settings, 
    setCurrentView, 
    activeCampaignSession, 
    stopCampaignSession,
    isCampaignActive,
    speechSpeed 
  } = useApp();

  const { user, isAuthenticated } = useAuth();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [rateLimitData, setRateLimitData] = useState(() => rateLimitService.getUsageSummary());

  //const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const audioChunksRef   = useRef<BlobPart[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // ——————————————————————————————————————————————————————————————————————————
  // NEW: Gemini-based TTS helper
  // ——————————————————————————————————————————————————————————————————————————
    const speakWithGemini = useCallback(async (
    text: string,
    messageId: string,
    stakeholder?: string,
    role?: 'facilitator' | 'stakeholder'
  ) => {
    if (!text) return;
    setCurrentlyPlaying(messageId);
    setVoiceState('speaking');

    try {
      // 1️⃣ Pick a voice ID:
      //    - If it's a system/facilitator message, use a diplomatic voice
      //    - If stakeholder is provided, pick one of the preconfigured voices by personality
      //    - Fallback to a default
      let voiceId = 'gemini-diplomat-male-1';
      if (role === 'facilitator') {
        voiceId = 'gemini-diplomat-female-1';
      } else if (stakeholder && activeCampaignSession) {
        // assume stakeholder corresponds to a character in session
        const char = activeCampaignSession.aiCharacters.find(c => c.id === stakeholder); 
        if (char?.personality) {
          // pick voice matching that personality
          const all = await geminiNativeAudio.getAvailableVoices();
          const match = all.find(v => v.personality === char.personality);
          if (match) voiceId = match.id;
        }
      }

      // 2️⃣ Generate audio blob
      const blob = await geminiNativeAudio.generateSpeech(
        text,
        voiceId,
        { speed: speechSpeed, volume: 0.8 }
      );

      // 3️⃣ Play it
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => {
        setCurrentlyPlaying(null);
        setVoiceState('idle');
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error('Gemini TTS error:', err);
      setCurrentlyPlaying(null);
      setVoiceState('idle');
    }
  }, [speechSpeed, activeCampaignSession]);

  // ============================================================================
  // CAMPAIGN INTEGRATION
  // ============================================================================

  useEffect(() => {
    if (!isCampaignActive) return;

    const unsubscribe = aiCampaignService.subscribeToSession((session: CampaignSession | null) => {
      if (session && session.messages && session.messages.length > 0) {
        const latestMessage = session.messages[session.messages.length - 1];
        if (latestMessage && latestMessage.role !== 'user') {
          const voiceMessage: VoiceMessage = {
            id: latestMessage.id,
            content: latestMessage.content,
            type: 'campaign',
            timestamp: latestMessage.timestamp,
            stakeholder: latestMessage.role === 'system' ? undefined : latestMessage.stakeholder,
            role: latestMessage.role === 'system' ? 'facilitator' : latestMessage.role
          };

          setMessages(prev => {
            if (prev.some(msg => msg.id === voiceMessage.id)) return prev;
            return [...prev, voiceMessage];
          });
          
          if (settings.autoPlayAudio && voiceMessage.content) {
            speakTextWithBrowserTTS(
              voiceMessage.content, 
              voiceMessage.id, 
              voiceMessage.stakeholder, 
              voiceMessage.role
            );
          }
        }
      }
    });

    return unsubscribe;
  }, [isCampaignActive, settings.autoPlayAudio]);

  useEffect(() => {
    if (isCampaignActive && activeCampaignSession && messages.length === 0) {
      const welcomeMessage: VoiceMessage = {
        id: 'welcome',
        content: `Welcome to ${activeCampaignSession.campaign.title}. Voice mode is active. Tap the microphone to begin your diplomatic engagement.`,
        type: 'system',
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      
      if (settings.autoPlayAudio) {
        speakTextWithBrowserTTS(welcomeMessage.content, welcomeMessage.id, undefined, 'facilitator');
      }
    }
  }, [isCampaignActive, activeCampaignSession, settings.autoPlayAudio]);

  // ============================================================================
  // SPEECH RECOGNITION
  // ============================================================================

useEffect(() => {
    if (!isCampaignActive) return;
    const unsub = aiCampaignService.subscribeToSession((session: CampaignSession | null) => {
      if (session && session.messages.length) {
        const msg = session.messages[ session.messages.length - 1 ];
        if (msg.role !== 'user') {
          const voiceMsg: VoiceMessage = {
            id: msg.id,
            content: msg.content,
            type: 'campaign',
            timestamp: msg.timestamp,
            stakeholder: msg.stakeholder,
            role: msg.role
          };
          setMessages(prev => prev.some(m => m.id===voiceMsg.id) ? prev : [...prev, voiceMsg]);
          if (settings.autoPlayAudio) {
            speakWithGemini(voiceMsg.content, voiceMsg.id, voiceMsg.stakeholder, voiceMsg.role);
          }
        }
      }
    });
    return unsub;
  }, [isCampaignActive, settings.autoPlayAudio, speakWithGemini]);

  // ============================================================================
  // BROWSER TTS SPEECH SYNTHESIS
  // ============================================================================

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakTextWithBrowserTTS = useCallback(async (
    text: string, 
    messageId: string, 
    stakeholder?: string, 
    role?: 'facilitator' | 'stakeholder'
  ) => {
    if (!text || !synthRef.current) return;

    stopCurrentAudio();

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/🌍|🎯|💼|🌱|🛡️|⚖️|🏗️|💻|🏥|🔥|🤝|⏰|📋|💡|📤|📥/g, '')
      .replace(/\[(.*?)\]/g, '')
      .trim();

    if (!cleanText) return;

    setCurrentlyPlaying(messageId);
    setVoiceState('speaking');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voiceSpeedMap = {
      slow: 0.7,
      normal: 1.0,
      fast: 1.3
    };
    
    utterance.rate = voiceSpeedMap[settings.voiceSpeed];
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Enhanced voice selection for character differentiation
    const voices = synthRef.current.getVoices();
    let selectedVoice = null;

    // Try to select different voices based on role/stakeholder
    if (role === 'facilitator') {
      // Use a more formal/neutral voice for facilitator
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Natural') || voice.name.includes('David') || voice.name.includes('Male'))
      );
    } else if (role === 'stakeholder' && stakeholder) {
      // Try to vary voices for different stakeholders
      const stakeholderIndex = stakeholder.length % voices.length;
      const availableVoices = voices.filter(voice => voice.lang.startsWith('en'));
      selectedVoice = availableVoices[stakeholderIndex] || availableVoices[0];
    }

    // Fallback to best available English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Natural')
      ) || voices.find(voice => voice.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setCurrentlyPlaying(messageId);
      setVoiceState('speaking');
    };

    utterance.onend = () => {
      setCurrentlyPlaying(null);
      setVoiceState('idle');
    };

    utterance.onerror = (event) => {
      console.error('Browser TTS error:', event.error);
      setCurrentlyPlaying(null);
      setVoiceState('idle');
    };

    synthRef.current.speak(utterance);
  }, [settings.voiceSpeed]);

  const stopCurrentAudio = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    setCurrentlyPlaying(null);
    setVoiceState('idle');
  }, []);

  // ============================================================================
  // AUDIO LEVEL MONITORING
  // ============================================================================

  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(Math.min(100, (average / 128) * 100));
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
    }
  }, []);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  }, []);

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const handleUserSpeech = useCallback(async (speechText: string) => {
    if (!speechText.trim()) return;

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      content: speechText,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);
    setVoiceState('processing');

    try {
      // Check and record rate limit usage for user input
      const isAdmin = user?.role === 'ADMIN';
      const isDemoMode = !isAuthenticated; // Demo mode if not authenticated
      rateLimitService.recordWordUsage(speechText, isAdmin, isDemoMode);
      
      if (isCampaignActive) {
        await aiCampaignService.processPlayerInput(speechText, speechSpeed);
      } else {
        const assistantMessage: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          content: "I understand you're interested in discussing this topic. Would you like to start a Model UN campaign to explore this issue in depth?",
          type: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (settings.autoPlayAudio) {
          speakTextWithBrowserTTS(assistantMessage.content, assistantMessage.id);
        }
      }
    } catch (error) {
      console.error('Failed to process speech:', error);
      
      const errorMessage: VoiceMessage = {
        id: (Date.now() + 2).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'system',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      if (voiceState === 'processing') {
        setVoiceState('idle');
      }
    }
  }, [isCampaignActive, settings.autoPlayAudio, voiceState, speakTextWithBrowserTTS, speechSpeed]);

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const startListening = useCallback(async () => {
    // ask for mic perms and start recording
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunksRef.current = []
    recorder.ondataavailable = e => audioChunksRef.current.push(e.data)
    recorder.onstart       = () => setVoiceState('listening')
    recorder.onstop        = async () => {
      setVoiceState('processing')
      const userBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      // send to your backend which calls Gemini’s conversational API
      const convResp = await api('/voice/gemini/converse', {
        method: 'POST',
        body: userBlob,
      })
      // assume { transcript: string, replyAudioBase64: string, role: 'facilitator'|'stakeholder', stakeholderId?: string }
      const { transcript, replyAudioBase64, role, stakeholderId } = await convResp.json()

      // display the transcript
      // setTranscript(transcript)

      // turn the base64 reply into a blob
      const audioBuffer = Uint8Array.from(atob(replyAudioBase64), c=>c.charCodeAt(0))
      const replyBlob   = new Blob([audioBuffer], { type: 'audio/mpeg' })

      setVoiceState('speaking')
      // choose voiceId based on role/personality
      const voiceId = role==='facilitator'
        ? 'gemini-diplomat-female-1'
        : stakeholderId?.startsWith('gemini-') ? stakeholderId : 'gemini-diplomat-male-1'

      // play it
      await geminiNativeAudio.generateSpeech(
        transcript, 
        voiceId, 
        { speed: 1.0, volume: 0.8 }
      ).then(blob => {
        const url = URL.createObjectURL(blob)
        const a   = new Audio(url)
        a.onended = () => {
          URL.revokeObjectURL(url)
          setVoiceState('idle')
        }
        a.play()
      })
    }

    mediaRecorderRef.current = recorder
    recorder.start()
  }, []);

 const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && voiceState === 'listening') {
      mediaRecorderRef.current.stop()
      setVoiceState('processing')
    }
  }, [voiceState])

  const stopSpeaking = useCallback(() => {
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const handleStopCampaign = useCallback(() => {
    stopCampaignSession();
    setMessages([]);
    setVoiceState('idle');
    stopSpeaking();
  }, [stopCampaignSession, stopSpeaking]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      stopAudioLevelMonitoring();
      stopCurrentAudio();
    };
  }, [stopAudioLevelMonitoring, stopCurrentAudio]);

  // ============================================================================
  // RATE LIMIT TRACKING
  // ============================================================================

  useEffect(() => {
    // Update rate limit data when messages change
    setRateLimitData(rateLimitService.getUsageSummary());
  }, [messages]);

  useEffect(() => {
    // Periodically update rate limit data
    const interval = setInterval(() => {
      setRateLimitData(rateLimitService.getUsageSummary());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // ENHANCED MICROPHONE ANIMATIONS
  // ============================================================================

  const getMicrophoneAnimation = useCallback(() => {
    switch (voiceState) {
      case 'listening':
        return 'animate-mic-listening-subtle';
      case 'speaking':
        return 'animate-mic-speaking-pronounced';
      case 'processing':
        return 'animate-mic-processing-rotate';
      default:
        return '';
    }
  }, [voiceState]);

  const getEmanatingRingAnimation = useCallback(() => {
    switch (voiceState) {
      case 'listening':
        return 'animate-emanate-ring-listening';
      case 'speaking':
        return 'animate-emanate-ring-speaking';
      case 'processing':
        return 'animate-emanate-ring-processing';
      default:
        return '';
    }
  }, [voiceState]);

  const getEmanatingRingColor = useCallback(() => {
    switch (voiceState) {
      case 'listening':
        return 'emanating-ring-listening';
      case 'speaking':
        return 'emanating-ring-speaking';
      case 'processing':
        return 'emanating-ring-processing';
      default:
        return '';
    }
  }, [voiceState]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
      
      {/* FIXED: Enhanced Campaign Header with Proper Layout Constraints */}
      {isCampaignActive && activeCampaignSession && (
        <div className="absolute top-0 left-0 right-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 p-2 md:p-3 z-10">
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Left section with campaign info - constrained width */}
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-100 truncate max-w-full">
                  {activeCampaignSession.campaign.title}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-full">
                  {activeCampaignSession.currentPhase?.name || 'Active Session'}
                </p>
              </div>
            </div>
            
            {/* Right section with stats and controls - fixed width */}
            <div className="flex items-center space-x-2 md:space-x-3 text-xs flex-shrink-0">
              {activeCampaignSession.messages && activeCampaignSession.messages.length > 0 && (
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span className="font-medium text-orange-600 whitespace-nowrap">7/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-pink-600 flex-shrink-0" />
                    <span className="font-medium text-pink-600 whitespace-nowrap">8/10</span>
                  </div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopCampaign}
                className="text-xs px-2 py-1 h-auto flex-shrink-0 whitespace-nowrap"
              >
                <StopCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                End
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Voice Interface */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {/* Enhanced Microphone Button with Emanating Light Rings */}
          <div className="relative flex items-center justify-center">
            {/* Emanating Light Rings */}
            {voiceState !== 'idle' && (
              <>
                {/* Ring 1 - Immediate */}
                <div 
                  className={`absolute inset-0 rounded-full border-2 pointer-events-none ${getEmanatingRingColor()} ${getEmanatingRingAnimation()}`}
                  style={{ animationDelay: '0ms' }}
                />
                {/* Ring 2 - Delayed */}
                <div 
                  className={`absolute inset-0 rounded-full border-2 pointer-events-none ${getEmanatingRingColor()} ${getEmanatingRingAnimation()}`}
                  style={{ animationDelay: '600ms' }}
                />
                {/* Ring 3 - More Delayed */}
                <div 
                  className={`absolute inset-0 rounded-full border-1 pointer-events-none ${getEmanatingRingColor()} ${getEmanatingRingAnimation()}`}
                  style={{ animationDelay: '1200ms' }}
                />
              </>
            )}

            {/* Main Microphone Button */}
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopListening : startListening}
              disabled={voiceState === 'processing' || voiceState === 'speaking'}
              className={`w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full relative z-10 shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 p-0 voice-performance-base ${getMicrophoneAnimation()}`}
            >
              <div className="flex items-center justify-center w-full h-full">
                <AnimatedVoiceIcon 
                  state={voiceState}
                  isConversationActive={isCampaignActive}
                  size="2xl"
                  className=""
                />
              </div>
            </Button>
          </div>
          
          {/* Audio Waveform - Below Button */}
          {isRecording && (
            <div className="mt-8 flex justify-center">
              <AudioWaveform audioLevel={audioLevel} isActive={isRecording} />
            </div>
          )}
          
          {/* Transcript Display - Only during listening */}
          {transcript && voiceState === 'listening' && (
            <div className="mt-6 max-w-md px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border shadow-lg">
              <p className="text-sm text-center text-slate-700 dark:text-slate-300 break-words">
                "{transcript}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message History Toggle - Top Right */}
      {messages.length > 1 && (
        <div className="absolute top-16 md:top-20 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMessages(!showMessages)}
            className="rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 shadow-lg"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            {showMessages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* FIXED: Message History Panel with Proper Constraints */}
      {showMessages && messages.length > 0 && (
        <div className="absolute top-20 md:top-24 right-4 bottom-32 w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-xl border shadow-2xl z-20 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.slice(-5).map((message) => (
                <Card key={message.id} className="text-xs">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {message.stakeholder || 
                             (message.role === 'facilitator' ? 'Facilitator' : 
                              message.type === 'user' ? 'You' : 'Assistant')}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed line-clamp-3 break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Secondary Controls - Bottom Right */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 pointer-events-auto z-20">
        {voiceState === 'speaking' && (
          <Button
            variant="outline"
            size="lg"
            onClick={stopSpeaking}
            className="w-14 h-14 rounded-full shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 transition-all duration-200 hover:scale-105"
            title="Stop Speaking"
          >
            <Pause className="h-6 w-6" />
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentView('settings')}
          className="w-14 h-14 rounded-full shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 transition-all duration-200 hover:scale-105"
          title="Voice Settings"
        >
          <Settings className="h-6 w-6" />
        </Button>

        {!isCampaignActive && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentView('campaigns')}
            className="w-14 h-14 rounded-full shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 transition-all duration-200 hover:scale-105"
            title="Model UN Campaigns"
          >
            <Target className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Minimal Status Text - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="text-center p-4 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5">
          <p className="text-sm font-medium text-foreground/80 mb-1 truncate max-w-full px-4">
            {isCampaignActive ? (
              voiceState === 'idle' ? 'Tap to speak with diplomats' :
              voiceState === 'listening' ? 'Listening...' :
              voiceState === 'processing' ? 'Processing...' :
              voiceState === 'speaking' ? 'AI responding...' :
              'Ready'
            ) : (
              voiceState === 'idle' ? 'Tap to start talking' :
              voiceState === 'listening' ? 'Listening...' :
              voiceState === 'processing' ? 'Processing...' :
              voiceState === 'speaking' ? 'AI responding...' :
              'Ready'
            )}
          </p>
          
          {/* Enhanced Daily Usage Bar with Animations and Tooltip */}
          {user && !user.role?.includes('admin') && (
            <EnhancedUsageBar rateLimitData={rateLimitData} />
          )}
          
          <p className="text-xs text-muted-foreground truncate max-w-full px-4">
            Powered by Google Gemini
          </p>
        </div>
      </div>
    </div>
  );
}

export default VoiceInterface;
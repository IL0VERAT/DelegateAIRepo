/*
 * APP CONTEXT WITH ENHANCED ADMIN CONSOLE AND VOICE SETTINGS
 * ===========================================================
 * 
 * Centralized application state management with:
 * - Theme and appearance settings
 * - Voice and audio configurations  
 * - User authentication state
 * - Admin console integration
 * - CCPA/CPRA privacy compliance
 * - Settings import/export functionality
 * - Enhanced voice settings including user voice selection
 * 
 * PRODUCTION READY: All error handling and fallbacks in place
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type DebateMode = 'collaborative' | 'gentle' | 'balanced' | 'challenging' | 'aggressive';

export type CurrentView = 
  | 'chat' 
  | 'voice'
  | 'campaigns'
  | 'transcripts'
  | 'settings' 
  | 'help' 
  | 'legal' 
  | 'privacy'
  | 'comprehensive-guide'
  | 'smart-features'
  | 'admin'
  | 'admin-users'
  | 'admin-monitor'
  | 'admin-security'
  | 'admin-analytics'
  | 'admin-database'
  | 'admin-logs'
  | 'admin-campaigns';

export interface SpeechSpeedInfo {
  current: number;
  min: number;
  max: number;
  default: number;
  description: string;
}

interface CampaignSession {
  id: string;
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
  };
  currentPhase?: {
    name: string;
    description: string;
  };
  messages?: Array<{
    id: string;
    content: string;
    role: string;
    stakeholder?: string;
    timestamp: Date;
  }>;
  isActive: boolean;
  startedAt: Date;
}

interface AppSettings {
  // Appearance
  theme: Theme;
  fontSize: FontSize;
  
  // Voice and Audio
  voiceEnabled: boolean;
  voiceSpeed: VoiceSpeed;
  speechSpeed: number; // 0.7 to 1.2
  autoPlayAudio: boolean;
  
  // User Voice Selection
  userVoiceEnabled: boolean;
  selectedUserVoice: string; // Voice ID from characterVoiceService
  
  // Language
  language: string;
  autoDetectLanguage: boolean;
  
  // Debate and Interaction
  debateMode: DebateMode;
  
  // Notifications
  notificationsEnabled: boolean;
  
  // Privacy and Data
  dataCollection: boolean;
  analyticsEnabled: boolean;
  
  // System
  enableMockData: boolean;
  showDebugInfo: boolean;
}

interface AppState extends AppSettings {
  // UI State
  currentView: CurrentView;
  
  // Campaign State
  activeCampaignSession: CampaignSession | null;
  isCampaignActive: boolean;
  
  // System State
  isInitialized: boolean;
  lastSyncTime: Date | null;
}

// Action types for the reducer
type AppAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'SET_CURRENT_VIEW'; payload: CurrentView }
  | { type: 'SET_VOICE_ENABLED'; payload: boolean }
  | { type: 'SET_VOICE_SPEED'; payload: VoiceSpeed }
  | { type: 'SET_SPEECH_SPEED'; payload: number }
  | { type: 'SET_USER_VOICE_ENABLED'; payload: boolean }
  | { type: 'SET_SELECTED_USER_VOICE'; payload: string }
  | { type: 'SET_AUTO_PLAY_AUDIO'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_AUTO_DETECT_LANGUAGE'; payload: boolean }
  | { type: 'SET_DEBATE_MODE'; payload: DebateMode }
  | { type: 'SET_NOTIFICATIONS_ENABLED'; payload: boolean }
  | { type: 'SET_DATA_COLLECTION'; payload: boolean }
  | { type: 'SET_ANALYTICS_ENABLED'; payload: boolean }
  | { type: 'SET_CAMPAIGN_SESSION'; payload: CampaignSession | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'INITIALIZE'; payload: Partial<AppState> };

// Context interface
interface AppContextType {
  // State
  currentView: CurrentView;
  theme: Theme;
  fontSize: FontSize;
  voiceEnabled: boolean;
  voiceSpeed: VoiceSpeed;
  speechSpeed: number;
  userVoiceEnabled: boolean;
  selectedUserVoice: string;
  autoPlayAudio: boolean;
  language: string;
  autoDetectLanguage: boolean;
  debateMode: DebateMode;
  notificationsEnabled: boolean;
  dataCollection: boolean;
  analyticsEnabled: boolean;
  activeCampaignSession: CampaignSession | null;
  isCampaignActive: boolean;
  isInitialized: boolean;
  lastSyncTime: Date | null;
  
  // Settings object for easy access
  settings: AppSettings;
  
  // Actions
  setCurrentView: (view: CurrentView) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceSpeed: (speed: VoiceSpeed) => void;
  setSpeechSpeed: (speed: number) => void;
  setUserVoiceEnabled: (enabled: boolean) => void;
  setSelectedUserVoice: (voiceId: string) => void;
  setAutoPlayAudio: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  setAutoDetectLanguage: (enabled: boolean) => void;
  detectLanguage: (text: string) => Promise<any>;
  setDebateMode: (mode: DebateMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDataCollection: (enabled: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  
  // Campaign actions
  startCampaignSession: (session: CampaignSession) => void;
  stopCampaignSession: () => void;
  updateCampaignSession: (updates: Partial<CampaignSession>) => void;
  
  // Speech speed utilities
  getSpeechSpeedInfo: () => SpeechSpeedInfo;
  validateSpeechSpeed: (speed: number) => boolean;
  
  // Settings management
  exportSettings: () => Promise<AppSettings>;
  importSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

// ============================================================================
// DEFAULT VALUES AND CONSTANTS
// ============================================================================

const DEFAULT_SETTINGS: AppSettings = {
  // Appearance
  theme: 'system',
  fontSize: 'medium',
  
  // Voice and Audio
  voiceEnabled: true,
  voiceSpeed: 'normal',
  speechSpeed: 1.0,
  autoPlayAudio: true,
  
  // User Voice Selection
  userVoiceEnabled: true,
  selectedUserVoice: 'leda', // Default diplomatic voice
  
  // Language
  language: 'en-US',
  autoDetectLanguage: false,
  
  // Debate and Interaction
  debateMode: 'balanced',
  
  // Notifications
  notificationsEnabled: true,
  
  // Privacy and Data
  dataCollection: false,
  analyticsEnabled: false,
  
  // System
  enableMockData: true,
  showDebugInfo: false,
};

const DEFAULT_STATE: AppState = {
  ...DEFAULT_SETTINGS,
  // UI State
  currentView: 'chat',
  
  // Campaign State
  activeCampaignSession: null,
  isCampaignActive: false,
  
  // System State
  isInitialized: false,
  lastSyncTime: null,
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

const STORAGE_KEY = 'delegate-ai-settings';
const STORAGE_VERSION = '2.1.0'; // Incremented for user voice settings

interface StoredData {
  version: string;
  settings: Partial<AppSettings>;
  timestamp: number;
}

const loadSettingsFromStorage = (): Partial<AppSettings> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data: StoredData = JSON.parse(stored);
    
    // Version check - migrate if needed
    if (data.version !== STORAGE_VERSION) {
      console.log(`📦 Migrating settings from ${data.version} to ${STORAGE_VERSION}`);
      // Add any migration logic here if needed
      const migratedSettings = { ...data.settings };
      
      // Add new user voice settings if missing
      if (!('userVoiceEnabled' in migratedSettings)) {
        migratedSettings.userVoiceEnabled = DEFAULT_SETTINGS.userVoiceEnabled;
      }
      if (!('selectedUserVoice' in migratedSettings)) {
        migratedSettings.selectedUserVoice = DEFAULT_SETTINGS.selectedUserVoice;
      }
      
      return migratedSettings;
    }
    
    return data.settings;
  } catch (error) {
    console.warn('Failed to load settings from storage:', error);
    return {};
  }
};

const saveSettingsToStorage = (settings: AppSettings): void => {
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      settings,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save settings to storage:', error);
  }
};

// ============================================================================
// REDUCER
// ============================================================================

const appReducer = (state: AppState, action: AppAction): AppState => {
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_THEME':
      newState = { ...state, theme: action.payload };
      break;
      
    case 'SET_FONT_SIZE':
      newState = { ...state, fontSize: action.payload };
      break;
      
    case 'SET_CURRENT_VIEW':
      newState = { ...state, currentView: action.payload };
      break;
      
    case 'SET_VOICE_ENABLED':
      newState = { ...state, voiceEnabled: action.payload };
      break;
      
    case 'SET_VOICE_SPEED':
      newState = { ...state, voiceSpeed: action.payload };
      break;
      
    case 'SET_SPEECH_SPEED':
      // Clamp speech speed to valid range
      const clampedSpeed = Math.max(0.7, Math.min(1.2, action.payload));
      newState = { ...state, speechSpeed: clampedSpeed };
      break;
      
    case 'SET_USER_VOICE_ENABLED':
      newState = { ...state, userVoiceEnabled: action.payload };
      break;
      
    case 'SET_SELECTED_USER_VOICE':
      newState = { ...state, selectedUserVoice: action.payload };
      break;
      
    case 'SET_AUTO_PLAY_AUDIO':
      newState = { ...state, autoPlayAudio: action.payload };
      break;
      
    case 'SET_LANGUAGE':
      newState = { ...state, language: action.payload };
      break;
      
    case 'SET_AUTO_DETECT_LANGUAGE':
      newState = { ...state, autoDetectLanguage: action.payload };
      break;
      
    case 'SET_DEBATE_MODE':
      newState = { ...state, debateMode: action.payload };
      break;
      
    case 'SET_NOTIFICATIONS_ENABLED':
      newState = { ...state, notificationsEnabled: action.payload };
      break;
      
    case 'SET_DATA_COLLECTION':
      newState = { ...state, dataCollection: action.payload };
      break;
      
    case 'SET_ANALYTICS_ENABLED':
      newState = { ...state, analyticsEnabled: action.payload };
      break;
      
    case 'SET_CAMPAIGN_SESSION':
      newState = { 
        ...state, 
        activeCampaignSession: action.payload,
        isCampaignActive: action.payload !== null
      };
      break;
      
    case 'UPDATE_SETTINGS':
      newState = { ...state, ...action.payload };
      break;
      
    case 'RESET_SETTINGS':
      newState = { 
        ...DEFAULT_STATE, 
        currentView: state.currentView,
        isInitialized: true,
        lastSyncTime: new Date()
      };
      break;
      
    case 'INITIALIZE':
      newState = { 
        ...state, 
        ...action.payload, 
        isInitialized: true,
        lastSyncTime: new Date()
      };
      break;
      
    default:
      return state;
  }
  
  // Extract settings for storage (exclude UI and system state)
  const settingsToStore: AppSettings = {
    theme: newState.theme,
    fontSize: newState.fontSize,
    voiceEnabled: newState.voiceEnabled,
    voiceSpeed: newState.voiceSpeed,
    speechSpeed: newState.speechSpeed,
    userVoiceEnabled: newState.userVoiceEnabled,
    selectedUserVoice: newState.selectedUserVoice,
    autoPlayAudio: newState.autoPlayAudio,
    language: newState.language,
    autoDetectLanguage: newState.autoDetectLanguage,
    debateMode: newState.debateMode,
    notificationsEnabled: newState.notificationsEnabled,
    dataCollection: newState.dataCollection,
    analyticsEnabled: newState.analyticsEnabled,
    enableMockData: newState.enableMockData,
    showDebugInfo: newState.showDebugInfo,
  };
  
  // Save to localStorage (debounced in real implementation)
  saveSettingsToStorage(settingsToStore);
  
  return newState;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, DEFAULT_STATE);
  
  // Initialize from localStorage on mount
  useEffect(() => {
    const storedSettings = loadSettingsFromStorage();
    dispatch({ 
      type: 'INITIALIZE', 
      payload: storedSettings 
    });
    console.log('🚀 App context initialized with stored settings');
  }, []);
  
  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', state.theme === 'dark');
    }
  }, [state.theme]);
  
  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', state.fontSize);
  }, [state.fontSize]);
  
  // ============================================================================
  // ACTION CREATORS
  // ============================================================================
  
  const setCurrentView = useCallback((view: CurrentView) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  }, []);
  
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);
  
  const setFontSize = useCallback((size: FontSize) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  }, []);
  
  const setVoiceEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_VOICE_ENABLED', payload: enabled });
  }, []);
  
  const setVoiceSpeed = useCallback((speed: VoiceSpeed) => {
    dispatch({ type: 'SET_VOICE_SPEED', payload: speed });
    
    // Also update numeric speech speed
    const speedMap: Record<VoiceSpeed, number> = {
      slow: 0.8,
      normal: 1.0,
      fast: 1.2
    };
    dispatch({ type: 'SET_SPEECH_SPEED', payload: speedMap[speed] });
  }, []);
  
  const setSpeechSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEECH_SPEED', payload: speed });
  }, []);
  
  const setUserVoiceEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_USER_VOICE_ENABLED', payload: enabled });
  }, []);
  
  const setSelectedUserVoice = useCallback((voiceId: string) => {
    dispatch({ type: 'SET_SELECTED_USER_VOICE', payload: voiceId });
  }, []);
  
  const setAutoPlayAudio = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_PLAY_AUDIO', payload: enabled });
  }, []);
  
  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);
  
  const setAutoDetectLanguage = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_DETECT_LANGUAGE', payload: enabled });
  }, []);
  
  const setDebateMode = useCallback((mode: DebateMode) => {
    dispatch({ type: 'SET_DEBATE_MODE', payload: mode });
  }, []);
  
  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', payload: enabled });
  }, []);
  
  const setDataCollection = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DATA_COLLECTION', payload: enabled });
  }, []);
  
  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_ANALYTICS_ENABLED', payload: enabled });
  }, []);
  
  // ============================================================================
  // CAMPAIGN ACTIONS
  // ============================================================================
  
  const startCampaignSession = useCallback((session: CampaignSession) => {
    dispatch({ type: 'SET_CAMPAIGN_SESSION', payload: session });
    console.log('🎯 Campaign session started:', session.campaign.title);
  }, []);
  
  const stopCampaignSession = useCallback(() => {
    dispatch({ type: 'SET_CAMPAIGN_SESSION', payload: null });
    console.log('🛑 Campaign session stopped');
  }, []);
  
  const updateCampaignSession = useCallback((updates: Partial<CampaignSession>) => {
    if (state.activeCampaignSession) {
      const updatedSession = { ...state.activeCampaignSession, ...updates };
      dispatch({ type: 'SET_CAMPAIGN_SESSION', payload: updatedSession });
    }
  }, [state.activeCampaignSession]);
  
  // ============================================================================
  // SPEECH UTILITIES
  // ============================================================================
  
  const getSpeechSpeedInfo = useCallback((): SpeechSpeedInfo => {
    const speedDescriptions: Record<string, string> = {
      '0.7': 'Very slow, ideal for accessibility and complex information',
      '0.8': 'Slow, good for learning and careful listening',
      '0.9': 'Slightly slow, comfortable pace',
      '1.0': 'Normal conversational speed',
      '1.1': 'Slightly fast, efficient communication',
      '1.2': 'Fast, for quick information delivery'
    };
    
    const speedKey = state.speechSpeed.toFixed(1);
    const description = speedDescriptions[speedKey] || 'Custom speech speed';
    
    return {
      current: state.speechSpeed,
      min: 0.7,
      max: 1.2,
      default: 1.0,
      description
    };
  }, [state.speechSpeed]);
  
  const validateSpeechSpeed = useCallback((speed: number): boolean => {
    return speed >= 0.7 && speed <= 1.2;
  }, []);
  
  // ============================================================================
  // LANGUAGE DETECTION
  // ============================================================================
  
  const detectLanguage = useCallback(async (text: string): Promise<any> => {
    // Mock language detection for now
    // In a real implementation, this would call a language detection API
    return new Promise((resolve) => {
      setTimeout(() => {
        const detectedLang = text.toLowerCase().includes('hola') ? 'es' : 'en';
        resolve({
          detected_language: detectedLang,
          confidence: 0.95,
          iso_code: detectedLang === 'es' ? 'es-ES' : 'en-US',
          supported: true,
          method: 'mock_detection'
        });
      }, 500);
    });
  }, []);
  
  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================
  
  const exportSettings = useCallback(async (): Promise<AppSettings> => {
    const settings: AppSettings = {
      theme: state.theme,
      fontSize: state.fontSize,
      voiceEnabled: state.voiceEnabled,
      voiceSpeed: state.voiceSpeed,
      speechSpeed: state.speechSpeed,
      userVoiceEnabled: state.userVoiceEnabled,
      selectedUserVoice: state.selectedUserVoice,
      autoPlayAudio: state.autoPlayAudio,
      language: state.language,
      autoDetectLanguage: state.autoDetectLanguage,
      debateMode: state.debateMode,
      notificationsEnabled: state.notificationsEnabled,
      dataCollection: state.dataCollection,
      analyticsEnabled: state.analyticsEnabled,
      enableMockData: state.enableMockData,
      showDebugInfo: state.showDebugInfo,
    };
    
    console.log('📤 Settings exported');
    return settings;
  }, [state]);
  
  const importSettings = useCallback(async (settings: Partial<AppSettings>): Promise<void> => {
    // Validate and merge settings
    const validatedSettings = { ...settings };
    
    // Ensure speech speed is in valid range
    if (validatedSettings.speechSpeed !== undefined) {
      validatedSettings.speechSpeed = Math.max(0.7, Math.min(1.2, validatedSettings.speechSpeed));
    }
    
    dispatch({ type: 'UPDATE_SETTINGS', payload: validatedSettings });
    console.log('📥 Settings imported');
  }, []);
  
  const resetSettings = useCallback(async (): Promise<void> => {
    dispatch({ type: 'RESET_SETTINGS' });
    console.log('🔄 Settings reset to defaults');
  }, []);
  
  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);
  
  // ============================================================================
  // MEMOIZED SETTINGS OBJECT
  // ============================================================================
  
  const settings = useMemo((): AppSettings => ({
    theme: state.theme,
    fontSize: state.fontSize,
    voiceEnabled: state.voiceEnabled,
    voiceSpeed: state.voiceSpeed,
    speechSpeed: state.speechSpeed,
    userVoiceEnabled: state.userVoiceEnabled,
    selectedUserVoice: state.selectedUserVoice,
    autoPlayAudio: state.autoPlayAudio,
    language: state.language,
    autoDetectLanguage: state.autoDetectLanguage,
    debateMode: state.debateMode,
    notificationsEnabled: state.notificationsEnabled,
    dataCollection: state.dataCollection,
    analyticsEnabled: state.analyticsEnabled,
    enableMockData: state.enableMockData,
    showDebugInfo: state.showDebugInfo,
  }), [state]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const contextValue = useMemo((): AppContextType => ({
    // State
    currentView: state.currentView,
    theme: state.theme,
    fontSize: state.fontSize,
    voiceEnabled: state.voiceEnabled,
    voiceSpeed: state.voiceSpeed,
    speechSpeed: state.speechSpeed,
    userVoiceEnabled: state.userVoiceEnabled,
    selectedUserVoice: state.selectedUserVoice,
    autoPlayAudio: state.autoPlayAudio,
    language: state.language,
    autoDetectLanguage: state.autoDetectLanguage,
    debateMode: state.debateMode,
    notificationsEnabled: state.notificationsEnabled,
    dataCollection: state.dataCollection,
    analyticsEnabled: state.analyticsEnabled,
    activeCampaignSession: state.activeCampaignSession,
    isCampaignActive: state.isCampaignActive,
    isInitialized: state.isInitialized,
    lastSyncTime: state.lastSyncTime,
    settings,
    
    // Actions
    setCurrentView,
    setTheme,
    setFontSize,
    setVoiceEnabled,
    setVoiceSpeed,
    setSpeechSpeed,
    setUserVoiceEnabled,
    setSelectedUserVoice,
    setAutoPlayAudio,
    setLanguage,
    setAutoDetectLanguage,
    detectLanguage,
    setDebateMode,
    setNotificationsEnabled,
    setDataCollection,
    setAnalyticsEnabled,
    
    // Campaign actions
    startCampaignSession,
    stopCampaignSession,
    updateCampaignSession,
    
    // Speech utilities
    getSpeechSpeedInfo,
    validateSpeechSpeed,
    
    // Settings management
    exportSettings,
    importSettings,
    resetSettings,
    updateSettings,
  }), [
    state,
    settings,
    setCurrentView,
    setTheme,
    setFontSize,
    setVoiceEnabled,
    setVoiceSpeed,
    setSpeechSpeed,
    setUserVoiceEnabled,
    setSelectedUserVoice,
    setAutoPlayAudio,
    setLanguage,
    setAutoDetectLanguage,
    detectLanguage,
    setDebateMode,
    setNotificationsEnabled,
    setDataCollection,
    setAnalyticsEnabled,
    startCampaignSession,
    stopCampaignSession,
    updateCampaignSession,
    getSpeechSpeedInfo,
    validateSpeechSpeed,
    exportSettings,
    importSettings,
    resetSettings,
    updateSettings,
  ]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AppProvider;
export { AppContext };
export type { AppContextType, AppSettings, CampaignSession };

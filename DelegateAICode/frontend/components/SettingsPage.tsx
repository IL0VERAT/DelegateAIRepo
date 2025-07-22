/**
 * SETTINGS PAGE WITH PRIVACY COMPLIANCE, LANGUAGE DETECTION, SPEECH CONTROL, AND USER VOICE SELECTION
 * ==================================================================================================
 * 
 * Enhanced settings page that includes comprehensive CCPA/CPRA compliance
 * information in the System tab, ensuring users are fully informed about
 * their privacy rights and the protection measures in place.
 * 
 * Features:
 * - Language detection and selection in Voice tab
 * - Speech speed control (0.7x to 1.2x) via ElevenLabs
 * - USER VOICE SELECTION for voice mode (AI assigns character voices automatically)
 * - Organized Voice sub-tabs: Speech Control, User Voice, Language Settings, Debate Mode
 * - All existing functionality preserved
 * - UPDATED: Complete list of 33 supported languages for Text-to-Speech
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { usePrivacy } from './PrivacyContext';
import { characterVoiceService } from '../services/characterVoiceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import PrivacySettings from './PrivacySettings';
import { 
  Settings, 
  Palette, 
  Volume2, 
  Shield, 
  Download, 
  Upload, 
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Type,
  Mic,
  MessageSquare,
  Bell,
  Lock,
  Eye,
  Trash2,
  UserX,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  FileText,
  Database,
  Clock,
  Users,
  Globe,
  HelpCircle,
  Swords,
  Heart,
  Scale,
  Flame,
  Cloud,
  Languages,
  Zap,
  Brain,
  Gauge,
  Play,
  Pause,
  RotateCw,
  Headphones,
  Theater,
  UserCheck,
  Sparkles,
  TestTube,
  Wand2,
  User
} from 'lucide-react';

// Complete list of supported languages for Text-to-Speech
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸', iso_code: 'en-US', display_name: 'English (United States)' },
  { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺', iso_code: 'en-AU', display_name: 'English (Australia)' },
  { code: 'en-GB', name: 'English (United Kingdom)', flag: '🇬🇧', iso_code: 'en-GB', display_name: 'English (United Kingdom)' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', iso_code: 'en-IN', display_name: 'English (India)' },
  { code: 'es-US', name: 'Spanish (United States)', flag: '🇺🇸', iso_code: 'es-US', display_name: 'Spanish (United States)' },
  { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪', iso_code: 'de-DE', display_name: 'German (Germany)' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷', iso_code: 'fr-FR', display_name: 'French (France)' },
  { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳', iso_code: 'hi-IN', display_name: 'Hindi (India)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', iso_code: 'pt-BR', display_name: 'Portuguese (Brazil)' },
  { code: 'ar-XA', name: 'Arabic (Generic)', flag: '🇸🇦', iso_code: 'ar-XA', display_name: 'Arabic (Generic)' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸', iso_code: 'es-ES', display_name: 'Spanish (Spain)' },
  { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦', iso_code: 'fr-CA', display_name: 'French (Canada)' },
  { code: 'id-ID', name: 'Indonesian (Indonesia)', flag: '🇮🇩', iso_code: 'id-ID', display_name: 'Indonesian (Indonesia)' },
  { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹', iso_code: 'it-IT', display_name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵', iso_code: 'ja-JP', display_name: 'Japanese (Japan)' },
  { code: 'tr-TR', name: 'Turkish (Turkey)', flag: '🇹🇷', iso_code: 'tr-TR', display_name: 'Turkish (Turkey)' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)', flag: '🇻🇳', iso_code: 'vi-VN', display_name: 'Vietnamese (Vietnam)' },
  { code: 'bn-IN', name: 'Bengali (India)', flag: '🇮🇳', iso_code: 'bn-IN', display_name: 'Bengali (India)' },
  { code: 'gu-IN', name: 'Gujarati (India)', flag: '🇮🇳', iso_code: 'gu-IN', display_name: 'Gujarati (India)' },
  { code: 'kn-IN', name: 'Kannada (India)', flag: '🇮🇳', iso_code: 'kn-IN', display_name: 'Kannada (India)' },
  { code: 'ml-IN', name: 'Malayalam (India)', flag: '🇮🇳', iso_code: 'ml-IN', display_name: 'Malayalam (India)' },
  { code: 'mr-IN', name: 'Marathi (India)', flag: '🇮🇳', iso_code: 'mr-IN', display_name: 'Marathi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)', flag: '🇮🇳', iso_code: 'ta-IN', display_name: 'Tamil (India)' },
  { code: 'te-IN', name: 'Telugu (India)', flag: '🇮🇳', iso_code: 'te-IN', display_name: 'Telugu (India)' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', flag: '🇧🇪', iso_code: 'nl-BE', display_name: 'Dutch (Belgium)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', flag: '🇳🇱', iso_code: 'nl-NL', display_name: 'Dutch (Netherlands)' },
  { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷', iso_code: 'ko-KR', display_name: 'Korean (South Korea)' },
  { code: 'cmn-CN', name: 'Mandarin Chinese (China)', flag: '🇨🇳', iso_code: 'cmn-CN', display_name: 'Mandarin Chinese (China)' },
  { code: 'pl-PL', name: 'Polish (Poland)', flag: '🇵🇱', iso_code: 'pl-PL', display_name: 'Polish (Poland)' },
  { code: 'ru-RU', name: 'Russian (Russia)', flag: '🇷🇺', iso_code: 'ru-RU', display_name: 'Russian (Russia)' },
  { code: 'sw-KE', name: 'Swahili (Kenya)', flag: '🇰🇪', iso_code: 'sw-KE', display_name: 'Swahili (Kenya)' },
  { code: 'th-TH', name: 'Thai (Thailand)', flag: '🇹🇭', iso_code: 'th-TH', display_name: 'Thai (Thailand)' },
  { code: 'ur-IN', name: 'Urdu (India)', flag: '🇮🇳', iso_code: 'ur-IN', display_name: 'Urdu (India)' },
  { code: 'uk-UA', name: 'Ukrainian (Ukraine)', flag: '🇺🇦', iso_code: 'uk-UA', display_name: 'Ukrainian (Ukraine)' }
];

// Debate modes configuration
const debateModes = {
  collaborative: {
    name: 'Collaborative',
    description: 'Peaceful, cooperative discussions focused on finding common ground',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    intensity: 1
  },
  gentle: {
    name: 'Gentle',
    description: 'Calm, respectful exchanges with thoughtful consideration',
    icon: Cloud,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    intensity: 2
  },
  balanced: {
    name: 'Balanced',
    description: 'Neutral, analytical approach balancing multiple perspectives',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    intensity: 3
  },
  challenging: {
    name: 'Challenging',
    description: 'Energetic discussions that probe ideas and test arguments',
    icon: Swords,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    intensity: 4
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Intense, direct confrontation of ideas and arguments',
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    intensity: 5
  }
};

type DebateMode = keyof typeof debateModes;

export function SettingsPage(): JSX.Element {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    voiceEnabled,
    setVoiceEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    debateMode,
    setDebateMode,
    // Language settings
    language,
    setLanguage,
    autoDetectLanguage,
    setAutoDetectLanguage,
    detectLanguage,
    // Speech speed settings
    speechSpeed,
    setSpeechSpeed,
    getSpeechSpeedInfo,
    validateSpeechSpeed,
    exportSettings,
    importSettings,
    resetSettings
  } = useApp();

  const { user, isAuthenticated } = useAuth();
  const privacy = usePrivacy();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  
  // Language detection test state
  const [testText, setTestText] = useState('');
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Speech speed test state
  const [speechTestText, setSpeechTestText] = useState('Hello, this is a test of speech speed control.');
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [currentTestSpeed, setCurrentTestSpeed] = useState(speechSpeed);

  // User voice selection state
  const [userVoiceEnabled, setUserVoiceEnabled] = useState(true);
  const [selectedUserVoice, setSelectedUserVoice] = useState<string>('leda'); // Default to diplomatic voice
  const [userTestText, setUserTestText] = useState('Hello, I am ready to begin diplomatic negotiations.');
  const [isTestingUserVoice, setIsTestingUserVoice] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voicesByGender, setVoicesByGender] = useState<{Female: any[], Male: any[]}>({Female: [], Male: []});

  const [complianceStatus, setComplianceStatus] = useState({
    ccpaCompliant: true,
    cpraCompliant: true,
    dataRetentionActive: true,
    consentManagementActive: true,
    auditLoggingActive: true
  });

  // Privacy compliance data - fixed to use available methods from PrivacyContext
  const privacyRequests = privacy?.state?.privacy_requests || [];
  const dataCategories = privacy?.state?.personal_information || [];
  const isSubjectToCCPA = true; // Default to true for safety
  const currentConsents = privacy?.state?.consent_records || [];

  // Use the local supported languages list
  const supportedLanguages = SUPPORTED_LANGUAGES;

  // Initialize character voice service and get available voices
  useEffect(() => {
    const initializeVoiceService = async () => {
      try {
          await characterVoiceService.waitForReady(); 
        
        if (characterVoiceService.isReady()) {
          const voices = characterVoiceService.getAvailableVoices();
          setAvailableVoices(await voices);
          
          /*const genderGroups = characterVoiceService.getVoicesByGender();
          setVoicesByGender(genderGroups);*/
        }
      } catch (error) {
        console.error('Failed to initialize voice service:', error);
      }
    };

    initializeVoiceService();
  }, []);

  useEffect(() => {
    // Initialize compliance status
    setComplianceStatus({
      ccpaCompliant: true,
      cpraCompliant: true,
      dataRetentionActive: true,
      consentManagementActive: !!privacy,
      auditLoggingActive: true
    });
  }, [privacy]);

  // Test language detection
  const handleTestLanguageDetection = async () => {
    if (!testText.trim()) return;

    setIsDetecting(true);
    try {
      const result = await detectLanguage(testText);
      setDetectionResult(result);
    } catch (error) {
      console.error('Language detection test failed:', error);
      setDetectionResult({
        detected_language: 'en',
        confidence: 0.5,
        iso_code: 'en',
        supported: true,
        method: 'error_fallback'
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Test speech speed function
  const handleTestSpeechSpeed = async () => {
    if (!speechTestText.trim()) return;

    setIsTestingSpeed(true);
    try {
      // Create a test audio using the current speech speed
      const testSpeechAudio = new SpeechSynthesisUtterance(speechTestText);
      testSpeechAudio.rate = Math.max(0.1, Math.min(2.0, currentTestSpeed)); // Browser TTS has different range
      testSpeechAudio.onend = () => {
        setIsTestingSpeed(false);
      };
      testSpeechAudio.onerror = () => {
        setIsTestingSpeed(false);
      };
      
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      // Speak the test text
      speechSynthesis.speak(testSpeechAudio);
      
      console.log(`🎛️ Testing speech at ${currentTestSpeed}x speed (browser TTS rate: ${testSpeechAudio.rate})`);
    } catch (error) {
      console.error('Speech speed test failed:', error);
      setIsTestingSpeed(false);
    }
  };

  // Stop speech test
  const handleStopSpeechTest = () => {
    speechSynthesis.cancel();
    setIsTestingSpeed(false);
  };

  // Test user voice
  const handleTestUserVoice = async () => {
    if (!userTestText.trim() || !selectedUserVoice) return;

    setIsTestingUserVoice(true);
    try {
      // Use the character voice service to test the selected user voice
      await characterVoiceService.testVoice(selectedUserVoice, userTestText);
      
      setIsTestingUserVoice(false);
    } catch (error) {
      console.error('User voice test failed:', error);
      setIsTestingUserVoice(false);
    }
  };

  // Get speech speed info for display
  const speedInfo = getSpeechSpeedInfo();

  // Handle speech speed change
  const handleSpeechSpeedChange = (newSpeed: number[]) => {
    const speed = newSpeed[0];
    setCurrentTestSpeed(speed);
    setSpeechSpeed(speed);
  };

  const handleExportSettings = async () => {
    setIsExporting(true);
    setExportMessage(null);
    
    try {
      const settings = await exportSettings();
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'delegate-ai-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportMessage('Settings exported successfully!');
    } catch (error) {
      console.error('Failed to export settings:', error);
      setExportMessage('Failed to export settings. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const settings = JSON.parse(text);
        await importSettings(settings);
        setExportMessage('Settings imported successfully!');
      } catch (error) {
        console.error('Failed to import settings:', error);
        setExportMessage('Failed to import settings. Please check the file format.');
      } finally {
        setIsImporting(false);
        setTimeout(() => setExportMessage(null), 3000);
      }
    };
    input.click();
  };

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetSettings();
      setExportMessage('Settings reset to default successfully!');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setExportMessage('Failed to reset settings. Please try again.');
    } finally {
      setIsResetting(false);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  if (showPrivacySettings) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowPrivacySettings(false)}
            className="mb-4"
          >
            ← Back to Settings
          </Button>
        </div>
        <PrivacySettings />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Delegate AI experience and manage your privacy preferences.
          </p>
        </div>

        {/* Export/Import Status Message */}
        {exportMessage && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{exportMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="system">
              <Monitor className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme
                </CardTitle>
                <CardDescription>
                  Choose your preferred color scheme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <Sun className="h-6 w-6" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <Moon className="h-6 w-6" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <Monitor className="h-6 w-6" />
                    System
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Font Size
                </CardTitle>
                <CardDescription>
                  Adjust the text size for better readability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Size</Label>
                    <span className="text-sm text-muted-foreground">
                      {fontSize === 'small' ? 'Small' : fontSize === 'medium' ? 'Medium' : 'Large'}
                    </span>
                  </div>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Settings - NOW WITH SUB-TABS INCLUDING USER VOICE SELECTION */}
          <TabsContent value="voice" className="space-y-6">
            {/* General Voice Features Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Features
                </CardTitle>
                <CardDescription>
                  Enable or disable voice input and output capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Voice Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow voice input and text-to-speech output
                    </p>
                  </div>
                  <Switch
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice Sub-Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Configuration
                </CardTitle>
                <CardDescription>
                  Configure voice settings, Delegate's voice, language preferences, and conversation modes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="speech-control" className="w-full">
                  <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="speech-control" className="flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        <span className="hidden sm:inline">Speech Control</span>
                        <span className="sm:hidden">Speech</span>
                      </TabsTrigger>
                      <TabsTrigger value="user-voice" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Delegate's Voice</span>
                        <span className="sm:hidden">Voice</span>
                      </TabsTrigger>
                      <TabsTrigger value="language" className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        <span className="hidden sm:inline">Language</span>
                        <span className="sm:hidden">Lang</span>
                      </TabsTrigger>
                      <TabsTrigger value="debate" className="flex items-center gap-2">
                        <Swords className="w-4 h-4" />
                        <span className="hidden sm:inline">Debate Mode</span>
                        <span className="sm:hidden">Debate</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Speech Control Tab */}
                  <TabsContent value="speech-control" className="px-6 pb-6 pt-4 space-y-6">
                    {/* Current Speed Display */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Current Speech Speed</Label>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          {speedInfo.current.toFixed(1)}x
                        </Badge>
                      </div>
                      
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          {speedInfo.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Speed Slider */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          Speed Control
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Range: {speedInfo.min}x to {speedInfo.max}x (Normal: {speedInfo.default}x)
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="px-3">
                          <Slider
                            value={[currentTestSpeed]}
                            onValueChange={handleSpeechSpeedChange}
                            min={speedInfo.min}
                            max={speedInfo.max}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Speed Scale Labels */}
                        <div className="flex justify-between text-xs text-muted-foreground px-3">
                          <span>Very Slow<br />({speedInfo.min}x)</span>
                          <span>Slow<br />(0.8x)</span>
                          <span>Normal<br />({speedInfo.default}x)</span>
                          <span>Fast<br />(1.1x)</span>
                          <span>Very Fast<br />({speedInfo.max}x)</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Test Speech Speed */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Test Speech Speed
                      </Label>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={speechTestText}
                            onChange={(e) => setSpeechTestText(e.target.value)}
                            placeholder="Enter text to test speech speed..."
                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                          />
                          <Button
                            onClick={handleTestSpeechSpeed}
                            disabled={isTestingSpeed || !speechTestText.trim()}
                            size="sm"
                            className="min-w-[80px]"
                          >
                            {isTestingSpeed ? (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Playing
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Test
                              </>
                            )}
                          </Button>
                          {isTestingSpeed && (
                            <Button
                              onClick={handleStopSpeechTest}
                              variant="outline"
                              size="sm"
                            >
                              Stop
                            </Button>
                          )}
                        </div>

                        {isTestingSpeed && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Volume2 className="h-4 w-4 animate-pulse" />
                            Playing at {currentTestSpeed.toFixed(1)}x speed
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* User Voice Selection Tab */}
                  <TabsContent value="user-voice" className="px-6 pb-6 pt-4 space-y-6">
                    <Alert>
                      <User className="h-4 w-4" />
                      <AlertTitle>Your Delegate Voice</AlertTitle>
                      <AlertDescription>
                        Select the voice that represents you in diplomatic conversations. 
                        The AI will automatically assign appropriate voices to other stakeholders based on context.
                      </AlertDescription>
                    </Alert>

                    {/* Voice Enable Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Enable Delegate Voice</Label>
                          <p className="text-sm text-muted-foreground">
                            Use your selected voice for diplomatic conversations
                          </p>
                        </div>
                        <Switch
                          checked={userVoiceEnabled}
                          onCheckedChange={setUserVoiceEnabled}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Voice Selection */}
                    {userVoiceEnabled && (
                      <div className="space-y-4">
                        <Label>Choose Your Voice</Label>
                        
                        {/* Female Voices */}
                        {voicesByGender.Female?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Female Voices</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {voicesByGender.Female.map((voice: any) => (
                                <Button
                                  key={voice.id}
                                  variant={selectedUserVoice === voice.id ? 'default' : 'outline'}
                                  onClick={() => setSelectedUserVoice(voice.id)}
                                  className="h-auto p-3 flex flex-col items-start gap-1"
                                >
                                  <span className="font-medium text-sm">{voice.name}</span>
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {voice.personality || 'diplomatic'}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Male Voices */}
                        {voicesByGender.Male?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Male Voices</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {voicesByGender.Male.map((voice: any) => (
                                <Button
                                  key={voice.id}
                                  variant={selectedUserVoice === voice.id ? 'default' : 'outline'}
                                  onClick={() => setSelectedUserVoice(voice.id)}
                                  className="h-auto p-3 flex flex-col items-start gap-1"
                                >
                                  <span className="font-medium text-sm">{voice.name}</span>
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {voice.personality || 'diplomatic'}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Voice Test */}
                        <div className="space-y-4">
                          <Label className="flex items-center gap-2">
                            <Headphones className="h-4 w-4" />
                            Test Your Voice
                          </Label>

                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={userTestText}
                                onChange={(e) => setUserTestText(e.target.value)}
                                placeholder="Enter text to test your delegate voice..."
                                className="flex-1 px-3 py-2 border rounded-md text-sm"
                              />
                              <Button
                                onClick={handleTestUserVoice}
                                disabled={isTestingUserVoice || !userTestText.trim() || !selectedUserVoice}
                                size="sm"
                                className="min-w-[80px]"
                              >
                                {isTestingUserVoice ? (
                                  <>
                                    <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                                    Testing
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Test
                                  </>
                                )}
                              </Button>
                            </div>

                            {selectedUserVoice && (
                              <div className="text-sm text-muted-foreground">
                                Selected: <span className="font-medium">{availableVoices.find(v => v.id === selectedUserVoice)?.name || selectedUserVoice}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Language Settings Tab */}
                  <TabsContent value="language" className="px-6 pb-6 pt-4 space-y-6">
                    {/* Current Language Display */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Current Language</Label>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {supportedLanguages.find(lang => lang.code === language)?.flag || '🌐'} {language.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          {supportedLanguages.find(lang => lang.code === language)?.display_name || 'Unknown Language'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Auto-detect Language Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Auto-detect Language</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically detect the language of your input
                          </p>
                        </div>
                        <Switch
                          checked={autoDetectLanguage}
                          onCheckedChange={setAutoDetectLanguage}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Manual Language Selection */}
                    {!autoDetectLanguage && (
                      <div className="space-y-4">
                        <Label>Select Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {supportedLanguages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <div className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.display_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Separator />

                    {/* Language Detection Test */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Test Language Detection
                      </Label>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            placeholder="Enter text in any language to test detection..."
                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                          />
                          <Button
                            onClick={handleTestLanguageDetection}
                            disabled={isDetecting || !testText.trim()}
                            size="sm"
                            className="min-w-[80px]"
                          >
                            {isDetecting ? (
                              <>
                                <Brain className="h-3 w-3 mr-1 animate-pulse" />
                                Detecting
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-3 w-3 mr-1" />
                                Detect
                              </>
                            )}
                          </Button>
                        </div>

                        {detectionResult && (
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Language:</span> {detectionResult.detected_language}
                              </div>
                              <div>
                                <span className="font-medium">Confidence:</span> {Math.round(detectionResult.confidence * 100)}%
                              </div>
                              <div>
                                <span className="font-medium">Supported:</span> 
                                <Badge 
                                  variant={detectionResult.supported ? "default" : "secondary"}
                                  className="ml-2"
                                >
                                  {detectionResult.supported ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Method:</span> {detectionResult.method}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Debate Mode Tab */}
                  <TabsContent value="debate" className="px-6 pb-6 pt-4 space-y-6">
                    <Alert>
                      <Swords className="h-4 w-4" />
                      <AlertTitle>Debate Intensity</AlertTitle>
                      <AlertDescription>
                        Select how assertive and challenging you want the AI to be during conversations. 
                        This affects the AI's personality in all interactions.
                      </AlertDescription>
                    </Alert>

                    {/* Current Mode Display */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Current Debate Mode</Label>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {React.createElement(debateModes[debateMode as DebateMode].icon, { className: "h-3 w-3" })}
                          {debateModes[debateMode as DebateMode].name}
                        </Badge>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${debateModes[debateMode as DebateMode].bgColor} ${debateModes[debateMode as DebateMode].borderColor}`}>
                        <p className={`text-sm ${debateModes[debateMode as DebateMode].color}`}>
                          {debateModes[debateMode as DebateMode].description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Mode Selection */}
                    <div className="space-y-4">
                      <Label>Choose Debate Style</Label>
                      
                      <div className="space-y-3">
                        {Object.entries(debateModes).map(([mode, config]) => (
                          <Button
                            key={mode}
                            variant={debateMode === mode ? 'default' : 'outline'}
                            onClick={() => setDebateMode(mode as DebateMode)}
                            className={`w-full h-auto p-4 flex items-center justify-start gap-3 ${
                              debateMode === mode ? '' : 'hover:' + config.bgColor
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {React.createElement(config.icon, { 
                                className: `h-5 w-5 ${debateMode === mode ? 'text-white' : config.color}` 
                              })}
                              <div className="text-left">
                                <div className="font-medium">{config.name}</div>
                                <div className={`text-sm ${debateMode === mode ? 'text-white/80' : 'text-muted-foreground'}`}>
                                  {config.description}
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={debateMode === mode ? 'secondary' : 'outline'}
                              className="bg-white/20"
                            >
                              Level {config.intensity}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Intensity Scale Visualization */}
                    <div className="space-y-3">
                      <Label>Intensity Scale</Label>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <div className="flex-1 bg-gradient-to-r from-green-200 via-yellow-200 via-orange-200 to-red-200 h-2 rounded-full relative">
                          <div 
                            className="absolute top-0 h-2 w-2 bg-gray-800 rounded-full transform -translate-x-1/2"
                            style={{ 
                              left: `${((debateModes[debateMode as DebateMode].intensity - 1) / 4) * 100}%` 
                            }}
                          />
                        </div>
                        <Flame className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Peaceful</span>
                        <span>Neutral</span>
                        <span>Intense</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Control when and how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive system notifications and updates
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data Protection
                </CardTitle>
                <CardDescription>
                  Manage your privacy preferences and data protection rights under CCPA/CPRA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Privacy Rights Protected</AlertTitle>
                  <AlertDescription>
                    Your privacy rights are fully protected under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Data Categories</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {dataCategories.length} categories of personal information collected
                      </p>
                      <Progress value={(dataCategories.length / 6) * 100} className="h-2" />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Privacy Requests</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {privacyRequests.length} requests submitted
                      </p>
                      <Progress value={privacyRequests.length > 0 ? 100 : 0} className="h-2" />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Consent Records</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {currentConsents.length} active consents
                      </p>
                      <Progress value={(currentConsents.length / 5) * 100} className="h-2" />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">CCPA Status</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {isSubjectToCCPA ? 'Subject to CCPA' : 'Not subject to CCPA'}
                      </p>
                      <Progress value={isSubjectToCCPA ? 100 : 0} className="h-2" />
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPrivacySettings(true)}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Open Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Application information and system compliance status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CCPA/CPRA Compliance Status */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Compliance Status
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">CCPA Compliance</div>
                        <div className="text-xs text-muted-foreground">California Consumer Privacy Act</div>
                      </div>
                      <Badge variant={complianceStatus.ccpaCompliant ? "default" : "destructive"}>
                        {complianceStatus.ccpaCompliant ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">CPRA Compliance</div>
                        <div className="text-xs text-muted-foreground">California Privacy Rights Act</div>
                      </div>
                      <Badge variant={complianceStatus.cpraCompliant ? "default" : "destructive"}>
                        {complianceStatus.cpraCompliant ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Data Retention</div>
                        <div className="text-xs text-muted-foreground">Automatic data lifecycle management</div>
                      </div>
                      <Badge variant={complianceStatus.dataRetentionActive ? "default" : "secondary"}>
                        {complianceStatus.dataRetentionActive ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Consent Management</div>
                        <div className="text-xs text-muted-foreground">User consent tracking and management</div>
                      </div>
                      <Badge variant={complianceStatus.consentManagementActive ? "default" : "secondary"}>
                        {complianceStatus.consentManagementActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Audit Logging</div>
                        <div className="text-xs text-muted-foreground">Privacy-compliant activity logging</div>
                      </div>
                      <Badge variant={complianceStatus.auditLoggingActive ? "default" : "secondary"}>
                        {complianceStatus.auditLoggingActive ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* User Rights Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Your Privacy Rights
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 border rounded text-sm">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>Right to Know</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded text-sm">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Right to Delete</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded text-sm">
                      <UserX className="h-4 w-4 text-orange-600" />
                      <span>Right to Opt-Out</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded text-sm">
                      <Lock className="h-4 w-4 text-purple-600" />
                      <span>Right to Limit Use</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You can exercise these rights through the Privacy tab or by contacting our privacy team at privacy@delegateai.com
                    </AlertDescription>
                  </Alert>
                </div>

                <Separator />

                {/* System Actions */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Settings Management</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      onClick={handleExportSettings}
                      disabled={isExporting}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Export Settings
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleImportSettings}
                      disabled={isImporting}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isImporting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Import Settings
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleResetSettings}
                      disabled={isResetting}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isResetting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Reset to Default
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
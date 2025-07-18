/**
 * HELP PAGE - COMPREHENSIVE DOCUMENTATION FOR CURRENT SYSTEM
 * =========================================================
 * 
 * Updated documentation to accurately reflect the current system capabilities
 * including voice features, admin access (only shown to admins), campaigns feature, and all available functionality.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  HelpCircle,
  MessageSquare,
  Mic,
  Settings,
  Volume2,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Type,
  Bell,
  Lock,
  Eye,
  Trash2,
  UserX,
  CheckCircle,
  Info,
  ExternalLink,
  FileText,
  Keyboard,
  Mouse,
  Smartphone,
  Headphones,
  Crown,
  Database,
  Activity,
  BarChart3,
  Users,
  Terminal,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Brain,
  Swords,
  Heart,
  Scale,
  Flame,
  Cloud
} from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  adminOnly?: boolean;
}

export function HelpPage(): JSX.Element {
  const { currentPersonality, voiceEnabled, language, setCurrentView } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  // Check if user is admin
  const isAdmin = useMemo(() => {
    try {
      if (!user || !isAuthenticated) return false;
      return user.role === 'ADMIN' || user.email === 'your-admin-email@domain.com';
    } catch (error) {
      console.warn('Error checking admin status:', error);
      return false;
    }
  }, [user, isAuthenticated]);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Play,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Welcome to Delegate AI</h3>
            <p className="text-muted-foreground mb-4">
              Delegate AI is an advanced conversational AI platform with voice capabilities, 
              Model UN diplomatic simulations, multiple personality modes, and comprehensive features.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <p className="font-medium">Choose Your Mode</p>
                  <p className="text-sm text-muted-foreground">Start with Chat for text conversations, Voice for speech interactions, or Campaigns for diplomatic simulations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <p className="font-medium">Configure Settings</p>
                  <p className="text-sm text-muted-foreground">Adjust voice preferences, personality mode, and appearance in Settings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <p className="font-medium">Start Conversing</p>
                  <p className="text-sm text-muted-foreground">Begin your conversation with the AI assistant or join a diplomatic simulation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Current Configuration</AlertTitle>
            <AlertDescription>
              Voice: {voiceEnabled ? 'Enabled' : 'Disabled'} • 
              Language: {language.toUpperCase()} • 
              Personality: {currentPersonality}
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'voice-features',
      title: 'Voice Features',
      icon: Mic,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Voice Interaction</h3>
            <p className="text-muted-foreground mb-4">
              Experience natural voice conversations with advanced AI capabilities.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Available Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Voice Input</p>
                    <p className="text-xs text-muted-foreground">Speak naturally to the AI assistant</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Voice Output</p>
                    <p className="text-xs text-muted-foreground">AI responds with natural speech</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Voice Training</p>
                    <p className="text-xs text-muted-foreground">Improve recognition accuracy</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Voice Commands</p>
                    <p className="text-xs text-muted-foreground">Control interface with voice</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Getting Started with Voice</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Click the microphone button or press Space to start recording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Allow microphone permissions when prompted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Speak clearly and naturally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Click stop or press Space again to finish recording</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Swords className="h-4 w-4" />
                AI Personality Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose how the AI engages in conversations:
              </p>
              
              <div className="space-y-3">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Heart className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Collaborative</p>
                      <p className="text-xs text-muted-foreground">Cooperative and supportive discussions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Cloud className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Gentle</p>
                      <p className="text-xs text-muted-foreground">Calm and thoughtful responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Scale className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Balanced</p>
                      <p className="text-xs text-muted-foreground">Neutral and analytical approach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Swords className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Challenging</p>
                      <p className="text-xs text-muted-foreground">Probing questions and critical analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Flame className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Aggressive</p>
                      <p className="text-xs text-muted-foreground">Direct confrontation of ideas</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'campaigns',
      title: 'Model UN Campaigns',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Model UN Campaigns</h3>
            <p className="text-muted-foreground mb-4">
              Experience immersive diplomatic simulations with voice-driven Model UN campaigns 
              featuring real-world climate and humanitarian crisis scenarios.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Campaign Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">What are Model UN Campaigns?</h4>
                <p className="text-sm text-muted-foreground">
                  Interactive diplomatic simulations where you represent different countries and stakeholders 
                  in Model United Nations scenarios. Use voice conversations to engage in realistic debates, 
                  negotiations, and decision-making processes on critical global issues.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Available Campaign Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-3 w-3 text-green-600" />
                      <span className="font-medium text-sm">Climate & Environment</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Address global warming, emissions reduction, renewable energy, and environmental protection strategies</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-3 w-3 text-red-600" />
                      <span className="font-medium text-sm">Humanitarian Crisis</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Navigate refugee situations, disaster response, humanitarian aid coordination, and emergency relief</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-sm">International Trade</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Negotiate trade agreements, tariffs, economic partnerships, and global commerce policies</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3 w-3 text-purple-600" />
                      <span className="font-medium text-sm">Peace & Security</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Address conflicts, peacekeeping operations, arms control, and international security challenges</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="h-3 w-3 text-orange-600" />
                      <span className="font-medium text-sm">Human Rights</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Promote civil liberties, social justice, equality, and fundamental human rights protections</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-yellow-600" />
                      <span className="font-medium text-sm">Economic Development</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Foster sustainable growth, poverty reduction, infrastructure development, and economic cooperation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-3 w-3 text-indigo-600" />
                      <span className="font-medium text-sm">Technology & Ethics</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Navigate AI governance, digital rights, cybersecurity, and ethical technology deployment</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3 w-3 text-teal-600" />
                      <span className="font-medium text-sm">Public Health</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Address global health challenges, pandemic preparedness, healthcare access, and health equity</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Campaign Duration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <p className="font-medium text-sm">Short</p>
                    <p className="text-xs text-muted-foreground">25-45 minutes</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                    <p className="font-medium text-sm">Medium</p>
                    <p className="text-xs text-muted-foreground">45-75 minutes</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-red-600" />
                    <p className="font-medium text-sm">Extended</p>
                    <p className="text-xs text-muted-foreground">75-95+ minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice-Driven Diplomacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">How Voice Campaigns Work</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Select a campaign scenario from the available options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Choose your delegate voice and country/stakeholder representation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Engage in real-time voice conversations with AI-powered delegates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Navigate through multiple phases: briefings, debates, negotiations, resolutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">5.</span>
                    <span>Work towards consensus and collaborative solutions</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Voice Features in Campaigns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Dynamic Character Voices</p>
                    <p className="text-xs text-muted-foreground">30+ unique AI voices automatically assigned to different delegates</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Real-time Translation</p>
                    <p className="text-xs text-muted-foreground">Support for 33 languages with automatic voice adaptation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Session Continuity</p>
                    <p className="text-xs text-muted-foreground">Seamless voice sessions with automatic extensions</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Contextual Responses</p>
                    <p className="text-xs text-muted-foreground">AI adapts to diplomatic context and cultural perspectives</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Debate Strength Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-3">
                Choose how intensely AI delegates engage in diplomatic discussions:
              </p>

              <div className="space-y-3">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Heart className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Collaborative</p>
                      <p className="text-xs text-muted-foreground">Peaceful, cooperative approach focused on consensus building</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Cloud className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Gentle</p>
                      <p className="text-xs text-muted-foreground">Diplomatic and respectful exchanges with careful consideration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Scale className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Balanced</p>
                      <p className="text-xs text-muted-foreground">Professional diplomatic discourse with measured responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Swords className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Challenging</p>
                      <p className="text-xs text-muted-foreground">Rigorous debate with probing questions and critical analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Flame className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Aggressive</p>
                      <p className="text-xs text-muted-foreground">Intense confrontational style with direct challenges</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Campaign Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Getting Started</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Start with shorter campaigns (25-45 minutes) to familiarize yourself</li>
                  <li>• Ensure your microphone is working and environment is quiet</li>
                  <li>• Review the scenario briefing carefully before starting</li>
                  <li>• Choose a debate strength that matches your experience level</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">During Campaigns</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Speak clearly and at a natural pace for best voice recognition</li>
                  <li>• Stay in character and maintain diplomatic language</li>
                  <li>• Listen actively to other delegates' positions and concerns</li>
                  <li>• Use pauses to think strategically about your responses</li>
                  <li>• Focus on finding common ground and collaborative solutions</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Technical Considerations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Longer campaigns use session extensions automatically</li>
                  <li>• Your conversation is saved and available in Transcripts</li>
                  <li>• Voice usage counts toward your daily rate limit</li>
                  <li>• Internet connection is required for real-time voice processing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Ready to Start?</AlertTitle>
            <AlertDescription>
              Navigate to the Model UN Campaigns section to browse available scenarios 
              and begin your diplomatic simulation experience. Remember to check your 
              microphone permissions and daily voice usage allowance before starting.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'settings-guide',
      title: 'Settings Guide',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Settings Overview</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive guide to all available settings and configuration options.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Appearance
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Theme selection (Light, Dark, System)</li>
                    <li>• Font size adjustment (Small, Medium, Large)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enable/disable voice features</li>
                    <li>• Delegate's voice selection (30 AI voices available)</li>
                    <li>• Voice training and calibration</li>
                    <li>• Voice commands configuration</li>
                    <li>• Language selection and auto-detection (33 languages)</li>
                    <li>• Speech speed control with Gemini API integration</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enable/disable notifications</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CCPA/CPRA compliance settings</li>
                    <li>• Data export and deletion</li>
                    <li>• Privacy preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    System
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Settings export and import</li>
                    <li>• System reset options</li>
                    <li>• Privacy compliance status</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Common Issues & Solutions</h3>
            <p className="text-muted-foreground mb-4">
              Quick solutions to frequently encountered problems.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Microphone Not Working</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check if microphone permissions are granted</li>
                    <li>• Ensure microphone is not muted or being used by another app</li>
                    <li>• Try refreshing the page</li>
                    <li>• Check browser microphone settings</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Voice Recognition Issues</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak clearly and at a normal pace</li>
                    <li>• Reduce background noise</li>
                    <li>• Use voice training to improve accuracy</li>
                    <li>• Check internet connection</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Audio Playback Problems</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check system volume settings</li>
                    <li>• Ensure audio is not muted in browser</li>
                    <li>• Try different browser or device</li>
                    <li>• Check internet connectivity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Campaign Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Campaign Won't Start</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensure microphone permissions are granted</li>
                    <li>• Check your daily voice usage allowance</li>
                    <li>• Verify stable internet connection</li>
                    <li>• Try refreshing the page and restarting</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Session Interruptions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Campaigns automatically extend sessions as needed</li>
                    <li>• Check for network connectivity issues</li>
                    <li>• Ensure browser tab remains active</li>
                    <li>• Progress is automatically saved in Transcripts</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">AI Delegates Not Responding</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Wait a moment for AI processing</li>
                    <li>• Try speaking more clearly or rephrasing</li>
                    <li>• Check if you've reached daily usage limits</li>
                    <li>• Restart the campaign if issues persist</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Settings Not Saving</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensure browser allows local storage</li>
                    <li>• Disable private/incognito mode</li>
                    <li>• Clear browser cache and try again</li>
                    <li>• Export settings as backup</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Import/Export Problems</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verify file format is JSON</li>
                    <li>• Check file wasn't corrupted</li>
                    <li>• Ensure file contains valid settings</li>
                    <li>• Try exporting current settings first</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Need More Help?</AlertTitle>
            <AlertDescription>
              If you're still experiencing issues, try resetting to default settings in 
              Settings → System → Reset Settings. This will restore all settings to their 
              default values.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Shortcuts',
      icon: Keyboard,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
            <p className="text-muted-foreground mb-4">
              Speed up your workflow with these helpful keyboard shortcuts.
            </p>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Switch to Chat</span>
                    <Badge variant="outline" className="font-mono">Ctrl + 1</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Switch to Voice</span>
                    <Badge variant="outline" className="font-mono">Ctrl + 2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Switch to Campaigns</span>
                    <Badge variant="outline" className="font-mono">Ctrl + 3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Settings</span>
                    <Badge variant="outline" className="font-mono">Ctrl + ,</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Help</span>
                    <Badge variant="outline" className="font-mono">Ctrl + ?</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chat Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Send Message</span>
                    <Badge variant="outline" className="font-mono">Enter</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Line</span>
                    <Badge variant="outline" className="font-mono">Shift + Enter</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Focus Input</span>
                    <Badge variant="outline" className="font-mono">Ctrl + K</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voice Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Start/Stop Recording</span>
                    <Badge variant="outline" className="font-mono">Space</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Toggle Mute</span>
                    <Badge variant="outline" className="font-mono">Ctrl + M</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    // Admin features section - only visible to admins
    ...(isAdmin ? [{
      id: 'admin-features',
      title: 'Admin Features',
      icon: Crown,
      adminOnly: true,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Administrator Features</h3>
            <p className="text-muted-foreground mb-4">
              Advanced features and monitoring capabilities for system administrators.
            </p>
          </div>

          <Alert>
            <Crown className="h-4 w-4" />
            <AlertTitle>Admin Access Active</AlertTitle>
            <AlertDescription>
              You have administrator privileges and can access these advanced features.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Admin Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Available Admin Views</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-3 w-3" />
                      <span className="font-medium text-sm">Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System overview and metrics</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium text-sm">Users</span>
                    </div>
                    <p className="text-xs text-muted-foreground">User management and analytics</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3 w-3" />
                      <span className="font-medium text-sm">Monitor</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System monitoring and health</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3 w-3" />
                      <span className="font-medium text-sm">Security</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Security monitoring and controls</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-3 w-3" />
                      <span className="font-medium text-sm">Analytics</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Usage analytics and insights</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-3 w-3" />
                      <span className="font-medium text-sm">Database</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Database management tools</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3" />
                      <span className="font-medium text-sm">Campaign Management</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Model UN campaign administration</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal className="h-3 w-3" />
                      <span className="font-medium text-sm">System Logs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System logs and debugging</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">Admin Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Admin users must be authenticated</li>
                  <li>• Admin access is role-based</li>
                  <li>• All admin actions are logged</li>
                  <li>• Session management for security</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }] : [])
  ];

  // Filter sections based on admin status
  const visibleSections = useMemo(() => {
    return helpSections.filter(section => !section.adminOnly || isAdmin);
  }, [helpSections, isAdmin]);

  // Reset active section if it's no longer visible
  React.useEffect(() => {
    if (!visibleSections.find(section => section.id === activeSection)) {
      setActiveSection('getting-started');
    }
  }, [visibleSections, activeSection]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to using Delegate AI with voice capabilities, Model UN campaigns, and advanced features.
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span className="text-xs">Admin documentation included</span>
              </span>
            )}
          </p>
        </div>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                    className="flex items-center gap-2 justify-start h-auto p-3"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs">{section.title}</span>
                    {section.adminOnly && (
                      <Crown className="h-3 w-3 ml-auto" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content Display */}
        <div className="min-h-[400px]">
          {visibleSections.find(section => section.id === activeSection)?.content}
        </div>

        {/* Footer with Links */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <button
                onClick={() => setCurrentView('comprehensive-guide')}
                className="space-y-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <BookOpen className="h-6 w-6 mx-auto text-blue-500 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium group-hover:text-blue-600 transition-colors">Comprehensive Guide</h4>
                <p className="text-sm text-muted-foreground">
                  Complete documentation for all features and capabilities
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View detailed guide</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </button>
              
              <button
                onClick={() => setCurrentView('smart-features')}
                className="space-y-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <Lightbulb className="h-6 w-6 mx-auto text-yellow-500 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium group-hover:text-yellow-600 transition-colors">Smart Features</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced voice capabilities and AI personality modes
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore AI features</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </button>
              
              <button
                onClick={() => {
                  setCurrentView('settings');
                  // Use timeout to ensure settings page loads, then navigate to system tab
                  setTimeout(() => {
                    const systemTab = document.querySelector('[value="system"]') as HTMLElement;
                    if (systemTab) {
                      systemTab.click();
                    }
                  }, 100);
                }}
                className="space-y-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <Target className="h-6 w-6 mx-auto text-green-500 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium group-hover:text-green-600 transition-colors">Privacy Compliant</h4>
                <p className="text-sm text-muted-foreground">
                  CCPA/CPRA compliant with comprehensive privacy controls
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View privacy settings</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Development Team Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-center">Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Our development team is here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection('troubleshooting')}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Troubleshooting Guide
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = encodeURIComponent('Delegate AI - Help Request');
                    const body = encodeURIComponent(
                      'Hi Delegate AI Team,\n\n' +
                      'I need help with:\n\n' +
                      '[Please describe your question or issue here]\n\n' +
                      'Browser: ' + navigator.userAgent + '\n' +
                      'Current View: ' + (typeof window !== 'undefined' ? window.location.hash || 'chat' : 'unknown') + '\n\n' +
                      'Thank you!'
                    );
                    window.open(`mailto:support@delegateai.com?subject=${subject}&body=${body}`, '_blank');
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Contact Support
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = encodeURIComponent('Delegate AI - Feature Request');
                    const body = encodeURIComponent(
                      'Hi Delegate AI Team,\n\n' +
                      'I have a feature request or suggestion:\n\n' +
                      '[Please describe your feature request or suggestion here]\n\n' +
                      'Current View: ' + (typeof window !== 'undefined' ? window.location.hash || 'chat' : 'unknown') + '\n\n' +
                      'Thank you!'
                    );
                    window.open(`mailto:feedback@delegateai.com?subject=${subject}&body=${body}`, '_blank');
                  }}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Send Feedback
                </Button>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Response time: Usually within 24 hours during business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
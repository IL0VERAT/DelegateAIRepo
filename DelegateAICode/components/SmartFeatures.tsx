/**
 * SMART FEATURES - ADVANCED VOICE AND AI CAPABILITIES
 * ===================================================
 * 
 * Hidden page showcasing the intelligent features of Delegate AI,
 * focusing on voice capabilities, AI personality modes, and smart automation.
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowLeft,
  Lightbulb,
  Brain,
  Mic,
  Volume2,
  Zap,
  Sparkles,
  Heart,
  Cloud,
  Scale,
  Swords,
  Flame,
  Languages,
  Headphones,
  Waves,
  Radio,
  Sliders,
  Gauge,
  RotateCw,
  Settings,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Star,
  CheckCircle,
  Info,
  Play,
  Pause,
  Workflow,
  Cpu,
  Database,
  Globe,
  Users,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Layers,
  Network,
  Smartphone,
  Monitor,
  Keyboard,
  Eye,
  Ear,
  Microphone,
  Speaker
} from 'lucide-react';

export function SmartFeatures(): JSX.Element {
  const { setCurrentView, currentPersonality, voiceEnabled, language, speechSpeed } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [demoMode, setDemoMode] = useState('voice-recognition');

  const isAdmin = user?.role === 'admin' || user?.email === 'your-admin-email@domain.com';

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('help')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Help
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
              Smart Features & AI Capabilities
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore the intelligent voice processing, AI personality system, and advanced automation features
            </p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Brain className="h-5 w-5" />
                AI Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Advanced language models with personality-driven responses and contextual understanding.
              </p>
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                5 personality modes • Context retention • Adaptive responses
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Mic className="h-5 w-5" />
                Voice Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 dark:text-green-300">
                Real-time speech recognition, natural language understanding, and high-quality synthesis.
              </p>
              <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                Multi-language • Speed control • Noise suppression
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Sparkles className="h-5 w-5" />
                Smart Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Intelligent workflow automation, voice commands, and personalized user experience.
              </p>
              <div className="mt-3 text-xs text-purple-600 dark:text-purple-400">
                Voice commands • Auto-detection • Adaptive UI
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="voice-intelligence" className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span className="hidden sm:inline">Voice AI</span>
            </TabsTrigger>
            <TabsTrigger value="personality-system" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              <span className="hidden sm:inline">Personalities</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="demos" className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              <span className="hidden sm:inline">Demos</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Intelligent Conversation Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Our AI engine combines advanced language models with sophisticated personality systems 
                    to deliver natural, contextual conversations that adapt to your communication style.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">5</div>
                      <div className="text-xs text-muted-foreground">Personality Modes</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">34</div>
                      <div className="text-xs text-muted-foreground">Languages</div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Current Status</AlertTitle>
                    <AlertDescription>
                      Mode: {currentPersonality} • Voice: {voiceEnabled ? 'Active' : 'Inactive'} • Language: {language.toUpperCase()}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-blue-600" />
                    Advanced Voice Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Cutting-edge voice technology powered by Google's Gemini Live API 
                    for seamless real-time conversation in 34 languages with native voice quality.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Voice Processing</span>
                      <Badge variant="default">Gemini Live API</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Real-time Conversation</span>
                      <Badge variant="default">Native Integration</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Voice Support</span>
                      <Badge variant="secondary">30 Different Voices</Badge>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Live API Features</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Real-time bidirectional voice conversation</li>
                      <li>• Native voice quality with 30 AI voices</li>
                      <li>• Session extensions for longer campaigns</li>
                      <li>• Automatic voice character assignment</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice Intelligence Tab */}
          <TabsContent value="voice-intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Voice Processing Pipeline</CardTitle>
                <CardDescription>
                  Complete breakdown of our voice processing technology and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our voice intelligence system uses cutting-edge neural networks for speech recognition,
                  natural language understanding, and high-quality speech synthesis with emotion control.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personality System Tab */}
          <TabsContent value="personality-system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Personality Modes</CardTitle>
                <CardDescription>
                  Five distinct personality modes that shape how the AI engages in conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950/20 text-center">
                    <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Collaborative</h3>
                    <Badge variant="secondary" className="mb-2">Level 1</Badge>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Peaceful, cooperative discussions focused on consensus building
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-center">
                    <Cloud className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Gentle</h3>
                    <Badge variant="secondary" className="mb-2">Level 2</Badge>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Calm, respectful exchanges with empathetic responses
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg border-purple-200 bg-purple-50 dark:bg-purple-950/20 text-center">
                    <Scale className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">Balanced</h3>
                    <Badge variant="secondary" className="mb-2">Level 3</Badge>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Neutral, analytical approach with objective reasoning
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20 text-center">
                    <Swords className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">Challenging</h3>
                    <Badge variant="secondary" className="mb-2">Level 4</Badge>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      Probing discussions that test arguments and ideas
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20 text-center">
                    <Flame className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Aggressive</h3>
                    <Badge variant="secondary" className="mb-2">Level 5</Badge>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Intense, direct confrontation with strong opinions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Automation Features</CardTitle>
                <CardDescription>
                  Intelligent automation that learns from your usage patterns and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our automation system provides voice commands, adaptive interface adjustments,
                  and intelligent workflow optimization to enhance your experience.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics & Insights</CardTitle>
                <CardDescription>
                  Detailed analytics on voice usage, personality preferences, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive analytics showing voice usage patterns, AI personality preferences,
                  system performance metrics, and user engagement insights to optimize your experience.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demos Tab */}
          <TabsContent value="demos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Demonstrations</CardTitle>
                <CardDescription>
                  Experience the smart features through interactive demos and examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interactive demonstrations of voice recognition, AI personality modes,
                  and smart automation features to help you understand and utilize the full
                  capabilities of Delegate AI.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SmartFeatures;
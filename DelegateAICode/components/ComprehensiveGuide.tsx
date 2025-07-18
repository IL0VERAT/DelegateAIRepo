/**
 * COMPREHENSIVE GUIDE - EXTENSIVE FEATURE BREAKDOWN
 * =================================================
 * 
 * Hidden page with detailed documentation of all system features,
 * capabilities, and advanced functionality.
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
  BookOpen,
  Brain,
  Cpu,
  Database,
  Globe,
  Heart,
  Keyboard,
  Languages,
  Lock,
  MessageSquare,
  Mic,
  Monitor,
  Scale,
  Settings,
  Shield,
  Smartphone,
  Swords,
  Users,
  Volume2,
  Zap,
  Cloud,
  Flame,
  Activity,
  BarChart3,
  Terminal,
  Crown,
  Eye,
  Download,
  Upload,
  Trash2,
  UserX,
  CheckCircle,
  Info,
  AlertTriangle,
  HelpCircle,
  Bell,
  Palette,
  Type,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCw,
  Gauge,
  FileText,
  ExternalLink,
  Star,
  Target,
  Lightbulb,
  Headphones,
  Waves,
  Radio,
  Sliders,
  Filter,
  Sparkles,
  Layers,
  Workflow,
  Network,
  Server,
  Code,
  Blocks,
  Cog,
  RefreshCw,
  Timer,
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  GitBranch,
  Package,
  Boxes,
  Wrench,
  Tool,
  Scan,
  Search,
  Key,
  Fingerprint,
  UserCheck,
  ShieldCheck,
  Archive,
  History,
  Calendar,
  Clock,
  AlarmClock,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  Volume,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  FolderOpen,
  Import,
  Copy,
  Clipboard,
  FileEdit,
  FilePlus,
  FileX,
  Folder,
  HardDrive,
  Smile
} from 'lucide-react';

export function ComprehensiveGuide(): JSX.Element {
  const { setCurrentView, currentPersonality, voiceEnabled, language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'your-admin-email@domain.com';

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
              <BookOpen className="h-8 w-8 text-blue-600" />
              Comprehensive Feature Guide
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete breakdown of all Delegate AI capabilities, features, and advanced functionality
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="core-features" className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span className="hidden sm:inline">Core</span>
            </TabsTrigger>
            <TabsTrigger value="voice-system" className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="ai-capabilities" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="privacy-security" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span className="hidden sm:inline">Technical</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Platform Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Delegate AI is a comprehensive conversational AI platform powered by Google's Gemini Live API, 
                      featuring voice-driven Model UN diplomatic simulations, multi-personality AI interactions, 
                      and enterprise-grade privacy compliance with support for 34 languages and 30 unique AI voices.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          Conversational AI
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced chat interface with context awareness, personality modes, 
                          and intelligent response generation powered by Gemini.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Mic className="h-4 w-4 text-green-600" />
                          Voice Processing
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time bidirectional voice conversation powered by Gemini Live API 
                          with 30 distinct AI voices and 34 language support.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          Model UN Campaigns
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Voice-driven diplomatic simulations across 8 campaign categories 
                          with dynamic AI delegates and realistic negotiation scenarios.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          Privacy Compliant
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Full CCPA/CPRA compliance with comprehensive data protection, 
                          user rights management, and privacy controls.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="h-5 w-5 text-blue-600" />
                      System Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Layers className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Frontend Layer</span>
                        </div>
                        <span className="text-sm text-muted-foreground">React + Tailwind v4 + TypeScript</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Backend Services</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Node.js + Express + Prisma</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">AI Integration</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Google Gemini Live API</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-red-600" />
                          <span className="font-medium">Security Layer</span>
                        </div>
                        <span className="text-sm text-muted-foreground">End-to-end encryption + Auth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Voice Features</span>
                          <span className="text-green-600 font-medium">
                            {voiceEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Current Language</span>
                          <span className="font-medium">{language.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>AI Personality</span>
                          <span className="font-medium">{currentPersonality}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>AI Voices Available</span>
                          <span className="text-blue-600 font-medium">30 Voices</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Languages Supported</span>
                          <span className="text-blue-600 font-medium">34 Languages</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Privacy Status</span>
                          <span className="text-green-600 font-medium">CCPA/CPRA Compliant</span>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Admin Access</span>
                            <span className="text-blue-600 font-medium">Active</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feature Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Text Chat</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Voice Chat</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Model UN Campaigns</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Personalities</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Voice Training</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Transcripts</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Settings Export</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Privacy Controls</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      {isAdmin && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Admin Console</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Core Features Tab */}
          <TabsContent value="core-features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Chat Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Core Capabilities</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time conversational AI powered by Google Gemini</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Multi-turn dialogue with context awareness</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Markdown support for rich text formatting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Code syntax highlighting and analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Conversation export and sharing capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Daily usage tracking with visual progress bar</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Advanced Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Dynamic personality adaptation based on context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>5 distinct AI personality modes with unique response styles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic conversation summarization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Copy, export, and clear conversation controls</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Model UN Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Campaign Categories</h4>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Globe className="h-3 w-3 text-green-600" />
                        <span>Climate & Environment</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Heart className="h-3 w-3 text-red-600" />
                        <span>Humanitarian Crisis</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <BarChart3 className="h-3 w-3 text-blue-600" />
                        <span>International Trade</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Shield className="h-3 w-3 text-purple-600" />
                        <span>Peace & Security</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice-Driven Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time voice conversations with AI delegates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>30 unique AI voices automatically assigned to characters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Session extensions for longer diplomatic scenarios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Debate strength modes from collaborative to aggressive</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-green-600" />
                    Voice Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Gemini Live Integration</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time bidirectional voice conversation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Native voice quality with no additional processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic language detection across 34 languages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Session management with automatic extensions</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>30 different AI voices (14 female, 16 male)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Delegate voice selection and preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Context-aware voice matching for characters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Speech speed control with Gemini API integration</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Transcript Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Recording & Storage</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic conversation transcription for all modes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time transcript synchronization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Campaign-specific transcript categorization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Searchable conversation history</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Export & Analysis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Multiple export formats (PDF, JSON, TXT)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Campaign performance analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Diplomatic negotiation insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Voice interaction pattern analysis</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-orange-600" />
                    Productivity Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Switch to Chat</span>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+1</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Switch to Voice</span>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+2</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Switch to Campaigns</span>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+3</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Start/Stop Recording</span>
                        <Badge variant="outline" className="font-mono text-xs">Space</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Open Settings</span>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+,</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Focus Input</span>
                        <Badge variant="outline" className="font-mono text-xs">Ctrl+K</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Actions</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>One-click personality mode switching</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Instant voice/delegate voice selection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Quick campaign category selection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Rapid export and sharing options</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice System Tab */}
          <TabsContent value="voice-system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-blue-600" />
                    Gemini Live API Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Core Technology</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Google Gemini 2.5 Flash Live API Native integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time bidirectional voice conversation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Session extensions for longer interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Native voice quality without additional processing</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice Capabilities</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>30 unique AI voices (14 female, 16 male)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic voice assignment based on context and role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>User-selectable delegate voice (default: "Leda")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Context-aware voice matching for campaign characters</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-green-600" />
                    Multi-Language Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Language Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>34 supported languages with native voice support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic language detection and switching</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time voice adaptation to selected language</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Cultural context awareness in responses</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Language Selection</h4>
                    <p className="text-sm text-muted-foreground">
                      Users can select from 34 available languages in Settings, including major 
                      world languages and regional variants. The voice system automatically 
                      adapts to provide native-quality speech in the selected language.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-purple-600" />
                    Voice Controls & Training
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">User Controls</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Speech speed control integrated with Gemini API</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Voice enable/disable toggle</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Delegate voice selection from 30 options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Voice training and calibration system</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Advanced Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Voice commands for interface control</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Noise suppression and echo cancellation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic microphone permission management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Daily usage tracking with 3000 word limit</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    Usage Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Rate Limiting</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>3000 words per day limit for free users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>24-hour reset cycle with timezone awareness</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Visual progress bar with color coding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Smart tooltips with usage insights</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Usage Analytics</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time usage tracking and display</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Usage pattern analysis and recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Usage excluded from Campaigns and Transcripts pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Animated progress updates with smooth transitions</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Capabilities Tab */}
          <TabsContent value="ai-capabilities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Personality System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Five Personality Modes</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">Collaborative</span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Peaceful, cooperative discussions focused on consensus building and mutual understanding.
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Cloud className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-200">Gentle</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Calm, respectful exchanges with empathetic responses and careful consideration.
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-800 dark:text-purple-200">Balanced</span>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          Neutral, analytical approach with objective reasoning and measured responses.
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Swords className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800 dark:text-orange-200">Challenging</span>
                        </div>
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          Probing discussions that test arguments and ideas with critical analysis.
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800 dark:text-red-200">Aggressive</span>
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Intense, direct confrontation with strong opinions and challenging debates.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Campaign AI System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Diplomatic AI Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Context-aware diplomatic responses based on campaign type</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dynamic character generation with unique personalities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic voice assignment based on character role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Realistic negotiation tactics and diplomatic strategies</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">8 Campaign Categories</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border rounded text-center">
                        <Globe className="h-3 w-3 mx-auto mb-1 text-green-600" />
                        <span>Climate & Environment</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Heart className="h-3 w-3 mx-auto mb-1 text-red-600" />
                        <span>Humanitarian Crisis</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <BarChart3 className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                        <span>International Trade</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Shield className="h-3 w-3 mx-auto mb-1 text-purple-600" />
                        <span>Peace & Security</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Scale className="h-3 w-3 mx-auto mb-1 text-orange-600" />
                        <span>Human Rights</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Target className="h-3 w-3 mx-auto mb-1 text-yellow-600" />
                        <span>Economic Development</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Brain className="h-3 w-3 mx-auto mb-1 text-indigo-600" />
                        <span>Technology & Ethics</span>
                      </div>
                      <div className="p-2 border rounded text-center">
                        <Activity className="h-3 w-3 mx-auto mb-1 text-teal-600" />
                        <span>Public Health</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    Intelligent Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Smart Automation</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic microphone permission handling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Smart voice training and calibration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Adaptive UI based on user preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Context-aware response generation</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Learning & Adaptation</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>User preference learning and memory</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Conversation style adaptation over time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Dynamic personality mode recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Personalized campaign suggestions</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-green-600" />
                    Integration Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">API Integrations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Google Gemini Live API for voice processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time session management and extensions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>WebSocket connections for real-time updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>RESTful API endpoints for data management</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Data Processing</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time transcript generation and synchronization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic conversation categorization and tagging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Usage analytics and pattern recognition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Multi-format export and data portability</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Appearance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Theme Options</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Light theme with clean, professional appearance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dark theme with comfortable low-light experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>System theme that follows OS preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic theme switching based on time</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Typography</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Three font size options: Small (13px), Medium (14px), Large (16px)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Optimized typography scales for readability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Accessibility-compliant contrast ratios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Smooth font size transitions</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-green-600" />
                    Voice Customization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice Selection</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>30 unique AI voices available for delegate selection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>14 female and 16 male voice options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Default delegate voice set to "Leda"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Voice preview functionality before selection</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice Controls</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Speech speed control with Gemini API integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Voice training system for improved recognition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Voice commands configuration and customization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Auto-detection toggle for language switching</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-purple-600" />
                    Language & Localization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Language Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose from 34 supported languages with native voice support and 
                      cultural context awareness for diplomatic scenarios.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border rounded">English (US)</div>
                      <div className="p-2 border rounded">Spanish (ES)</div>
                      <div className="p-2 border rounded">French (FR)</div>
                      <div className="p-2 border rounded">German (DE)</div>
                      <div className="p-2 border rounded">Italian (IT)</div>
                      <div className="p-2 border rounded">Portuguese (PT)</div>
                      <div className="text-center p-2 text-muted-foreground">...and 28 more</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Localization Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Cultural context adaptation in responses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Time zone-aware daily usage reset</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Region-specific diplomatic protocols</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    Notifications & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Notification Settings</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Enable/disable notifications globally</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Campaign completion notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Daily usage limit warnings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Voice training reminders</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">System Preferences</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Settings export and import functionality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Complete system reset options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Privacy compliance status display</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic preference backup</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy-security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    CCPA/CPRA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Consumer Rights</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Right to know what personal information is collected</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Right to delete personal information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Right to opt-out of sale of personal information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Right to non-discrimination for exercising privacy rights</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Data Protection</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>End-to-end encryption for all voice communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Local storage with user-controlled data retention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic data expiration and cleanup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Privacy-by-design architecture</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Authentication & Access</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Secure user authentication with session management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Role-based access control for admin features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic session timeout and cleanup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Secure API key management</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Data Security</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>HTTPS/TLS encryption for all communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Content Security Policy (CSP) implementation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Input validation and sanitization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Regular security audits and updates</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Privacy Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">User Controls</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Granular privacy settings for each feature</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Data export in standard formats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Complete data deletion on request</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Privacy preference persistence</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Transparency</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Clear data usage policies and explanations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time privacy status indicators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Data retention period notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Third-party integration disclosure</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Storage & Retention</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Local browser storage for user preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Configurable data retention periods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic cleanup of expired data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Secure data backup and recovery</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Compliance Monitoring</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Continuous compliance verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Automated privacy impact assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Regular security and privacy audits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Compliance reporting and documentation</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Frontend Technologies</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>React 18 with TypeScript for type safety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Tailwind CSS v4.0 for modern styling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Vite for fast development and building</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>ShadCN/UI component library for consistency</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Backend Technologies</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Node.js with Express.js framework</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Prisma ORM for database management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>WebSocket support for real-time features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>RESTful API design with proper HTTP methods</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-green-600" />
                    API Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Google Gemini Integration</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Gemini 2.5 Flash Live API for voice interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time bidirectional voice conversation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Session management with automatic extensions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>30 native AI voices with context-aware assignment</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">API Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Rate limiting and usage tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Error handling and retry mechanisms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Request/response logging and monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Authentication and security middleware</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-600" />
                    Performance & Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Frontend Optimization</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Code splitting and lazy loading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Asset optimization and compression</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Service worker for offline capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Hardware-accelerated animations</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Backend Performance</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Database query optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Caching strategies for frequently accessed data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Connection pooling and resource management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Load balancing and horizontal scaling support</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    Device Support & Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Cross-Platform Support</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Responsive design for all screen sizes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Progressive Web App (PWA) capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Browser compatibility testing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Mobile-first design approach</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Accessibility Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>WCAG 2.1 AA compliance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Screen reader compatibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Keyboard navigation support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>High contrast mode and reduced motion support</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Tab - Only visible to admins */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      Admin Console Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">System Management</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Comprehensive dashboard with system metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>User management and role assignment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>System monitoring and health checks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Security center with threat detection</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Analytics & Reporting</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Usage analytics and user behavior insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Campaign performance and engagement metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>System performance monitoring</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Database management and optimization</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-green-600" />
                      Advanced Administration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">System Controls</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>System logs and debugging information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Campaign management and content control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>API usage monitoring and rate limit adjustment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Voice system configuration and testing</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Maintenance & Updates</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>System backup and recovery procedures</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Feature flag management and A/B testing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Performance optimization tools and metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>Privacy compliance monitoring and reporting</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Admin Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Important Notice</AlertTitle>
                      <AlertDescription>
                        Admin access comes with significant responsibilities. Always follow security best practices, 
                        maintain user privacy, and ensure compliance with all applicable regulations. 
                        All admin actions are logged and audited for security purposes.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default ComprehensiveGuide;
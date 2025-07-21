/**
 * MODEL UN CAMPAIGNS - ORIGINAL UI WITH CAMPAIGN SELECTION
 * =======================================================
 * 
 * Restored original campaign selection interface where users first pick a campaign,
 * then transition to the full-screen "secret" campaign interface once it begins.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Users, ChevronUp, ChevronDown, Clock, Play, 
  Globe, Shield, Zap, Target, ChevronRight, Calendar,
  MapPin, Award, AlertTriangle, Briefcase, Heart, Leaf
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { aiCampaignService } from '../services/aiCampaignService';
import { characterVoiceService } from '../services/characterVoiceService';
import { campaignOrchestrator, type CampaignTimeline } from '../services/campaignOrchestrator';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CampaignTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'crisis' | 'negotiation' | 'security' | 'humanitarian' | 'economic' | 'environmental' | 'political' | 'social';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  playerCount: number;
  aiDelegates: number;
  theme: string;
  context: string;
  objectives: string[];
  scenarios: string[];
  keyIssues: string[];
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  featured: boolean;
  new: boolean;
}

interface CampaignCharacter {
  id: string;
  name: string;
  title: string;
  country: string;
  faction: string;
  personality: string;
  speaking: boolean;
  lastStatement: string;
  color: string;
}

interface CampaignCrisis {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timeRemaining: number;
  keyFacts: string[];
  possibleOutcomes: string[];
}

interface CampaignSession {
  id: string;
  title: string;
  playerCharacter: CampaignCharacter;
  aiCharacters: CampaignCharacter[];
  currentCrisis: CampaignCrisis;
  campaignLog: any[];
  voiceSettings: any;
  sessionState: string;
  outcomes?: string[];
}

type CampaignPhase = 'selection' | 'details' | 'active';

// ============================================================================
// CAMPAIGN TEMPLATES DATA
// ============================================================================

const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'climate-crisis-2024',
    title: 'Global Climate Crisis Summit',
    subtitle: 'Climate Emergency Response',
    description: 'Navigate critical climate negotiations as world leaders race against time to prevent catastrophic warming while balancing economic and social justice concerns.',
    category: 'environmental',
    difficulty: 'intermediate',
    duration: 45,
    playerCount: 1,
    aiDelegates: 6,
    theme: 'Climate Change and International Cooperation',
    context: 'A critical climate summit where nations must reach binding agreements on emissions reduction while balancing economic concerns and social justice.',
    objectives: [
      'Negotiate binding emissions reduction targets',
      'Address climate justice for developing nations',
      'Secure climate financing commitments',
      'Balance economic growth with environmental protection'
    ],
    scenarios: [
      'Island nations demand immediate action',
      'Major emitters resist binding commitments',
      'Climate activists pressure delegates',
      'Economic recession threatens green investments'
    ],
    keyIssues: ['Carbon pricing', 'Technology transfer', 'Loss and damage fund', 'Just transition'],
    icon: Leaf,
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-600',
    featured: true,
    new: false
  },
  {
    id: 'ukraine-humanitarian-crisis',
    title: 'Ukraine Humanitarian Crisis',
    subtitle: 'Emergency Aid Coordination',
    description: 'Coordinate international humanitarian response to the ongoing crisis in Ukraine, managing refugee flows, aid distribution, and diplomatic pressure.',
    category: 'humanitarian',
    difficulty: 'advanced',
    duration: 60,
    playerCount: 1,
    aiDelegates: 8,
    theme: 'Humanitarian Crisis Management',
    context: 'The international community must coordinate humanitarian aid while navigating complex geopolitical tensions and ensuring aid reaches those in need.',
    objectives: [
      'Establish humanitarian corridors',
      'Coordinate refugee assistance',
      'Secure funding for aid operations',
      'Navigate diplomatic sensitivities'
    ],
    scenarios: [
      'Humanitarian aid blocked at borders',
      'Refugee camps reaching capacity',
      'Donor fatigue threatens funding',
      'Political tensions complicate aid delivery'
    ],
    keyIssues: ['Safe passage', 'International law', 'Coordination mechanisms', 'Funding gaps'],
    icon: Heart,
    color: 'text-red-600',
    bgGradient: 'from-red-500 to-rose-600',
    featured: true,
    new: true
  },
  {
    id: 'cyber-security-summit',
    title: 'Global Cybersecurity Alliance',
    subtitle: 'Digital Threat Response',
    description: 'Build international cooperation frameworks to combat cyber threats, ransomware attacks, and state-sponsored hacking operations.',
    category: 'security',
    difficulty: 'expert',
    duration: 50,
    playerCount: 1,
    aiDelegates: 7,
    theme: 'Cybersecurity and Digital Governance',
    context: 'Rising cyber threats require unprecedented international cooperation, but national security concerns and sovereignty issues complicate collaboration.',
    objectives: [
      'Establish cyber incident response protocols',
      'Create international cyber law framework',
      'Share threat intelligence securely',
      'Address ransomware and criminal networks'
    ],
    scenarios: [
      'Major infrastructure cyber attack',
      'State-sponsored hacking allegations',
      'Private sector resistance to regulation',
      'Attribution challenges complicate response'
    ],
    keyIssues: ['Attribution standards', 'Information sharing', 'Private sector engagement', 'Sovereignty vs cooperation'],
    icon: Shield,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-indigo-600',
    featured: false,
    new: false
  },
  {
    id: 'trade-war-mediation',
    title: 'US-China Trade Mediation',
    subtitle: 'Economic Diplomacy',
    description: 'Mediate escalating trade tensions between major economic powers while protecting smaller nations from economic fallout.',
    category: 'economic',
    difficulty: 'advanced',
    duration: 55,
    playerCount: 1,
    aiDelegates: 6,
    theme: 'International Trade and Economic Cooperation',
    context: 'Trade wars threaten global economic stability. International mediators must find common ground while addressing legitimate concerns from all parties.',
    objectives: [
      'Reduce trade barriers and tariffs',
      'Address intellectual property disputes',
      'Protect developing nation interests',
      'Establish fair trade mechanisms'
    ],
    scenarios: [
      'Tariff escalation threatens supply chains',
      'Technology transfer disputes intensify',
      'Developing nations caught in crossfire',
      'Financial markets react to negotiations'
    ],
    keyIssues: ['Technology transfer', 'Market access', 'Currency manipulation', 'WTO reform'],
    icon: Briefcase,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-amber-600',
    featured: false,
    new: false
  },
  {
    id: 'nuclear-non-proliferation',
    title: 'Nuclear Non-Proliferation Treaty',
    subtitle: 'Disarmament Negotiations',
    description: 'Navigate complex nuclear disarmament negotiations while addressing security concerns and preventing proliferation.',
    category: 'security',
    difficulty: 'expert',
    duration: 70,
    playerCount: 1,
    aiDelegates: 9,
    theme: 'Nuclear Security and Disarmament',
    context: 'Nuclear weapons pose existential threats, but disarmament efforts face resistance from nuclear powers and security concerns from non-nuclear states.',
    objectives: [
      'Strengthen non-proliferation regime',
      'Advance disarmament commitments',
      'Address security assurances',
      'Prevent nuclear terrorism'
    ],
    scenarios: [
      'Nuclear powers resist disarmament',
      'Non-nuclear states demand security guarantees',
      'Nuclear terrorism threat emerges',
      'Verification mechanisms disputed'
    ],
    keyIssues: ['Verification systems', 'Security assurances', 'Peaceful nuclear energy', 'Regional security'],
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-500 to-orange-500',
    featured: false,
    new: false
  },
  {
    id: 'pandemic-preparedness',
    title: 'Global Pandemic Preparedness',
    subtitle: 'Health Security Framework',
    description: 'Build international frameworks for pandemic prevention, detection, and response based on lessons learned from COVID-19.',
    category: 'humanitarian',
    difficulty: 'intermediate',
    duration: 40,
    playerCount: 1,
    aiDelegates: 7,
    theme: 'Global Health Security',
    context: 'The COVID-19 pandemic exposed gaps in global health preparedness. Nations must cooperate to prevent future pandemics while addressing equity concerns.',
    objectives: [
      'Establish early warning systems',
      'Ensure equitable vaccine distribution',
      'Strengthen health system capacity',
      'Coordinate international response'
    ],
    scenarios: [
      'New pathogen detected with pandemic potential',
      'Vaccine nationalism threatens equity',
      'Developing countries lack capacity',
      'Misinformation undermines response'
    ],
    keyIssues: ['Pathogen surveillance', 'Vaccine equity', 'Health financing', 'Information sharing'],
    icon: Globe,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-violet-600',
    featured: true,
    new: true
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModelUNCampaigns() {
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<CampaignPhase>('selection');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignTemplate | null>(null);
  
  // Campaign execution state (for active phase)
  const [session, setSession] = useState<CampaignSession | null>(null);
  const [timeline, setTimeline] = useState<CampaignTimeline | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [bottomSectionVisible, setBottomSectionVisible] = useState(true);
  const [activePanelType, setActivePanelType] = useState<'crisis' | 'updates'>('crisis');
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [orchestrationStatus, setOrchestrationStatus] = useState<any>(null);
  
  // Campaign selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ============================================================================
  // CAMPAIGN SELECTION LOGIC
  // ============================================================================

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe },
    { id: 'crisis', name: 'Crisis Management', icon: AlertTriangle },
    { id: 'negotiation', name: 'Negotiations', icon: Target },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'humanitarian', name: 'Humanitarian', icon: Heart },
    { id: 'economic', name: 'Economic', icon: Briefcase },
    { id: 'environmental', name: 'Environmental', icon: Leaf },
    { id: 'political', name: 'Political', icon: Users },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'expert', name: 'Expert' }
  ];

  const filteredCampaigns = CAMPAIGN_TEMPLATES.filter(campaign => {
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || campaign.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const featuredCampaigns = filteredCampaigns.filter(c => c.featured);
  const regularCampaigns = filteredCampaigns.filter(c => !c.featured);

  // ============================================================================
  // CAMPAIGN INITIALIZATION (for active phase)
  // ============================================================================

  const initializeCampaign = useCallback(async (campaignTemplate: CampaignTemplate) => {
    setIsInitializing(true);
    
    try {
      logger.info('Initializing Model UN campaign:', campaignTemplate.id);

      // Generate player character
      const playerCharacter = await aiCampaignService.generatePlayerCharacter(campaignTemplate);
      
      // Generate AI characters
      const aiCharacters = await aiCampaignService.generateAICharacters(campaignTemplate, playerCharacter);
      
      // Generate initial crisis
      const initialCrisis = await aiCampaignService.generateCrisis(
        campaignTemplate.scenarios[0],
        {
          id: 'temp-session',
          scenario: campaignTemplate,
          playerCharacter,
          aiCharacters,
          currentPhase: { name: 'Opening Statements' },
          campaignLog: []
        } as any
      );

      // Create campaign session
      const newSession: CampaignSession = {
        id: `campaign-${Date.now()}`,
        title: campaignTemplate.title,
        playerCharacter,
        aiCharacters,
        currentCrisis: initialCrisis,
        campaignLog: [
          {
            title: 'CAMPAIGN INITIATED',
            content: `Welcome to the ${campaignTemplate.title}. As ${playerCharacter.title} representing ${playerCharacter.country}, you must navigate complex diplomatic negotiations.`,
            timestamp: new Date(),
            type: 'system_message'
          }
        ],
        voiceSettings: {
          enabled: true,
          autoplay: true,
          speechRate: 1.0,
          volume: 0.8,
          characterVoices: {}
        },
        sessionState: 'active'
      };

      // Assign voices to characters
      await characterVoiceService.assignVoices(newSession);

      // Initialize AI orchestration
      await campaignOrchestrator.initializeCampaign(newSession, campaignTemplate.duration);

      setSession(newSession);
      setCurrentPhase('active');
      
      logger.info('Campaign initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize campaign:', error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // ============================================================================
  // ORCHESTRATION STATUS MONITORING (for active phase)
  // ============================================================================

  useEffect(() => {
    if (currentPhase !== 'active' || !session) return;

    const statusInterval = setInterval(() => {
      const status = campaignOrchestrator.getCampaignStatus();
      setOrchestrationStatus(status);
      setTimeline(status.timeline);

      if (status.timeline && session) {
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            sessionState: status.isActive ? 'active' : 'concluded'
          };
        });
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [currentPhase, session]);

  // ============================================================================
  // VOICE INPUT HANDLING (for active phase)
  // ============================================================================

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      
    } catch (error) {
      logger.error('Failed to start audio recording:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processAudioInput = async (audioBlob: Blob) => {
    if (!session) return;

    try {
      const transcript = "I propose we establish a comprehensive framework for international cooperation on this critical issue.";
      const response = await aiCampaignService.processPlayerInput(transcript, session);
      
      const updatedSession = {
        ...session,
        campaignLog: [
          ...session.campaignLog,
          {
            title: 'PLAYER STATEMENT',
            content: transcript,
            timestamp: new Date(),
            type: 'player_input'
          },
          ...response.characterResponses?.map((resp: any) => ({
            title: `${resp.character.name.toUpperCase()} RESPONDS`,
            content: resp.content,
            timestamp: new Date(),
            type: 'character_response',
            character: resp.character
          })) || []
        ]
      };

      setSession(updatedSession);

      if (response.characterResponses) {
        for (const resp of response.characterResponses) {
          setCurrentSpeaker(resp.character.id);
          
          try {
            await characterVoiceService.speak(
              resp.content,
              resp.character.voiceId || resp.character.id,
              session.voiceSettings
            );
          } catch (voiceError) {
            logger.warn('Voice playback failed:', voiceError);
          }
          
          setCurrentSpeaker(null);
        }
      }

    } catch (error) {
      logger.error('Failed to process audio input:', error);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-blue-600 bg-blue-50';
      case 'advanced': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Globe;
  };

  const formatTimeRemaining = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // Campaign Selection Phase
  if (currentPhase === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Model UN Campaigns</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience immersive diplomatic simulations powered by advanced AI. 
              Choose your campaign and navigate complex international negotiations with voice-driven interactions.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </Button>
              ))}
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <Button
                  key={difficulty.id}
                  variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                >
                  {difficulty.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Campaigns */}
          {featuredCampaigns.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-500" />
                Featured Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCampaigns.map(campaign => (
                  <Card
                    key={campaign.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setCurrentPhase('details');
                    }}
                  >
                    <CardHeader className="relative pb-2">
                      <div className={`absolute inset-0 bg-gradient-to-br ${campaign.bgGradient} opacity-10 rounded-t-lg`} />
                      <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 bg-white rounded-lg shadow-sm ${campaign.color}`}>
                            <campaign.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{campaign.title}</CardTitle>
                            <p className="text-sm text-gray-600">{campaign.subtitle}</p>
                          </div>
                        </div>
                        {campaign.new && (
                          <Badge variant="destructive" className="bg-green-500">New</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 line-clamp-3">{campaign.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{campaign.duration}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{campaign.aiDelegates} AI</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(campaign.difficulty)}>
                          {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Campaigns */}
          {regularCampaigns.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                All Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularCampaigns.map(campaign => (
                  <Card
                    key={campaign.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setCurrentPhase('details');
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gray-100 rounded-lg ${campaign.color}`}>
                            <campaign.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{campaign.title}</CardTitle>
                            <p className="text-sm text-gray-600">{campaign.subtitle}</p>
                          </div>
                        </div>
                        {campaign.new && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{campaign.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{campaign.duration}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span>{campaign.aiDelegates} AI</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more campaigns.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Campaign Details Phase
  if (currentPhase === 'details' && selectedCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentPhase('selection')}
            className="mb-6"
          >
            ← Back to Campaigns
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 bg-white rounded-xl shadow-sm ${selectedCampaign.color}`}>
                      <selectedCampaign.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedCampaign.title}</h1>
                      <p className="text-lg text-gray-600">{selectedCampaign.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Badge className={getDifficultyColor(selectedCampaign.difficulty)}>
                      {selectedCampaign.difficulty.charAt(0).toUpperCase() + selectedCampaign.difficulty.slice(1)}
                    </Badge>
                    {selectedCampaign.featured && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">Featured</Badge>
                    )}
                    {selectedCampaign.new && (
                      <Badge variant="destructive" className="bg-green-500">New Campaign</Badge>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{selectedCampaign.description}</p>
                    <p className="text-gray-600">{selectedCampaign.context}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCampaign.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potential Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCampaign.scenarios.map((scenario, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{scenario}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.keyIssues.map((issue, index) => (
                        <Badge key={index} variant="outline">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedCampaign.duration} minutes</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI Delegates:</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedCampaign.aiDelegates} characters</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">
                        {selectedCampaign.category.charAt(0).toUpperCase() + selectedCampaign.category.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span className="font-medium text-right text-sm">{selectedCampaign.theme}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => initializeCampaign(selectedCampaign)}
                      disabled={isInitializing}
                      size="lg"
                      className={`w-full bg-gradient-to-r ${selectedCampaign.bgGradient} hover:opacity-90`}
                    >
                      {isInitializing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Initializing Campaign...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Campaign
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">How it Works</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-2">
                    <p>• Use your microphone to participate in diplomatic discussions</p>
                    <p>• AI delegates will respond with unique personalities and agendas</p>
                    <p>• Navigate crises and make strategic decisions</p>
                    <p>• Work toward achieving the campaign objectives</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Campaign Phase (full-screen secret interface)
  if (currentPhase === 'active' && session) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
        {/* Header with role and controls */}
        <div className="p-6 text-center">
          <div className="text-white mb-2">
            <h2 className="text-xl font-semibold">{session.playerCharacter.title}</h2>
            <p className="text-blue-200">{session.playerCharacter.country}</p>
          </div>
          
          {timeline && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Campaign Timeline</span>
                </div>
                <div className="text-sm text-blue-700">
                  {formatTimeRemaining(timeline.timeRemaining)} remaining
                </div>
              </div>
              
              <Progress value={timeline.progressPercentage} className="mb-2" />
              
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Phase: {timeline.phases[timeline.currentPhase]?.name}</span>
                <span>{Math.round(timeline.progressPercentage)}% complete</span>
              </div>

              {orchestrationStatus?.isActive && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  AI Orchestration Active ({orchestrationStatus.autonomousActions} actions taken)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Microphone */}
        <div className="flex justify-center py-8">
          <Button
            onClick={isListening ? stopListening : startListening}
            size="lg"
            className={`
              w-20 h-20 rounded-full transition-all duration-300 
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
            style={currentSpeaker ? {
              boxShadow: `0 0 20px ${
                session.aiCharacters.find(c => c.id === currentSpeaker)?.color || '#3B82F6'
              }`
            } : {}}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 pb-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPhase('selection');
              setSession(null);
              setSelectedCampaign(null);
            }}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Exit Campaign
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Users className="w-4 h-4 mr-2" />
                Delegates ({session.aiCharacters.length})
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Campaign Delegates</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <div className="space-y-3 p-4">
                  {/* Player Character */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: session.playerCharacter.color || '#60A5FA' }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-blue-900">{session.playerCharacter.name}</h4>
                        <p className="text-sm text-blue-700">{session.playerCharacter.title}</p>
                        <p className="text-xs text-blue-600">{session.playerCharacter.country}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* AI Characters */}
                  {session.aiCharacters.map((character) => (
                    <div 
                      key={character.id} 
                      className={`p-3 rounded-lg border ${
                        currentSpeaker === character.id 
                          ? 'bg-yellow-50 border-yellow-300 shadow-md' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-4 h-4 rounded-full ${
                            currentSpeaker === character.id ? 'animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: character.color }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{character.name}</h4>
                          <p className="text-sm text-gray-700">{character.title}</p>
                          <p className="text-xs text-gray-600">{character.country}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {character.personality}
                          </Badge>
                        </div>
                      </div>
                      {character.lastStatement && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          "{character.lastStatement}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Bottom section */}
        {bottomSectionVisible && (
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActivePanelType('crisis')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activePanelType === 'crisis'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Current Crisis
              </button>
              <button
                onClick={() => setActivePanelType('updates')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activePanelType === 'updates'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Campaign Updates
              </button>
              <button
                onClick={() => setBottomSectionVisible(false)}
                className="px-4 py-3 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 overflow-hidden">
              <div className="p-4 h-full">
                {activePanelType === 'crisis' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border-2 border-orange-500 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.currentCrisis.title}</h3>
                        <Badge variant="secondary">
                          {session.currentCrisis.urgency?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{session.currentCrisis.description}</p>
                      
                      {session.currentCrisis.keyFacts && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Key Facts:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {session.currentCrisis.keyFacts.map((fact, index) => (
                              <li key={index}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {session.campaignLog?.slice(-10).reverse().map((log, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600">{log.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{log.content}</p>
                          {log.character && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: log.character.color }}
                              ></div>
                              {log.character.name} ({log.character.country})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed bottom section */}
        {!bottomSectionVisible && (
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200">
            <button
              onClick={() => setBottomSectionVisible(true)}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm">Show Campaign Status</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Model UN Campaigns</h1>
        <p className="text-blue-200 mb-8">Loading campaign interface...</p>
      </div>
    </div>
  );
}

// Export as both named and default for maximum compatibility
export default ModelUNCampaigns;
/**
 * ENHANCED MOCK DATA SERVICE FOR LOCAL STORAGE
 * ============================================
 * 
 * Comprehensive mock data service that provides realistic data
 * for demo mode while ensuring all voice and chat features work
 * correctly with local storage.
 */

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
    language: string;
  };
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
  };
  stats: {
    totalConversations: number;
    totalVoiceTime: number; // in minutes
    avgResponseTime: number; // in seconds
    favoriteAI: string;
  };
}

export interface MockMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  voiceData?: {
    duration: number;
    waveform: number[];
    transcription?: string;
    confidence?: number;
  };
  metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
    personality?: string;
  };
}

export interface MockConversation {
  id: string;
  title: string;
  messages: MockMessage[];
  createdAt: Date;
  updatedAt: Date;
  mode: 'chat' | 'voice';
  aiPersonality: string;
  voiceSettings?: {
    voice: string;
    speed: number;
    language: string;
  };
  stats: {
    messageCount: number;
    duration: number; // in minutes
    avgResponseTime: number;
    qualityScore?: number;
  };
}

export interface MockTranscript {
  id: string;
  conversationId: string;
  title: string;
  content: string;
  createdAt: Date;
  duration: number;
  speakers: Array<{
    name: string;
    type: 'user' | 'assistant';
    segments: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  }>;
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface MockSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  language: string;
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
    noiseReduction: boolean;
    echoCancellation: boolean;
  };
  aiPreferences: {
    defaultPersonality: string;
    temperature: number;
    maxTokens: number;
    contextWindow: number;
  };
  privacy: {
    dataRetention: number; // days
    shareUsageData: boolean;
    voiceDataStorage: boolean;
    conversationBackup: boolean;
  };
  advanced: {
    debugMode: boolean;
    betaFeatures: boolean;
    voiceToVoiceEnabled: boolean;
    conversationalMode: boolean;
    autoSave: boolean;
  };
}

// Generate realistic waveform data
function generateWaveform(duration: number): number[] {
  const sampleRate = 44100; // 44.1kHz
  const samples = Math.floor(duration * sampleRate / 1000); // Convert to samples
  const waveform: number[] = [];
  
  for (let i = 0; i < Math.min(samples, 1000); i++) { // Limit to 1000 points for performance
    // Generate realistic audio waveform with varying amplitude
    const base = Math.sin(i * 0.01) * 0.3;
    const noise = (Math.random() - 0.5) * 0.1;
    const speech = Math.sin(i * 0.05 + Math.sin(i * 0.002) * 2) * 0.4;
    waveform.push(Math.max(-1, Math.min(1, base + noise + speech)));
  }
  
  return waveform;
}

// Mock AI personalities with their characteristics
export const aiPersonalities = {
  friendly: {
    name: 'Friendly Assistant',
    description: 'Warm, helpful, and encouraging',
    systemPrompt: 'You are a warm, friendly AI assistant who is always encouraging and helpful. Use a conversational tone and show genuine interest in helping.',
    voiceCharacteristics: { speed: 1.0, pitch: 1.1, warmth: 'high' }
  },
  professional: {
    name: 'Professional Advisor',
    description: 'Formal, precise, and business-focused',
    systemPrompt: 'You are a professional AI advisor who provides clear, precise, and business-focused responses. Maintain a formal but approachable tone.',
    voiceCharacteristics: { speed: 0.9, pitch: 0.95, warmth: 'medium' }
  },
  creative: {
    name: 'Creative Collaborator',
    description: 'Imaginative, inspiring, and artistic',
    systemPrompt: 'You are a creative AI collaborator who thinks outside the box and provides imaginative, inspiring responses. Be artistic and encourage creative thinking.',
    voiceCharacteristics: { speed: 1.1, pitch: 1.05, warmth: 'high' }
  },
  analytical: {
    name: 'Analytical Thinker',
    description: 'Logical, detailed, and data-driven',
    systemPrompt: 'You are an analytical AI that provides logical, detailed, and data-driven responses. Focus on facts, evidence, and systematic thinking.',
    voiceCharacteristics: { speed: 0.85, pitch: 0.9, warmth: 'low' }
  },
  casual: {
    name: 'Casual Buddy',
    description: 'Relaxed, informal, and fun',
    systemPrompt: 'You are a casual, relaxed AI buddy who keeps things informal and fun. Use a laid-back tone and don\'t be afraid to be a bit playful.',
    voiceCharacteristics: { speed: 1.15, pitch: 1.0, warmth: 'high' }
  }
};

// Mock users for demo mode
export const mockUsers: MockUser[] = [
  {
    id: 'user_demo_001',
    email: 'demo@delegateai.com',
    displayName: 'Demo User',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    preferences: {
      theme: 'system',
      fontSize: 'medium',
      voiceEnabled: true,
      notificationsEnabled: true,
      language: 'en-US'
    },
    voiceSettings: {
      voice: 'alloy',
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8
    },
    stats: {
      totalConversations: 47,
      totalVoiceTime: 123,
      avgResponseTime: 2.3,
      favoriteAI: 'friendly'
    }
  },
  {
    id: 'admin_demo_001',
    email: 'admin@delegateai.com',
    displayName: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    preferences: {
      theme: 'dark',
      fontSize: 'medium',
      voiceEnabled: true,
      notificationsEnabled: true,
      language: 'en-US'
    },
    voiceSettings: {
      voice: 'echo',
      speed: 0.9,
      pitch: 0.95,
      volume: 0.9
    },
    stats: {
      totalConversations: 156,
      totalVoiceTime: 458,
      avgResponseTime: 1.8,
      favoriteAI: 'analytical'
    }
  }
];

// Mock conversations with realistic content
export const mockConversations: MockConversation[] = [
  {
    id: 'conv_001',
    title: 'Planning a Weekend Trip',
    createdAt: new Date('2024-12-20T14:30:00Z'),
    updatedAt: new Date('2024-12-20T14:45:00Z'),
    mode: 'chat',
    aiPersonality: 'friendly',
    stats: {
      messageCount: 8,
      duration: 15,
      avgResponseTime: 1.2
    },
    messages: [
      {
        id: 'msg_001_001',
        type: 'user',
        content: 'I want to plan a weekend trip somewhere within 3 hours of San Francisco. Any suggestions?',
        timestamp: new Date('2024-12-20T14:30:00Z'),
        metadata: {
          tokens: 20,
          responseTime: 0.8
        }
      },
      {
        id: 'msg_001_002',
        type: 'assistant',
        content: 'Great question! There are so many amazing places within 3 hours of San Francisco. Here are some fantastic options:\n\n🌲 **Nature & Outdoors:**\n- Yosemite National Park (3-4 hours) - Breathtaking waterfalls and granite cliffs\n- Lake Tahoe (3 hours) - Beautiful lake with hiking, beaches, and mountain views\n- Mendocino Coast (2.5 hours) - Dramatic coastline with charming Victorian villages\n\n🍷 **Wine Country:**\n- Napa Valley (1.5 hours) - World-class wineries and fine dining\n- Sonoma County (1 hour) - More relaxed wine tasting with beautiful landscapes\n\n🏙️ **Cities & Culture:**\n- Monterey/Carmel (2 hours) - Coastal charm with aquarium and scenic drives\n- Santa Barbara (5 hours) - A bit further but worth it for the "American Riviera"\n\nWhat type of experience are you most interested in? Outdoor adventures, wine tasting, coastal relaxation, or something else?',
        timestamp: new Date('2024-12-20T14:30:15Z'),
        metadata: {
          model: 'gpt-4',
          tokens: 185,
          responseTime: 2.1,
          personality: 'friendly'
        }
      },
      {
        id: 'msg_001_003',
        type: 'user',
        content: 'I love the outdoors and hiking. Yosemite sounds perfect! What\'s the best way to get there and what should I pack?',
        timestamp: new Date('2024-12-20T14:32:00Z'),
        metadata: {
          tokens: 25,
          responseTime: 0.9
        }
      },
      {
        id: 'msg_001_004',
        type: 'assistant',
        content: 'Excellent choice! Yosemite is absolutely magical, especially this time of year. Here\'s everything you need to know:\n\n🚗 **Getting There:**\n- Take I-580 East → I-205 East → CA-120 East (Big Oak Flat entrance)\n- About 3.5-4 hours depending on traffic\n- **Pro tip:** Leave early morning (6-7 AM) to avoid Bay Area traffic\n- Park entrance fee: $35 for 7 days\n\n🎒 **Essential Packing List:**\n\n**Clothing:**\n- Layers! (temps can vary 30-40°F between day/night)\n- Waterproof jacket\n- Warm hat and gloves\n- Sturdy hiking boots\n- Moisture-wicking base layers\n\n**Gear:**\n- Headlamp/flashlight\n- First aid kit\n- Plenty of water (3+ liters per person)\n- High-energy snacks\n- Map and compass/GPS\n- Sunscreen and sunglasses\n\n**Winter Specific:**\n- Microspikes or crampons for icy trails\n- Check road conditions - chains may be required\n\nWhich trails are you considering? I can give specific advice based on your hiking experience level!',
        timestamp: new Date('2024-12-20T14:32:25Z'),
        metadata: {
          model: 'gpt-4',
          tokens: 220,
          responseTime: 3.2,
          personality: 'friendly'
        }
      },
      {
        id: 'msg_001_005',
        type: 'user',
        content: 'I\'m an intermediate hiker. What are some good day hikes that aren\'t too crowded?',
        timestamp: new Date('2024-12-20T14:35:00Z'),
        metadata: {
          tokens: 18,
          responseTime: 0.7
        }
      },
      {
        id: 'msg_001_006',
        type: 'assistant',
        content: 'Perfect! For intermediate hikers looking to avoid crowds, here are my top recommendations:\n\n🏔️ **Less Crowded Gems:**\n\n**1. May Lake Trail (2-3 hours)**\n- 2.4 miles round trip, moderate elevation gain\n- Beautiful alpine lake with potential Half Dome views\n- Tioga Pass Road access (check if open in winter!)\n\n**2. Cathedral Lakes (4-5 hours)**\n- 7 miles round trip, stunning cathedral spires\n- High Sierra beauty without the Valley crowds\n- Also on Tioga Pass Road\n\n**3. Taft Point (1-2 hours)**\n- 2.2 miles round trip, easy-moderate\n- Incredible cliff-edge views, much less crowded than Glacier Point\n- Accessible via Glacier Point Road\n\n**4. Tenaya Lake Area (if accessible)**\n- Multiple shorter hikes around this pristine alpine lake\n- Absolutely magical and typically less busy\n\n⚠️ **Important Winter Note:** Many high-elevation areas (Tioga Pass, some Glacier Point Road sections) may be closed due to snow. Check current conditions at nps.gov/yose before heading out.\n\n**Backup Valley Options:**\n- Mirror Lake Loop (easy-moderate, 5 miles)\n- Swinging Bridge area (great for photography)\n\nWould you like specific directions to any of these, or should I help you plan your itinerary?',
        timestamp: new Date('2024-12-20T14:35:35Z'),
        metadata: {
          model: 'gpt-4',
          tokens: 280,
          responseTime: 4.1,
          personality: 'friendly'
        }
      }
    ]
  },
  {
    id: 'conv_002',
    title: 'Voice Conversation - Tech Discussion',
    createdAt: new Date('2024-12-20T16:15:00Z'),
    updatedAt: new Date('2024-12-20T16:28:00Z'),
    mode: 'voice',
    aiPersonality: 'professional',
    voiceSettings: {
      voice: 'nova',
      speed: 0.95,
      language: 'en-US'
    },
    stats: {
      messageCount: 6,
      duration: 13,
      avgResponseTime: 2.8,
      qualityScore: 0.92
    },
    messages: [
      {
        id: 'msg_002_001',
        type: 'user',
        content: 'Can you explain the benefits of serverless architecture for a small startup?',
        timestamp: new Date('2024-12-20T16:15:00Z'),
        audioUrl: 'mock://audio_user_001',
        voiceData: {
          duration: 4.2,
          waveform: generateWaveform(4200),
          transcription: 'Can you explain the benefits of serverless architecture for a small startup?',
          confidence: 0.95
        },
        metadata: {
          responseTime: 1.1
        }
      },
      {
        id: 'msg_002_002',
        type: 'assistant',
        content: 'Certainly! Serverless architecture offers several compelling advantages for startups. First, it eliminates infrastructure management overhead, allowing your team to focus entirely on product development rather than server maintenance. Second, you only pay for actual compute time used, which can significantly reduce costs during early stages when traffic is unpredictable. Third, it provides automatic scaling, so your application can handle sudden traffic spikes without manual intervention. Finally, it accelerates development cycles since you can deploy individual functions independently, enabling faster iteration and testing.',
        timestamp: new Date('2024-12-20T16:15:18Z'),
        audioUrl: 'mock://audio_assistant_001',
        voiceData: {
          duration: 28.5,
          waveform: generateWaveform(28500),
          confidence: 0.98
        },
        metadata: {
          model: 'gpt-4',
          tokens: 125,
          responseTime: 3.2,
          personality: 'professional'
        }
      },
      {
        id: 'msg_002_003',
        type: 'user',
        content: 'What about the potential drawbacks? Are there any limitations I should be aware of?',
        timestamp: new Date('2024-12-20T16:16:00Z'),
        audioUrl: 'mock://audio_user_002',
        voiceData: {
          duration: 5.8,
          waveform: generateWaveform(5800),
          transcription: 'What about the potential drawbacks? Are there any limitations I should be aware of?',
          confidence: 0.93
        },
        metadata: {
          responseTime: 0.9
        }
      },
      {
        id: 'msg_002_004',
        type: 'assistant',
        content: 'Absolutely, there are important limitations to consider. Cold start latency can be problematic for user-facing applications, as functions may take several seconds to initialize after periods of inactivity. Vendor lock-in is another concern, as each cloud provider has different serverless implementations. You also have limited control over the runtime environment and may face timeout restrictions for long-running processes. Additionally, costs can actually become higher than traditional hosting at scale, and debugging distributed serverless applications can be more complex than monolithic architectures.',
        timestamp: new Date('2024-12-20T16:16:25Z'),
        audioUrl: 'mock://audio_assistant_002',
        voiceData: {
          duration: 32.1,
          waveform: generateWaveform(32100),
          confidence: 0.97
        },
        metadata: {
          model: 'gpt-4',
          tokens: 142,
          responseTime: 4.1,
          personality: 'professional'
        }
      }
    ]
  },
  {
    id: 'conv_003',
    title: 'Creative Writing Session',
    createdAt: new Date('2024-12-19T19:20:00Z'),
    updatedAt: new Date('2024-12-19T19:35:00Z'),
    mode: 'chat',
    aiPersonality: 'creative',
    stats: {
      messageCount: 4,
      duration: 15,
      avgResponseTime: 2.1
    },
    messages: [
      {
        id: 'msg_003_001',
        type: 'user',
        content: 'I\'m working on a short story about a time traveler who keeps arriving at the wrong decade. Can you help me brainstorm some funny scenarios?',
        timestamp: new Date('2024-12-19T19:20:00Z'),
        metadata: {
          tokens: 28,
          responseTime: 1.0
        }
      },
      {
        id: 'msg_003_002',
        type: 'assistant',
        content: 'What a delightfully absurd premise! Here are some hilariously misplaced scenarios for your chronologically-challenged protagonist:\n\n📻 **1950s Mix-up:**\nTrying to order an Uber but accidentally starting a radio show when they pick up the studio microphone, bewildering listeners with talk of "apps" and "the cloud"\n\n🕺 **1970s Disco Disaster:**\nAttempting to charge their phone at a disco, plugging it into the DJ booth and accidentally creating the world\'s first electronic dance music\n\n🎩 **1890s Victorian Confusion:**\nExplaining social media to confused aristocrats: "Yes, Lady Pemberton, you simply capture your morning tea with this contraption and share it with strangers worldwide"\n\n🌈 **1960s Hippie Hijinks:**\nTrying to explain NFTs to flower children who interpret "non-fungible tokens" as some new form of organic currency made from mushrooms\n\n🎬 **1980s Corporate Chaos:**\nUsing modern slang in a boardroom: "Let\'s circle back on that pivot and leverage some synergies... no cap, it\'s going to slap differently"\n\nWhat decade were you thinking of featuring? I can help craft even more specific chaos!',
        timestamp: new Date('2024-12-19T19:20:35Z'),
        metadata: {
          model: 'gpt-4',
          tokens: 245,
          responseTime: 3.8,
          personality: 'creative'
        }
      }
    ]
  }
];

// Mock transcripts for voice conversations
export const mockTranscripts: MockTranscript[] = [
  {
    id: 'transcript_001',
    conversationId: 'conv_002',
    title: 'Tech Discussion - Serverless Architecture',
    content: 'A detailed discussion about the benefits and limitations of serverless architecture for startups, covering cost considerations, scalability advantages, and potential drawbacks like vendor lock-in.',
    createdAt: new Date('2024-12-20T16:28:00Z'),
    duration: 13.2,
    speakers: [
      {
        name: 'User',
        type: 'user',
        segments: [
          {
            text: 'Can you explain the benefits of serverless architecture for a small startup?',
            start: 0,
            end: 4.2,
            confidence: 0.95
          },
          {
            text: 'What about the potential drawbacks? Are there any limitations I should be aware of?',
            start: 46.8,
            end: 52.6,
            confidence: 0.93
          }
        ]
      },
      {
        name: 'AI Assistant',
        type: 'assistant',
        segments: [
          {
            text: 'Certainly! Serverless architecture offers several compelling advantages for startups...',
            start: 18.0,
            end: 46.5,
            confidence: 0.98
          },
          {
            text: 'Absolutely, there are important limitations to consider. Cold start latency can be problematic...',
            start: 65.2,
            end: 97.3,
            confidence: 0.97
          }
        ]
      }
    ],
    summary: 'Discussion covered serverless benefits including cost efficiency, automatic scaling, and reduced infrastructure management, balanced with limitations like cold starts, vendor lock-in, and debugging complexity.',
    keywords: ['serverless', 'architecture', 'startup', 'scaling', 'costs', 'vendor lock-in', 'cold start'],
    sentiment: 'neutral'
  }
];

// Mock settings for demo mode
export const mockSettings: MockSettings = {
  theme: 'system',
  fontSize: 'medium',
  voiceEnabled: true,
  notificationsEnabled: true,
  language: 'en-US',
  voiceSettings: {
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    noiseReduction: true,
    echoCancellation: true
  },
  aiPreferences: {
    defaultPersonality: 'friendly',
    temperature: 0.7,
    maxTokens: 150,
    contextWindow: 10
  },
  privacy: {
    dataRetention: 30,
    shareUsageData: false,
    voiceDataStorage: true,
    conversationBackup: true
  },
  advanced: {
    debugMode: false,
    betaFeatures: true,
    voiceToVoiceEnabled: true,
    conversationalMode: true,
    autoSave: true
  }
};

// Voice models and their characteristics
export const voiceModels = {
  alloy: {
    name: 'Alloy',
    description: 'Balanced and versatile voice',
    gender: 'neutral',
    accent: 'american',
    characteristics: ['clear', 'professional', 'friendly']
  },
  echo: {
    name: 'Echo',
    description: 'Deep and resonant voice',
    gender: 'masculine',
    accent: 'american',
    characteristics: ['authoritative', 'warm', 'confident']
  },
  fable: {
    name: 'Fable',
    description: 'Storytelling voice with character',
    gender: 'neutral',
    accent: 'british',
    characteristics: ['expressive', 'dramatic', 'engaging']
  },
  onyx: {
    name: 'Onyx',
    description: 'Smooth and sophisticated voice',
    gender: 'masculine',
    accent: 'american',
    characteristics: ['sophisticated', 'calm', 'professional']
  },
  nova: {
    name: 'Nova',
    description: 'Bright and energetic voice',
    gender: 'feminine',
    accent: 'american',
    characteristics: ['energetic', 'youthful', 'enthusiastic']
  },
  shimmer: {
    name: 'Shimmer',
    description: 'Gentle and soothing voice',
    gender: 'feminine',
    accent: 'american',
    characteristics: ['gentle', 'soothing', 'warm']
  }
};

// Generate additional mock data
export function generateMockConversation(
  mode: 'chat' | 'voice',
  personality: string,
  messageCount: number = 4
): MockConversation {
  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
  
  const conversation: MockConversation = {
    id: conversationId,
    title: `${mode === 'voice' ? 'Voice' : 'Chat'} Session - ${personality}`,
    createdAt,
    updatedAt: new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000), // Up to 1 hour later
    mode,
    aiPersonality: personality,
    stats: {
      messageCount,
      duration: Math.random() * 30 + 5, // 5-35 minutes
      avgResponseTime: Math.random() * 3 + 1, // 1-4 seconds
      qualityScore: mode === 'voice' ? Math.random() * 0.3 + 0.7 : undefined // 0.7-1.0 for voice
    },
    messages: []
  };
  
  // Add voice settings if it's a voice conversation
  if (mode === 'voice') {
    const voices = Object.keys(voiceModels);
    conversation.voiceSettings = {
      voice: voices[Math.floor(Math.random() * voices.length)],
      speed: Math.random() * 0.4 + 0.8, // 0.8-1.2
      language: 'en-US'
    };
  }
  
  // Generate messages
  for (let i = 0; i < messageCount; i++) {
    const isUser = i % 2 === 0;
    const messageTimestamp = new Date(createdAt.getTime() + (i * 2 * 60 * 1000)); // 2 minutes apart
    
    const message: MockMessage = {
      id: `msg_${conversationId}_${i + 1}`,
      type: isUser ? 'user' : 'assistant',
      content: isUser 
        ? `User message ${i + 1} - This is a sample user input for demonstration purposes.`
        : `Assistant response ${i + 1} - This is a sample AI response demonstrating the ${personality} personality.`,
      timestamp: messageTimestamp,
      metadata: {
        responseTime: Math.random() * 2 + 0.5,
        ...(isUser ? {} : {
          model: 'gpt-4',
          tokens: Math.floor(Math.random() * 100 + 50),
          personality
        })
      }
    };
    
    // Add voice data for voice conversations
    if (mode === 'voice') {
      const duration = Math.random() * 10 + 2; // 2-12 seconds
      message.audioUrl = `mock://audio_${conversationId}_${i + 1}`;
      message.voiceData = {
        duration,
        waveform: generateWaveform(duration * 1000),
        transcription: message.content,
        confidence: Math.random() * 0.2 + 0.8 // 0.8-1.0
      };
    }
    
    conversation.messages.push(message);
  }
  
  return conversation;
}

export function generateMockUser(role: 'user' | 'admin' = 'user'): MockUser {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const personalities = Object.keys(aiPersonalities);
  const voices = Object.keys(voiceModels);
  
  return {
    id: userId,
    email: `user_${userId.split('_')[1]}@example.com`,
    displayName: `Demo User ${userId.split('_')[1]}`,
    role,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
    preferences: {
      theme: ['light', 'dark', 'system'][Math.floor(Math.random() * 3)] as any,
      fontSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as any,
      voiceEnabled: Math.random() > 0.2, // 80% have voice enabled
      notificationsEnabled: Math.random() > 0.3, // 70% have notifications enabled
      language: 'en-US'
    },
    voiceSettings: {
      voice: voices[Math.floor(Math.random() * voices.length)],
      speed: Math.random() * 0.4 + 0.8, // 0.8-1.2
      pitch: Math.random() * 0.4 + 0.8, // 0.8-1.2
      volume: Math.random() * 0.3 + 0.7 // 0.7-1.0
    },
    stats: {
      totalConversations: Math.floor(Math.random() * 200),
      totalVoiceTime: Math.floor(Math.random() * 500),
      avgResponseTime: Math.random() * 3 + 1,
      favoriteAI: personalities[Math.floor(Math.random() * personalities.length)]
    }
  };
}

// Utility functions for working with mock data
export function getMockUserById(id: string): MockUser | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getMockConversationById(id: string): MockConversation | undefined {
  return mockConversations.find(conv => conv.id === id);
}

export function getMockTranscriptById(id: string): MockTranscript | undefined {
  return mockTranscripts.find(transcript => transcript.id === id);
}

export function getRandomPersonality(): string {
  const personalities = Object.keys(aiPersonalities);
  return personalities[Math.floor(Math.random() * personalities.length)];
}

export function getRandomVoice(): string {
  const voices = Object.keys(voiceModels);
  return voices[Math.floor(Math.random() * voices.length)];
}

export default {
  mockUsers,
  mockConversations,
  mockTranscripts,
  mockSettings,
  aiPersonalities,
  voiceModels,
  generateMockConversation,
  generateMockUser,
  getMockUserById,
  getMockConversationById,
  getMockTranscriptById,
  getRandomPersonality,
  getRandomVoice
};
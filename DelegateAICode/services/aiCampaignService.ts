/**
 * AI CAMPAIGN SERVICE - ENHANCED WITH ORCHESTRATION
 * =================================================
 * 
 * Enhanced AI campaign service with full orchestration integration.
 * Supports autonomous campaign management and time-driven progression.
 */

import { api } from './api';
import { logger } from '../utils/logger';
import { campaignOrchestrator } from './campaignOrchestrator';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CampaignCharacter {
  id: string;
  name: string;
  title: string;
  country: string;
  faction: string;
  voiceId: string;
  personality: 'aggressive' | 'diplomatic' | 'cunning' | 'idealistic' | 'pragmatic' | 'charismatic';
  motivations: string[];
  secretAgenda: string[];
  relationships: Record<string, 'ally' | 'neutral' | 'rival' | 'enemy'>;
  credibility: number;
  currentMood: 'calm' | 'agitated' | 'confident' | 'desperate' | 'suspicious';
  speaking: boolean;
  lastStatement: string;
  profileImage: string;
  color: string;
}

interface CampaignCrisis {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'economic' | 'security' | 'humanitarian' | 'environmental' | 'political' | 'social';
  timeRemaining: number;
  stakeholders: string[];
  keyFacts: string[];
  possibleOutcomes: string[];
  playerChoices: CampaignChoice[];
  status: 'active' | 'resolved' | 'escalated' | 'ignored';
}

interface CampaignChoice {
  id: string;
  text: string;
  type: 'diplomatic' | 'economic' | 'military' | 'social' | 'environmental';
  consequences: string[];
  diplomaticCost: number;
  successChance: number;
  requiredSupport?: string[];
}

interface CampaignSession {
  id: string;
  title: string;
  theme: string;
  description: string;
  scenario: any;
  playerCharacter: CampaignCharacter;
  aiCharacters: CampaignCharacter[];
  currentCrisis?: CampaignCrisis;
  activeCrises: CampaignCrisis[];
  sessionState: string;
  currentPhase: any;
  phases: any[];
  timeRemaining: number;
  playerStats: any;
  campaignLog: any[];
  voiceSettings: any;
  outcomes: any[];
}

interface AIResponse {
  characterResponses?: {
    character: CampaignCharacter;
    content: string;
  }[];
  crisisUpdate?: string;
  consequences?: string[];
}

interface ChoiceResult {
  consequences: string[];
  outcomeModifier: number;
  relationshipChanges: Record<string, number>;
}

// ============================================================================
// AI CAMPAIGN SERVICE CLASS
// ============================================================================

class AICampaignService {
  private baseUrl = '/api';
  private retryAttempts = 3;
  private retryDelay = 1000;

  /**
   * Generate player character based on scenario
   */
  async generatePlayerCharacter(scenario: any): Promise<CampaignCharacter> {
    try {
      logger.info('Generating player character for scenario:', scenario.id);

      const response = await this.makeRequest('/ai/campaign/generate-player-character', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: scenario.id,
          scenarioContext: scenario.context,
          theme: scenario.theme,
          difficulty: scenario.difficulty
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate player character');
      }

      logger.info('Successfully generated player character');
      return response.data;

    } catch (error) {
      logger.error('Error generating player character:', error);
      // Fallback to default character if backend fails
      return this.generateFallbackPlayerCharacter(scenario);
    }
  }

  /**
   * Generate AI characters for the campaign
   */
  async generateAICharacters(scenario: any, playerCharacter: CampaignCharacter): Promise<CampaignCharacter[]> {
    try {
      logger.info('Generating AI characters for scenario:', scenario.id);

      const response = await this.makeRequest('/ai/campaign/generate-ai-characters', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: scenario.id,
          scenarioContext: scenario.context,
          characters: scenario.characters,
          playerCharacter: playerCharacter,
          theme: scenario.theme
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate AI characters');
      }

      logger.info('Successfully generated AI characters');
      return response.data;

    } catch (error) {
      logger.error('Error generating AI characters:', error);
      // Fallback to default characters if backend fails
      return this.generateFallbackAICharacters(scenario);
    }
  }

  /**
   * Generate crisis for the campaign
   */
  async generateCrisis(initialCrisis: string, session: CampaignSession): Promise<CampaignCrisis> {
    try {
      logger.info('Generating crisis for session:', session.id);

      const response = await this.makeRequest('/ai/campaign/generate-crisis', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          initialCrisis: initialCrisis,
          currentPhase: session.currentPhase,
          characters: session.aiCharacters,
          context: session.scenario.context,
          difficulty: session.scenario.difficulty
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate crisis');
      }

      logger.info('Successfully generated crisis');
      return response.data;

    } catch (error) {
      logger.error('Error generating crisis:', error);
      // Fallback to default crisis if backend fails
      return this.generateFallbackCrisis(initialCrisis);
    }
  }

  /**
   * Process player input and generate AI responses
   */
  async processPlayerInput(transcript: string, session: CampaignSession): Promise<AIResponse> {
    try {
      logger.info('Processing player input for session:', session.id);

      const response = await this.makeRequest('/ai/campaign/process-player-input', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          transcript: transcript,
          playerCharacter: session.playerCharacter,
          aiCharacters: session.aiCharacters,
          currentCrisis: session.currentCrisis,
          currentPhase: session.currentPhase,
          campaignLog: session.campaignLog.slice(-10), // Send last 10 updates for context
          difficulty: session.scenario.difficulty,
          timeRemaining: session.timeRemaining
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to process player input');
      }

      logger.info('Successfully processed player input');
      return response.data;

    } catch (error) {
      logger.error('Error processing player input:', error);
      // Return empty response if backend fails
      return { characterResponses: [] };
    }
  }

  /**
   * Process player choice and return consequences
   */
  async processChoice(choice: CampaignChoice, session: CampaignSession): Promise<ChoiceResult> {
    try {
      logger.info('Processing player choice for session:', session.id);

      const response = await this.makeRequest('/ai/campaign/process-choice', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          choice: choice,
          currentCrisis: session.currentCrisis,
          playerCharacter: session.playerCharacter,
          aiCharacters: session.aiCharacters,
          currentPhase: session.currentPhase
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to process choice');
      }

      logger.info('Successfully processed choice');
      return response.data;

    } catch (error) {
      logger.error('Error processing choice:', error);
      // Fallback to basic consequences
      return {
        consequences: [choice.consequences[0] || 'Your decision has been noted by other delegates.'],
        outcomeModifier: 0,
        relationshipChanges: {}
      };
    }
  }

  /**
   * Save campaign session to backend
   */
  async saveCampaignSession(session: CampaignSession): Promise<boolean> {
    try {
      logger.info('Saving campaign session:', session.id);

      const response = await this.makeRequest('/sessions/campaign/save', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          sessionData: session,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save campaign session');
      }

      logger.info('Successfully saved campaign session');
      return true;

    } catch (error) {
      logger.error('Error saving campaign session:', error);
      return false;
    }
  }

  /**
   * Load campaign session from backend
   */
  async loadCampaignSession(sessionId: string): Promise<CampaignSession | null> {
    try {
      logger.info('Loading campaign session:', sessionId);

      const response = await this.makeRequest(`/sessions/campaign/${sessionId}`, {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to load campaign session');
      }

      logger.info('Successfully loaded campaign session');
      return response.data;

    } catch (error) {
      logger.error('Error loading campaign session:', error);
      return null;
    }
  }

  /**
   * Get user's campaign history
   */
  async getCampaignHistory(): Promise<any[]> {
    try {
      logger.info('Fetching campaign history');

      const response = await this.makeRequest('/sessions/campaign/history', {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch campaign history');
      }

      logger.info('Successfully fetched campaign history');
      return response.data;

    } catch (error) {
      logger.error('Error fetching campaign history:', error);
      return [];
    }
  }

  /**
   * Generate autonomous content for campaign progression
   */
  async generateAutonomousContent(session: CampaignSession, contentType: 'character_action' | 'crisis_update' | 'system_event'): Promise<any> {
    try {
      logger.info('Generating autonomous content:', contentType);

      const response = await this.makeRequest('/ai/campaign/generate-autonomous', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          contentType,
          currentState: {
            phase: session.currentPhase,
            timeRemaining: session.timeRemaining,
            campaignLog: session.campaignLog.slice(-5),
            characters: session.aiCharacters,
            crisis: session.currentCrisis
          }
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate autonomous content');
      }

      return response.data;

    } catch (error) {
      logger.error('Error generating autonomous content:', error);
      return null;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Make API request with retry logic
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await api(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        return response;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`API request attempt ${attempt} failed:`, error);

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate fallback player character
   */
  private generateFallbackPlayerCharacter(scenario: any): CampaignCharacter {
    const countries = ['United States', 'United Kingdom', 'France', 'Germany', 'Canada', 'Australia'];
    const titles = ['Ambassador', 'Minister', 'Secretary', 'Representative', 'Delegate'];
    
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    return {
      id: 'player',
      name: `Player ${randomTitle}`,
      title: randomTitle,
      country: randomCountry,
      faction: 'Independent',
      voiceId: 'player',
      personality: 'diplomatic',
      motivations: ['Promote international cooperation', 'Protect national interests'],
      secretAgenda: [],
      relationships: {},
      credibility: 100,
      currentMood: 'confident',
      speaking: false,
      lastStatement: '',
      profileImage: '',
      color: '#60A5FA'
    };
  }

  /**
   * Generate fallback AI characters
   */
  private generateFallbackAICharacters(scenario: any): CampaignCharacter[] {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    const fallbackCharacters = scenario.characters.map((char: any, index: number) => ({
      id: `ai-${index}`,
      name: char.name || `Delegate ${index + 1}`,
      title: char.title || 'Ambassador',
      country: char.country || 'Unknown',
      faction: char.faction || 'Independent',
      voiceId: `voice-${index}`,
      personality: char.personality || 'diplomatic',
      motivations: ['Represent national interests'],
      secretAgenda: [],
      relationships: {},
      credibility: 75,
      currentMood: 'calm',
      speaking: false,
      lastStatement: '',
      profileImage: '',
      color: colors[index % colors.length]
    }));

    return fallbackCharacters;
  }

  /**
   * Generate fallback crisis
   */
  private generateFallbackCrisis(initialCrisis: string): CampaignCrisis {
    return {
      id: 'crisis-fallback',
      title: 'Urgent Diplomatic Crisis',
      description: initialCrisis || 'A diplomatic crisis requires immediate attention and careful negotiation.',
      urgency: 'high',
      category: 'political',
      timeRemaining: 30,
      stakeholders: ['All participating nations'],
      keyFacts: ['International tension is rising', 'Multiple parties have conflicting interests'],
      possibleOutcomes: ['Peaceful resolution', 'Escalation of tensions', 'Stalemate'],
      playerChoices: [{
        id: 'choice-1',
        text: 'Call for immediate dialogue',
        type: 'diplomatic',
        consequences: ['Delegates appreciate the call for cooperation'],
        diplomaticCost: 10,
        successChance: 70
      }],
      status: 'active'
    };
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const aiCampaignService = new AICampaignService();
export default aiCampaignService;
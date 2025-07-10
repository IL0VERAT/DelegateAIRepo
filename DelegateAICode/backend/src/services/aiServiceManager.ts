/**
 * AI SERVICE MANAGER - GEMINI ONLY INTEGRATION
 * ============================================
 * 
 * Enhanced AI service manager with Model UN campaign-specific functionality.
 * Uses ONLY Gemini for all AI operations (no OpenAI fallback).
 */

import { geminiService } from './gemini';
import { logger } from '../utils/logger';
import { environment } from '../config/environment';

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
  relationships: Record<string, string>;
  credibility: number;
  currentMood: string;
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
  category: string;
  timeRemaining: number;
  stakeholders: string[];
  keyFacts: string[];
  possibleOutcomes: string[];
  playerChoices: any[];
  status: string;
}

class AiServiceManagerEnhanced {
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // ============================================================================
  // CHARACTER GENERATION
  // ============================================================================

  /**
   * Generate player character for campaign
   */
  async generatePlayerCharacter(params: {
    scenarioId: string;
    scenarioContext: string;
    theme: string;
    difficulty: string;
    userId: string;
  }): Promise<CampaignCharacter> {
    try {
      const prompt = this.buildPlayerCharacterPrompt(params);
      const response = await this.generateWithRetry(prompt, 'character_generation');

      const character = this.parseCharacterResponse(response);
      character.id = 'player';
      character.color = '#60A5FA'; // Blue for player

      logger.info('Generated player character successfully', { 
        userId: params.userId, 
        scenarioId: params.scenarioId 
      });

      return character;

    } catch (error) {
      logger.error('Error generating player character:', error);
      throw new Error('Failed to generate player character');
    }
  }

  /**
   * Generate AI characters for campaign
   */
  async generateAICharacters(params: {
    scenarioId: string;
    scenarioContext: string;
    characters: any[];
    playerCharacter: CampaignCharacter;
    theme: string;
    userId: string;
  }): Promise<CampaignCharacter[]> {
    try {
      const prompt = this.buildAICharactersPrompt(params);
      const response = await this.generateWithRetry(prompt, 'characters_generation');

      const characters = this.parseCharactersResponse(response, params.characters);

      // Assign colors to characters
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
      ];

      characters.forEach((char, index) => {
        char.id = `ai-${index}`;
        char.color = colors[index % colors.length];
      });

      logger.info('Generated AI characters successfully', { 
        userId: params.userId, 
        scenarioId: params.scenarioId,
        characterCount: characters.length
      });

      return characters;

    } catch (error) {
      logger.error('Error generating AI characters:', error);
      throw new Error('Failed to generate AI characters');
    }
  }

  // ============================================================================
  // CRISIS MANAGEMENT
  // ============================================================================

  /**
   * Generate crisis for campaign
   */
  async generateCrisis(params: {
    sessionId: string;
    initialCrisis: string;
    currentPhase: any;
    characters: CampaignCharacter[];
    context: string;
    difficulty: string;
    userId: string;
  }): Promise<CampaignCrisis> {
    try {
      const prompt = this.buildCrisisPrompt(params);
      const response = await this.generateWithRetry(prompt, 'crisis_generation');

      const crisis = this.parseCrisisResponse(response, params.initialCrisis);

      logger.info('Generated crisis successfully', { 
        userId: params.userId, 
        sessionId: params.sessionId 
      });

      return crisis;

    } catch (error) {
      logger.error('Error generating crisis:', error);
      throw new Error('Failed to generate crisis');
    }
  }

  // ============================================================================
  // AI INTERACTIONS
  // ============================================================================

  /**
   * Process player input and generate AI character responses
   */
  async processPlayerInput(params: {
    sessionId: string;
    transcript: string;
    playerCharacter: CampaignCharacter;
    aiCharacters: CampaignCharacter[];
    currentCrisis: CampaignCrisis;
    currentPhase: any;
    campaignLog: any[];
    difficulty: string;
    userId: string;
  }): Promise<any> {
    try {
      const prompt = this.buildPlayerInputPrompt(params);
      const response = await this.generateWithRetry(prompt, 'player_input_processing');

      const aiResponse = this.parsePlayerInputResponse(response, params.aiCharacters);

      logger.info('Processed player input successfully', { 
        userId: params.userId, 
        sessionId: params.sessionId 
      });

      return aiResponse;

    } catch (error) {
      logger.error('Error processing player input:', error);
      throw new Error('Failed to process player input');
    }
  }

  /**
   * Process player choice and return consequences
   */
  async processPlayerChoice(params: {
    sessionId: string;
    choice: any;
    currentCrisis: CampaignCrisis;
    playerCharacter: CampaignCharacter;
    aiCharacters: CampaignCharacter[];
    currentPhase: any;
    userId: string;
  }): Promise<any> {
    try {
      const prompt = this.buildPlayerChoicePrompt(params);
      const response = await this.generateWithRetry(prompt, 'choice_processing');

      const result = this.parseChoiceResponse(response);

      logger.info('Processed player choice successfully', { 
        userId: params.userId, 
        sessionId: params.sessionId 
      });

      return result;

    } catch (error) {
      logger.error('Error processing player choice:', error);
      throw new Error('Failed to process player choice');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate response with retry logic (Gemini only)
   */
  private async generateWithRetry(prompt: string, type: string): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await geminiService.generateResponse(prompt, { 
          temperature: 0.7,
          maxTokens: 4096
        });
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Gemini service attempt ${attempt} failed for ${type}:`, error);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    logger.error(`All Gemini attempts failed for ${type}:`, lastError);
    throw new Error(`Gemini generation failed for ${type}: ${lastError?.message}`);
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build prompt for player character generation
   */
  private buildPlayerCharacterPrompt(params: any): string {
    return `
You are creating a player character for a Model UN diplomatic simulation. Generate a realistic diplomatic character with the following context:

SCENARIO: ${params.scenarioId}
THEME: ${params.theme}
CONTEXT: ${params.scenarioContext}
DIFFICULTY: ${params.difficulty}

Create a diplomatic character with:
- A professional diplomatic title (Ambassador, Minister, Secretary, etc.)
- A country they represent (choose based on scenario relevance)
- Realistic motivations and goals
- Professional background and expertise
- Personality traits suitable for diplomacy

Return the character as JSON with these exact fields:
{
  "name": "Character Name",
  "title": "Diplomatic Title",
  "country": "Country Name",
  "faction": "Relevant Faction/Organization",
  "personality": "diplomatic",
  "motivations": ["motivation1", "motivation2"],
  "secretAgenda": [],
  "relationships": {},
  "credibility": 100,
  "currentMood": "confident",
  "speaking": false,
  "lastStatement": "",
  "profileImage": "",
  "voiceId": "player"
}
`;
  }

  /**
   * Build prompt for AI characters generation
   */
  private buildAICharactersPrompt(params: any): string {
    return `
You are creating AI characters for a Model UN diplomatic simulation. Generate realistic diplomatic characters with diverse personalities and conflicting interests.

SCENARIO CONTEXT: ${params.scenarioContext}
THEME: ${params.theme}
PLAYER CHARACTER: ${JSON.stringify(params.playerCharacter)}

Create ${params.characters.length} distinct AI characters based on these templates:
${params.characters.map((char: any, index: number) => `
Character ${index + 1}:
- Name: ${char.name}
- Country: ${char.country}
- Faction: ${char.faction}
- Personality: ${char.personality}
`).join('\n')}

Each character should have:
- Realistic motivations that may conflict with others
- Secret agendas that create tension
- Relationships with other characters (ally/neutral/rival/enemy)
- Credibility score (50-100)
- Current mood based on personality

Return as JSON array with these exact fields for each character:
{
  "name": "Character Name",
  "title": "Diplomatic Title", 
  "country": "Country Name",
  "faction": "Faction Name",
  "personality": "personality_type",
  "motivations": ["motivation1", "motivation2"],
  "secretAgenda": ["agenda1", "agenda2"],
  "relationships": {},
  "credibility": 75,
  "currentMood": "calm",
  "speaking": false,
  "lastStatement": "",
  "profileImage": "",
  "voiceId": ""
}
`;
  }

  /**
   * Build prompt for crisis generation
   */
  private buildCrisisPrompt(params: any): string {
    return `
Generate a diplomatic crisis for a Model UN simulation based on:

INITIAL CRISIS: ${params.initialCrisis}
CONTEXT: ${params.context}
CURRENT PHASE: ${params.currentPhase.name}
DIFFICULTY: ${params.difficulty}
CHARACTERS: ${params.characters.map((c: any) => `${c.name} (${c.country})`).join(', ')}

Create a crisis that:
- Escalates the initial situation
- Involves multiple stakeholders
- Requires diplomatic resolution
- Has clear consequences for inaction
- Provides meaningful player choices

Return as JSON with these exact fields:
{
  "id": "crisis-generated",
  "title": "Crisis Title",
  "description": "Detailed crisis description",
  "urgency": "high",
  "category": "political",
  "timeRemaining": 30,
  "stakeholders": ["stakeholder1", "stakeholder2"],
  "keyFacts": ["fact1", "fact2", "fact3"],
  "possibleOutcomes": ["outcome1", "outcome2", "outcome3"],
  "playerChoices": [
    {
      "id": "choice1",
      "text": "Choice description",
      "type": "diplomatic",
      "consequences": ["consequence1"],
      "diplomaticCost": 10,
      "successChance": 70
    }
  ],
  "status": "active"
}
`;
  }

  /**
   * Build prompt for player input processing
   */
  private buildPlayerInputPrompt(params: any): string {
    return `
Process player input in a Model UN diplomatic simulation and generate appropriate AI character responses.

PLAYER INPUT: "${params.transcript}"
PLAYER CHARACTER: ${params.playerCharacter.name} (${params.playerCharacter.country})
CURRENT CRISIS: ${params.currentCrisis?.title || 'No active crisis'}
CURRENT PHASE: ${params.currentPhase?.name || 'Unknown phase'}

AI CHARACTERS:
${params.aiCharacters.map((char: any) => `
- ${char.name} (${char.country}): ${char.personality}, Mood: ${char.currentMood}
  Motivations: ${char.motivations.join(', ')}
`).join('\n')}

RECENT CONTEXT:
${params.campaignLog.slice(-3).map((log: any) => `${log.title}: ${log.content}`).join('\n')}

Generate responses from 1-3 AI characters who would realistically respond to this input. Consider:
- Character personalities and motivations
- Current diplomatic tensions
- Realistic diplomatic language
- Varying perspectives and potential conflicts

Return as JSON:
{
  "characterResponses": [
    {
      "character": { "id": "character_id", "name": "Character Name" },
      "content": "Diplomatic response content"
    }
  ],
  "crisisUpdate": "Optional crisis development based on input"
}
`;
  }

  /**
   * Build prompt for player choice processing
   */
  private buildPlayerChoicePrompt(params: any): string {
    return `
Process a player's diplomatic choice and determine realistic consequences.

PLAYER CHOICE: ${params.choice.text}
CHOICE TYPE: ${params.choice.type}
DIPLOMATIC COST: ${params.choice.diplomaticCost}
SUCCESS CHANCE: ${params.choice.successChance}%

CURRENT CRISIS: ${params.currentCrisis?.title}
PLAYER CHARACTER: ${params.playerCharacter.name} (${params.playerCharacter.country})

AI CHARACTERS:
${params.aiCharacters.map((char: any) => `${char.name} (${char.country}): ${char.personality}`).join('\n')}

Determine realistic consequences based on:
- Character relationships and motivations  
- Success probability
- Diplomatic realism
- Crisis context

Return as JSON:
{
  "consequences": ["consequence1", "consequence2"],
  "outcomeModifier": 5,
  "relationshipChanges": {
    "character_id": 10
  }
}
`;
  }

  /**
   * Parse character response from AI
   */
  private parseCharacterResponse(response: string): CampaignCharacter {
    try {
      const parsed = JSON.parse(response);
      return {
        id: '',
        name: parsed.name || 'Unnamed Character',
        title: parsed.title || 'Delegate',
        country: parsed.country || 'Unknown',
        faction: parsed.faction || 'Independent',
        voiceId: parsed.voiceId || '',
        personality: parsed.personality || 'diplomatic',
        motivations: parsed.motivations || [],
        secretAgenda: parsed.secretAgenda || [],
        relationships: parsed.relationships || {},
        credibility: parsed.credibility || 75,
        currentMood: parsed.currentMood || 'calm',
        speaking: false,
        lastStatement: '',
        profileImage: '',
        color: '#FFFFFF'
      };
    } catch {
      return this.getFallbackCharacter();
    }
  }

  /**
   * Parse multiple characters response from AI
   */
  private parseCharactersResponse(response: string, templates: any[]): CampaignCharacter[] {
    try {
      const parsed = JSON.parse(response);
      const characters = Array.isArray(parsed) ? parsed : [parsed];
      
      return characters.map((char: any, index: number) => ({
        id: '',
        name: char.name || templates[index]?.name || `Character ${index + 1}`,
        title: char.title || 'Ambassador',
        country: char.country || templates[index]?.country || 'Unknown',
        faction: char.faction || templates[index]?.faction || 'Independent',
        voiceId: '',
        personality: char.personality || templates[index]?.personality || 'diplomatic',
        motivations: char.motivations || ['Represent national interests'],
        secretAgenda: char.secretAgenda || [],
        relationships: char.relationships || {},
        credibility: char.credibility || 75,
        currentMood: char.currentMood || 'calm',
        speaking: false,
        lastStatement: '',
        profileImage: '',
        color: '#FFFFFF'
      }));
    } catch {
      return templates.map((template, index) => ({
        id: `ai-${index}`,
        name: template.name || `Character ${index + 1}`,
        title: 'Ambassador',
        country: template.country || 'Unknown',
        faction: template.faction || 'Independent',
        voiceId: '',
        personality: template.personality || 'diplomatic',
        motivations: ['Represent national interests'],
        secretAgenda: [],
        relationships: {},
        credibility: 75,
        currentMood: 'calm',
        speaking: false,
        lastStatement: '',
        profileImage: '',
        color: '#FFFFFF'
      }));
    }
  }

  /**
   * Parse crisis response from AI
   */
  private parseCrisisResponse(response: string, fallbackTitle: string): CampaignCrisis {
    try {
      const parsed = JSON.parse(response);
      return {
        id: parsed.id || 'crisis-generated',
        title: parsed.title || fallbackTitle,
        description: parsed.description || 'A diplomatic crisis requires attention.',
        urgency: parsed.urgency || 'high',
        category: parsed.category || 'political',
        timeRemaining: parsed.timeRemaining || 30,
        stakeholders: parsed.stakeholders || [],
        keyFacts: parsed.keyFacts || [],
        possibleOutcomes: parsed.possibleOutcomes || [],
        playerChoices: parsed.playerChoices || [],
        status: 'active'
      };
    } catch {
      return this.getFallbackCrisis(fallbackTitle);
    }
  }

  /**
   * Parse player input response from AI
   */
  private parsePlayerInputResponse(response: string, characters: CampaignCharacter[]): any {
    try {
      const parsed = JSON.parse(response);
      return {
        characterResponses: parsed.characterResponses?.map((resp: any) => ({
          character: characters.find(c => c.id === resp.character.id) || resp.character,
          content: resp.content
        })) || [],
        crisisUpdate: parsed.crisisUpdate
      };
    } catch {
      return { characterResponses: [] };
    }
  }

  /**
   * Parse choice response from AI
   */
  private parseChoiceResponse(response: string): any {
    try {
      const parsed = JSON.parse(response);
      return {
        consequences: parsed.consequences || ['Your decision has been noted.'],
        outcomeModifier: parsed.outcomeModifier || 0,
        relationshipChanges: parsed.relationshipChanges || {}
      };
    } catch {
      return {
        consequences: ['Your decision has been noted by other delegates.'],
        outcomeModifier: 0,
        relationshipChanges: {}
      };
    }
  }

  /**
   * Get fallback character when AI fails
   */
  private getFallbackCharacter(): CampaignCharacter {
    return {
      id: 'fallback',
      name: 'Diplomatic Representative',
      title: 'Ambassador',
      country: 'International Community',
      faction: 'Independent',
      voiceId: 'fallback',
      personality: 'diplomatic',
      motivations: ['Promote international cooperation'],
      secretAgenda: [],
      relationships: {},
      credibility: 75,
      currentMood: 'calm',
      speaking: false,
      lastStatement: '',
      profileImage: '',
      color: '#FFFFFF'
    };
  }

  /**
   * Get fallback crisis when AI fails
   */
  private getFallbackCrisis(title: string): CampaignCrisis {
    return {
      id: 'crisis-fallback',
      title: title || 'Diplomatic Crisis',
      description: 'A complex diplomatic situation requires careful negotiation and international cooperation.',
      urgency: 'high',
      category: 'political',
      timeRemaining: 30,
      stakeholders: ['All participating nations'],
      keyFacts: ['Multiple parties have conflicting interests', 'Diplomatic solution is preferred'],
      possibleOutcomes: ['Peaceful resolution', 'Escalation', 'Stalemate'],
      playerChoices: [{
        id: 'choice-1',
        text: 'Call for diplomatic dialogue',
        type: 'diplomatic',
        consequences: ['Other delegates appreciate the call for cooperation'],
        diplomaticCost: 10,
        successChance: 70
      }],
      status: 'active'
    };
  }
}

export const aiServiceManager = new AiServiceManagerEnhanced();
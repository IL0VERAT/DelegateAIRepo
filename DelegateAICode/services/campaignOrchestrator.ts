/**
 * CAMPAIGN ORCHESTRATOR - AI-DRIVEN CAMPAIGN MANAGEMENT
 * =====================================================
 * 
 * Autonomous AI system that designs, implements, executes, and makes decisions
 * about Model UN campaigns to ensure they conclude within the designated timeframe.
 */

import { logger } from '../utils/logger';
import { aiCampaignService } from './aiCampaignService';
import { characterVoiceService } from './characterVoiceService';
import { geminiNativeAudio } from './geminiNativeAudio';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CampaignTimeline {
  totalDuration: number; // in minutes
  phases: CampaignPhase[];
  currentPhase: number;
  startTime: Date;
  endTime: Date;
  timeRemaining: number;
  progressPercentage: number;
}

interface CampaignPhase {
  id: string;
  name: string;
  description: string;
  minDuration: number; // minimum minutes
  maxDuration: number; // maximum minutes
  objectives: string[];
  triggers: PhaseTrigger[];
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface PhaseTrigger {
  type: 'time' | 'player_action' | 'crisis_escalation' | 'resolution_reached';
  condition: string;
  action: string;
}

interface CampaignResolution {
  type: 'diplomatic_success' | 'partial_resolution' | 'stalemate' | 'crisis_escalation' | 'time_expired';
  description: string;
  playerScore: number;
  relationshipChanges: Record<string, number>;
  outcomes: string[];
  canEndEarly: boolean;
}

interface AutonomousAction {
  type: 'character_initiative' | 'crisis_development' | 'phase_transition' | 'resolution_proposal';
  executedBy: string; // character ID or 'system'
  description: string;
  impact: string[];
  timestamp: Date;
}

// ============================================================================
// CAMPAIGN ORCHESTRATOR CLASS
// ============================================================================

class CampaignOrchestrator {
  private timeline: CampaignTimeline | null = null;
  private session: any = null;
  private orchestrationInterval: ReturnType<typeof setInterval> | null = null;
  private autonomousActions: AutonomousAction[] = [];
  private resolutionThreshold = 0.8; // 80% resolution threshold for early completion
  private isActive = false;
  private lastActionTime = Date.now();
  private actionCooldown = 30000; // 30 seconds between autonomous actions

  /**
   * Initialize and start campaign orchestration
   */
  async initializeCampaign(session: any, totalDurationMinutes: number): Promise<void> {
    try {
      logger.info('Initializing AI Campaign Orchestration', {
        sessionId: session.id,
        duration: totalDurationMinutes
      });

      this.session = session;
      this.timeline = this.createCampaignTimeline(totalDurationMinutes);
      
      // Start autonomous orchestration
      await this.startOrchestration();

      logger.info('Campaign orchestration initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize campaign orchestration:', error);
      throw error;
    }
  }

  /**
   * Create structured campaign timeline with phases
   */
  private createCampaignTimeline(totalDurationMinutes: number): CampaignTimeline {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60000);

    // Define campaign phases with time allocations
    const phases: CampaignPhase[] = [
      {
        id: 'opening',
        name: 'Opening Statements',
        description: 'Initial presentations and position establishment',
        minDuration: Math.max(2, Math.floor(totalDurationMinutes * 0.15)), // 15% minimum
        maxDuration: Math.floor(totalDurationMinutes * 0.25), // 25% maximum
        objectives: [
          'Establish character positions',
          'Present initial proposals',
          'Identify key stakeholders and conflicts'
        ],
        triggers: [
          {
            type: 'time',
            condition: 'phase_duration_exceeded',
            action: 'force_transition_to_negotiation'
          }
        ],
        completed: false
      },
      {
        id: 'negotiation',
        name: 'Active Negotiation',
        description: 'Core diplomatic negotiations and deal-making',
        minDuration: Math.floor(totalDurationMinutes * 0.4), // 40% minimum
        maxDuration: Math.floor(totalDurationMinutes * 0.6), // 60% maximum
        objectives: [
          'Facilitate bilateral and multilateral discussions',
          'Develop compromise proposals',
          'Address crisis developments',
          'Build coalitions and alliances'
        ],
        triggers: [
          {
            type: 'crisis_escalation',
            condition: 'urgency_critical',
            action: 'escalate_negotiations'
          },
          {
            type: 'resolution_reached',
            condition: 'consensus_threshold_met',
            action: 'transition_to_resolution'
          }
        ],
        completed: false
      },
      {
        id: 'resolution',
        name: 'Resolution and Conclusion',
        description: 'Final agreement formulation and campaign conclusion',
        minDuration: Math.max(2, Math.floor(totalDurationMinutes * 0.1)), // 10% minimum
        maxDuration: Math.floor(totalDurationMinutes * 0.2), // 20% maximum
        objectives: [
          'Finalize agreements',
          'Address remaining objections',
          'Conclude with formal resolution or documented outcomes'
        ],
        triggers: [
          {
            type: 'time',
            condition: 'campaign_time_expired',
            action: 'force_conclusion'
          }
        ],
        completed: false
      }
    ];

    return {
      totalDuration: totalDurationMinutes,
      phases,
      currentPhase: 0,
      startTime,
      endTime,
      timeRemaining: totalDurationMinutes,
      progressPercentage: 0
    };
  }

  /**
   * Start autonomous campaign orchestration
   */
  private async startOrchestration(): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;

    // Main orchestration loop - runs every 15 seconds
    this.orchestrationInterval = setInterval(async () => {
      try {
        await this.executeOrchestrationCycle();
      } catch (error) {
        logger.error('Orchestration cycle error:', error);
      }
    }, 15000);

    logger.info('Autonomous campaign orchestration started');
  }

  /**
   * Execute one orchestration cycle
   */
  private async executeOrchestrationCycle(): Promise<void> {
    if (!this.timeline || !this.session) return;

    // Update timeline
    this.updateTimeline();

    // Check if campaign should end
    const resolution = await this.evaluateResolution();
    if (resolution.canEndEarly && resolution.playerScore >= this.resolutionThreshold) {
      await this.concludeCampaign(resolution);
      return;
    }

    // Check for phase transitions
    await this.checkPhaseTransitions();

    // Execute autonomous actions
    await this.executeAutonomousActions();

    // Generate new developments
    await this.generateDevelopments();

    // Save campaign state
    await this.saveCampaignState();
  }

  /**
   * Update campaign timeline
   */
  private updateTimeline(): void {
    if (!this.timeline) return;

    const now = new Date();
    const elapsed = (now.getTime() - this.timeline.startTime.getTime()) / 60000; // minutes
    
    this.timeline.timeRemaining = Math.max(0, this.timeline.totalDuration - elapsed);
    this.timeline.progressPercentage = Math.min(100, (elapsed / this.timeline.totalDuration) * 100);

    // Force end if time expired
    if (this.timeline.timeRemaining <= 0) {
      this.forceConclusion();
    }
  }

  /**
   * Check and execute phase transitions
   */
  private async checkPhaseTransitions(): Promise<void> {
    if (!this.timeline) return;

    const currentPhase = this.timeline.phases[this.timeline.currentPhase];
    if (!currentPhase || currentPhase.completed) return;

    const phaseElapsed = currentPhase.startTime 
      ? (Date.now() - currentPhase.startTime.getTime()) / 60000
      : 0;

    // Check if minimum phase duration met and objectives achieved
    if (phaseElapsed >= currentPhase.minDuration) {
      const objectivesAchieved = await this.evaluatePhaseObjectives(currentPhase);
      
      if (objectivesAchieved >= 0.7 || phaseElapsed >= currentPhase.maxDuration) {
        await this.transitionToNextPhase();
      }
    }
  }

  /**
   * Execute autonomous actions to drive campaign forward
   */
  private async executeAutonomousActions(): Promise<void> {
    const now = Date.now();
    
    // Respect cooldown period
    if (now - this.lastActionTime < this.actionCooldown) {
      return;
    }

    const currentPhase = this.timeline?.phases[this.timeline.currentPhase];
    if (!currentPhase) return;

    // Determine what autonomous action to take
    const action = await this.determineAutonomousAction(currentPhase);
    
    if (action) {
      await this.executeAction(action);
      this.autonomousActions.push(action);
      this.lastActionTime = now;
    }
  }

  /**
   * Determine what autonomous action to take
   */
  private async determineAutonomousAction(phase: CampaignPhase): Promise<AutonomousAction | null> {
    try {
      // Use AI to determine the best action to drive campaign forward
      const actionPrompt = this.buildAutonomousActionPrompt(phase);
      const response = await aiCampaignService.processPlayerInput(actionPrompt, this.session);

      if (response.characterResponses && response.characterResponses.length > 0) {
        const aiResponse = response.characterResponses[0];
        
        return {
          type: 'character_initiative',
          executedBy: aiResponse.character.id,
          description: aiResponse.content,
          impact: ['Advances diplomatic discussion', 'Creates new negotiation opportunities'],
          timestamp: new Date()
        };
      }

      // Fallback: Generate system-driven development
      return this.generateSystemAction(phase);

    } catch (error) {
      logger.error('Error determining autonomous action:', error);
      return null;
    }
  }

  /**
   * Generate system-driven action when AI response fails
   */
  private generateSystemAction(phase: CampaignPhase): AutonomousAction {
    const systemActions: Record<string, string[]> = {
      'opening': [
        'A new diplomatic position paper is circulated',
        'Additional stakeholders express interest in the negotiations',
        'Economic data relevant to the crisis is released'
      ],
      'negotiation': [
        'A potential breakthrough proposal emerges from backroom discussions',
        'External pressure mounts for a quick resolution',
        'New information changes the dynamics of the negotiation'
      ],
      'resolution': [
        'Final objections must be addressed before agreement',
        'Last-minute concessions are proposed',
        'A deadline is set for final decision-making'
      ]
    };

    const actions = systemActions[phase.id] || systemActions['negotiation'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
      type: 'crisis_development',
      executedBy: 'system',
      description: randomAction,
      impact: ['Drives campaign progression', 'Creates new opportunities for resolution'],
      timestamp: new Date()
    };
  }

  /**
   * Build prompt for autonomous action generation
   */
  private buildAutonomousActionPrompt(phase: CampaignPhase): string {
    return `The Model UN campaign is in the "${phase.name}" phase. Based on the current situation, one of the AI characters should take initiative to drive the campaign forward toward resolution.

Current Phase: ${phase.name}
Phase Objectives: ${phase.objectives.join(', ')}
Time Remaining: ${this.timeline?.timeRemaining || 0} minutes
Recent Actions: ${this.autonomousActions.slice(-3).map(a => a.description).join('; ')}

Generate a proactive diplomatic statement or proposal from one of the AI characters that will:
1. Address the current phase objectives
2. Move negotiations forward
3. Create opportunities for player engagement
4. Work toward eventual resolution

The response should be realistic, diplomatic, and create meaningful choices for the player.`;
  }

  /**
   * Execute an autonomous action
   */
  private async executeAction(action: AutonomousAction): Promise<void> {
    try {
      logger.info('Executing autonomous action:', {
        type: action.type,
        executedBy: action.executedBy,
        description: action.description
      });

      // Add to campaign log
      if (this.session) {
        this.session.campaignLog = this.session.campaignLog || [];
        this.session.campaignLog.push({
          title: `${action.type.replace('_', ' ').toUpperCase()}`,
          content: action.description,
          timestamp: action.timestamp,
          type: 'autonomous_action'
        });

        // If it's a character action, play voice if possible
        if (action.type === 'character_initiative') {
          try {
            await characterVoiceService.speak(
              action.description,
              action.executedBy,
              this.session.voiceSettings
            );
          } catch (voiceError) {
            logger.warn('Voice playback failed for autonomous action:', voiceError);
          }
        }
      }

    } catch (error) {
      logger.error('Failed to execute autonomous action:', error);
    }
  }

  /**
   * Generate campaign developments
   */
  private async generateDevelopments(): Promise<void> {
    // Generate new crises or developments periodically
    const timeSinceLastDevelopment = Date.now() - this.lastActionTime;
    const shouldGenerateDevelopment = timeSinceLastDevelopment > 120000; // 2 minutes

    if (shouldGenerateDevelopment && this.session?.currentCrisis) {
      try {
        // Generate crisis update
        const crisisUpdate = await this.generateCrisisUpdate();
        if (crisisUpdate) {
          this.session.currentCrisis.description = crisisUpdate;
          this.session.campaignLog.push({
            title: 'CRISIS UPDATE',
            content: crisisUpdate,
            timestamp: new Date(),
            type: 'crisis_development'
          });
        }
      } catch (error) {
        logger.error('Failed to generate crisis development:', error);
      }
    }
  }

  /**
   * Generate crisis update to maintain engagement
   */
  private async generateCrisisUpdate(): Promise<string | null> {
    try {
      const updatePrompt = `The current crisis is: "${this.session?.currentCrisis?.description}"

Generate a brief crisis development that:
1. Escalates the urgency or changes dynamics
2. Creates new opportunities for resolution
3. Maintains diplomatic realism
4. Is appropriate for the time remaining (${this.timeline?.timeRemaining} minutes)

Provide a single paragraph update (2-3 sentences max).`;

      const response = await aiCampaignService.processPlayerInput(updatePrompt, this.session);
      return response.crisisUpdate || null;

    } catch (error) {
      logger.error('Failed to generate crisis update:', error);
      return null;
    }
  }

  /**
   * Evaluate if campaign can be resolved
   */
  private async evaluateResolution(): Promise<CampaignResolution> {
     if (!this.timeline) {
    // you can return a default or throw here --> EDIT BASED ON PERFORMANCE
    return {
      type: 'stalemate',
      description: 'No timeline available',
      playerScore: 0,
      relationshipChanges: {},
      outcomes: [],
      canEndEarly: false
    };
  }
    try {
      // Calculate resolution score based on various factors
      const timeProgress = this.timeline?.progressPercentage || 0;
      const phaseProgress = this.timeline ? (this.timeline.currentPhase / this.timeline.phases.length) * 100 : 0;
      const actionCount = this.autonomousActions.length;

      // Basic scoring algorithm
      let playerScore = 0.5; // Start with neutral score
      
      // Boost score based on progress through phases
      playerScore += (phaseProgress / 100) * 0.3;
      
      // Boost score based on engagement (actions taken)
      playerScore += Math.min(actionCount * 0.05, 0.2);

      const canEndEarly = (
        playerScore >= this.resolutionThreshold &&
        this.timeline?.currentPhase >= 1 && // At least in negotiation phase
        timeProgress >= 60 // At least 60% time elapsed
      );

      return {
        type: this.determineResolutionType(playerScore),
        description: this.generateResolutionDescription(playerScore),
        playerScore,
        relationshipChanges: {},
        outcomes: this.generateOutcomes(playerScore),
        canEndEarly
      };

    } catch (error) {
      logger.error('Error evaluating resolution:', error);
      return {
        type: 'stalemate',
        description: 'Unable to evaluate campaign resolution',
        playerScore: 0.5,
        relationshipChanges: {},
        outcomes: [],
        canEndEarly: false
      };
    }
  }

  /**
   * Determine resolution type based on score
   */
  private determineResolutionType(score: number): CampaignResolution['type'] {
    if (score >= 0.9) return 'diplomatic_success';
    if (score >= 0.7) return 'partial_resolution';
    if (score >= 0.4) return 'stalemate';
    if (this.timeline?.timeRemaining === 0) return 'time_expired';
    return 'crisis_escalation';
  }

  /**
   * Generate resolution description
   */
  private generateResolutionDescription(score: number): string {
    if (score >= 0.9) {
      return 'Comprehensive agreement reached through skilled diplomacy';
    } else if (score >= 0.7) {
      return 'Significant progress made with partial resolution achieved';
    } else if (score >= 0.4) {
      return 'Negotiations reached a stalemate with limited progress';
    } else {
      return 'Crisis escalated with insufficient diplomatic progress';
    }
  }

  /**
   * Generate campaign outcomes
   */
  private generateOutcomes(score: number): string[] {
    const outcomes: string[] = [];
    
    if (score >= 0.8) {
      outcomes.push('International cooperation strengthened');
      outcomes.push('Lasting diplomatic framework established');
    } else if (score >= 0.6) {
      outcomes.push('Temporary agreements reached');
      outcomes.push('Foundation laid for future negotiations');
    } else if (score >= 0.4) {
      outcomes.push('Positions clarified but no agreement');
      outcomes.push('Need for continued diplomatic engagement identified');
    } else {
      outcomes.push('Diplomatic tensions remain high');
      outcomes.push('Alternative resolution mechanisms may be needed');
    }

    return outcomes;
  }

  /**
   * Evaluate phase objectives completion
   */
  private async evaluatePhaseObjectives(phase: CampaignPhase): Promise<number> {
    // Simple heuristic based on actions taken and time elapsed
    const actionCount = this.autonomousActions.filter(a => 
      a.timestamp >= (phase.startTime || new Date())
    ).length;

    const timeProgress = phase.startTime 
      ? (Date.now() - phase.startTime.getTime()) / (phase.maxDuration * 60000)
      : 0;

    // Combine action count and time progress
    return Math.min(1, (actionCount * 0.2) + (timeProgress * 0.8));
  }

  /**
   * Transition to next campaign phase
   */
  private async transitionToNextPhase(): Promise<void> {
    if (!this.timeline) return;

    const currentPhase = this.timeline.phases[this.timeline.currentPhase];
    currentPhase.completed = true;
    currentPhase.endTime = new Date();

    if (this.timeline.currentPhase < this.timeline.phases.length - 1) {
      this.timeline.currentPhase++;
      const nextPhase = this.timeline.phases[this.timeline.currentPhase];
      nextPhase.startTime = new Date();

      logger.info('Transitioning to next campaign phase:', {
        from: currentPhase.name,
        to: nextPhase.name
      });

      // Generate transition announcement
      const transitionAction: AutonomousAction = {
        type: 'phase_transition',
        executedBy: 'system',
        description: `The campaign now enters the ${nextPhase.name} phase. ${nextPhase.description}`,
        impact: ['Phase transition', 'New objectives available'],
        timestamp: new Date()
      };

      await this.executeAction(transitionAction);
    } else {
      // All phases complete, conclude campaign
      const resolution = await this.evaluateResolution();
      await this.concludeCampaign(resolution);
    }
  }

  /**
   * Force campaign conclusion when time expires
   */
  private async forceConclusion(): Promise<void> {
    const resolution: CampaignResolution = {
      type: 'time_expired',
      description: 'Campaign concluded due to time limit',
      playerScore: 0.5,
      relationshipChanges: {},
      outcomes: ['Time limit reached', 'Session concluded'],
      canEndEarly: false
    };

    await this.concludeCampaign(resolution);
  }

  /**
   * Conclude the campaign
   */
  private async concludeCampaign(resolution: CampaignResolution): Promise<void> {
    try {
      logger.info('Concluding campaign with resolution:', resolution.type);

      this.isActive = false;
      
      if (this.orchestrationInterval) {
        clearInterval(this.orchestrationInterval);
        this.orchestrationInterval = null;
      }

      // Add final resolution to campaign log
      if (this.session) {
        this.session.campaignLog.push({
          title: 'CAMPAIGN CONCLUDED',
          content: resolution.description,
          timestamp: new Date(),
          type: 'campaign_conclusion'
        });

        this.session.outcomes = resolution.outcomes;
        this.session.playerStats = {
          ...this.session.playerStats,
          finalScore: resolution.playerScore,
          resolutionType: resolution.type
        };
      }

      // Save final campaign state
      await this.saveCampaignState();

      logger.info('Campaign orchestration concluded successfully');

    } catch (error) {
      logger.error('Error concluding campaign:', error);
    }
  }

  /**
   * Save campaign state to backend
   */
  private async saveCampaignState(): Promise<void> {
    if (this.session) {
      try {
        await aiCampaignService.saveCampaignSession(this.session);
      } catch (error) {
        logger.error('Failed to save campaign state:', error);
      }
    }
  }

  /**
   * Get current campaign status
   */
  getCampaignStatus(): {
    timeline: CampaignTimeline | null;
    isActive: boolean;
    currentPhase: string | null;
    autonomousActions: number;
    nextActionIn: number;
  } {
    const nextActionIn = Math.max(0, this.actionCooldown - (Date.now() - this.lastActionTime));
    
    return {
      timeline: this.timeline,
      isActive: this.isActive,
      currentPhase: this.timeline?.phases[this.timeline.currentPhase]?.name || null,
      autonomousActions: this.autonomousActions.length,
      nextActionIn
    };
  }

  /**
   * Stop campaign orchestration
   */
  stop(): void {
    this.isActive = false;
    
    if (this.orchestrationInterval) {
      clearInterval(this.orchestrationInterval);
      this.orchestrationInterval = null;
    }

    logger.info('Campaign orchestration stopped');
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const campaignOrchestrator = new CampaignOrchestrator();
export default campaignOrchestrator;
export type { CampaignTimeline, CampaignPhase, CampaignResolution, AutonomousAction };
/**
 * CAMPAIGN STATUS CARD - REAL-TIME SESSION MONITORING
 * ==================================================
 * 
 * Displays current campaign session status with:
 * - Real-time progress tracking
 * - Phase transitions
 * - Achievement highlights
 * - Quick session controls
 * - Stakeholder overview
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { CampaignSession } from '../services/aiCampaignService';
import { 
  Target, 
  Clock, 
  Users, 
  Award, 
  TrendingUp,
  StopCircle,
  Play,
  Pause
} from 'lucide-react';

interface CampaignStatusCardProps {
  session: CampaignSession;
  onStopCampaign: () => void;
  className?: string;
}

export function CampaignStatusCard({ 
  session, 
  onStopCampaign, 
  className = '' 
}: CampaignStatusCardProps): JSX.Element {
  
  const getPhaseColor = (phase: string) => {
    const colors = {
      'introduction': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'preparation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'resolution': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'debrief': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[phase as keyof typeof colors] || colors.introduction;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'text-red-600';
    if (progress < 50) return 'text-yellow-600';
    if (progress < 75) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg truncate">
              {session.campaign.title}
            </CardTitle>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onStopCampaign}
            className="flex items-center gap-1 text-xs"
          >
            <StopCircle className="h-3 w-3" />
            Stop
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getPhaseColor(session.phase)}>
            {session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {session.campaign.difficulty.charAt(0).toUpperCase() + session.campaign.difficulty.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Progress
            </span>
            <span className={`font-medium ${getProgressColor(session.negotiationProgress)}`}>
              {session.negotiationProgress}%
            </span>
          </div>
          <Progress 
            value={session.negotiationProgress} 
            className="h-2"
          />
        </div>

        {/* Time & Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">{Math.round(session.timeElapsed)}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Stakeholders:</span>
            <span className="font-medium">{session.activeStakeholders.length}</span>
          </div>
        </div>

        {/* Active Stakeholders */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Users className="h-3 w-3" />
            Active Stakeholders
          </h4>
          <div className="flex flex-wrap gap-1">
            {session.activeStakeholders.map((stakeholder, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {stakeholder}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {session.achievements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Award className="h-3 w-3" />
                Achievements
              </h4>
              <div className="flex flex-wrap gap-1">
                {session.achievements.map((achievement, index) => (
                  <Badge 
                    key={index} 
                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    ✅ {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Current Focus */}
        {session.currentTopic && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Current Focus</h4>
              <p className="text-xs text-muted-foreground">
                {session.currentTopic}
              </p>
            </div>
          </>
        )}

        {/* User Position */}
        {session.userPosition && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Your Role</h4>
            <Badge variant="outline" className="text-xs">
              {session.userPosition}
            </Badge>
          </div>
        )}

        {/* Phase Description */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Phase Description</h4>
          <p className="text-xs text-muted-foreground">
            {getPhaseDescription(session.phase)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getPhaseDescription(phase: string): string {
  const descriptions = {
    'introduction': 'Setting the scene and introducing key stakeholders and issues.',
    'preparation': 'Researching positions and developing negotiation strategies.',
    'negotiation': 'Active diplomatic discussions and proposal exchanges.',
    'resolution': 'Finalizing agreements and addressing remaining conflicts.',
    'debrief': 'Reviewing outcomes and reflecting on the negotiation process.'
  };
  
  return descriptions[phase as keyof typeof descriptions] || 'Campaign in progress.';
}

export default CampaignStatusCard;
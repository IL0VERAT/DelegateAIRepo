export type CampaignCategory =
  | "crisis"
  | "negotiation"
  | "security"
  | "humanitarian"
  | "economic"
  | "environmental"
  | "political"
  | "social";

export type CampaignDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface CampaignDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  processed: boolean;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  relevantTopics: string[];
  suggestedIntegration: string;
  suggestedScenarios?: string[];
  enhancedObjectives?: string[];
  keyInsights?: string[];
}

export interface CampaignTemplate {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  category: CampaignCategory;
  difficulty: CampaignDifficulty;
  duration: number;
  playerCount: number;
  aiDelegates: number;
  theme: string;
  context: string;
  objectives: string[];
  scenarios: string[];
  keyIssues: string[];
  icon: string;
  color: string;
  bgGradient: string;
  featured: boolean;
  new: boolean;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  documents?: CampaignDocument[];
  aiAnalysis?: {
    documentSummary?: string;
    enhancedObjectives?: string[];
    suggestedScenarios?: string[];
    keyInsights?: string[];
  };
}
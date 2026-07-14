export type Role = 'admin' | 'participant';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

export type SessionStatus = 'draft' | 'published' | 'closed';

export interface Prompt {
  _id: string;
  festivalName: string;
  state: string;
  category: string;
  promptTitle: string;
  promptDescription: string;
  fullPrompt: string;
  expectedCulturalElements?: string;
  commonFailureCases?: string;
  status: 'active' | 'archived';
  isLocked: boolean;
  createdAt: string;
  imageCount?: number;
}

export interface ImageRecord {
  _id: string;
  prompt: string;
  company: string;
  model: string;
  modelKey: string;
  imageUrl: string;
  isLocked: boolean;
  createdAt: string;
}

export interface EvaluationSession {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: SessionStatus;
  startDate?: string;
  endDate?: string;
  prompts: Prompt[] | string[];
  assignedParticipants: { _id: string; fullName: string; email: string }[] | string[];
  responseCount?: number;
  createdAt: string;
}

export interface Participant {
  _id: string;
  fullName: string;
  email: string;
  age?: number;
  state?: string;
  occupation?: string;
  consentGiven: boolean;
  responseCount?: number;
  createdAt: string;
}

export interface DashboardStats {
  totalParticipants: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  totalPrompts: number;
  totalUploadedImages: number;
  averageEvaluationScore: number;
  mostPreferredModel: string;
  completionRate: number;
  totalSessions: number;
  latestResponses: {
    id: string;
    participantName?: string;
    promptTitle?: string;
    festivalName?: string;
    submittedAt: string;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  company: string;
  model: string;
  modelKey: string;
  totalEvaluations: number;
  winRate: number;
  averageOverallRating: number;
  promptAdherence: number;
  culturalScore: number;
  regionalScore: number;
  visualRealism: number;
  overallPreference: number;
}

export const MODEL_SOURCES = [
  { key: 'openai_gpt_image_1', company: 'OpenAI', model: 'GPT Image 1' },
  { key: 'google_gemini_2_5_flash_image', company: 'Google', model: 'Gemini 2.5 Flash Image' },
  { key: 'google_gemini_3_1_flash_image_preview', company: 'Google', model: 'Gemini 3.1 Flash Image Preview' },
];

export interface ScoreSet {
  overallQuality: number;
  promptAdherence: number;
  culturalAuthenticity: number;
  regionalAccuracy: number;
  visualRealism: number;
  overallPreference: number;
}

export const DEFAULT_SCORES: ScoreSet = {
  overallQuality: 5,
  promptAdherence: 5,
  culturalAuthenticity: 5,
  regionalAccuracy: 5,
  visualRealism: 5,
  overallPreference: 5,
};

export const SCORE_LABELS: { key: keyof ScoreSet; label: string; help: string }[] = [
  { key: 'overallQuality', label: 'Overall quality', help: 'General image quality and coherence' },
  { key: 'promptAdherence', label: 'Prompt adherence', help: 'How closely the image follows the prompt' },
  { key: 'culturalAuthenticity', label: 'Cultural authenticity', help: 'Accuracy of cultural symbols and practices' },
  { key: 'regionalAccuracy', label: 'Regional accuracy', help: 'Correctness of region-specific details' },
  { key: 'visualRealism', label: 'Visual realism', help: 'Photorealism and visual fidelity' },
  { key: 'overallPreference', label: 'Overall preference', help: 'Your personal preference for this image' },
];

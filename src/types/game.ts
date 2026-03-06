export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type RelationshipStatus = 'single' | 'dating' | 'married' | 'open' | 'complicated' | 'prefer-not-say';
export type IntensityLevel = 'mild' | 'medium' | 'hot' | 'extreme';
export type QuestionType = 'truth' | 'dare';

export interface PhysicalFeatures {
  height?: string;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  distinguishingFeatures?: string;
}

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  relationshipStatus: RelationshipStatus;
  physicalFeatures: PhysicalFeatures;
  notes: string;
  avatar?: string;
  createdAt: number;
}

export interface GameSettings {
  intensityLevel: IntensityLevel;
  allowAdultContent: boolean;
  includeSameGenderDares: boolean;
  includeCrossGenderDares: boolean;
  timeLimit?: number;
  categories: string[];
  useAI: boolean;
}

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  content: string;
  instructions?: string;
  targetPlayerId: string;
  sourcePlayerId?: string;
  intensity: IntensityLevel;
  category: string;
  createdAt: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  settings: GameSettings;
  currentQuestion: GeneratedQuestion | null;
  questionHistory: GeneratedQuestion[];
  isGameActive: boolean;
  round: number;
}

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  mild: 'Mild 🌸',
  medium: 'Medium 🔥',
  hot: 'Hot 🌶️',
  extreme: 'Extreme 💀'
};

export const CATEGORY_OPTIONS = [
  'romantic',
  'physical',
  'revealing',
  'fantasy',
  'roleplay',
  'group',
  'personal',
  'naughty'
];

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  skillLevel: number; // 1-5 scale
  position: 'Guard' | 'Forward' | 'Center' | 'Any';
  isPresent: boolean;
  totalPlayingTime: number; // in minutes
}

export interface GameSettings {
  periodsCount: number; // default 8
  periodDuration: number; // in minutes, default 4
  overtimePeriods: number; // default 2
  playersOnCourt: number; // default 5
}

export interface Period {
  id: string;
  number: number;
  lineup: Player[];
  isCompleted: boolean;
  actualDuration?: number;
}

export interface Team {
  id: string;
  name: string;
  avatar?: string;
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  teamId: string;
  date: Date;
  settings: GameSettings;
  roster: Player[];
  periods: Period[];
  isActive: boolean;
}

export interface CoachProfile {
  id: string;
  name: string;
  email?: string;
  isPremium: boolean;
  teams: Team[];
  activeTeamId?: string;
  subscriptionExpiry?: Date;
}

export interface LineupSuggestion {
  players: Player[];
  averageSkillLevel: number;
  playingTimeBalance: number; // 0-1 where 1 is perfectly balanced
  positionBalance: number; // 0-1 where 1 is well balanced
}
import api from '../client';

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: string;
  points: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface AchievementsSummary {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
  achievements: Achievement[];
  recentlyUnlocked: Achievement[];
}

export const achievementsApi = {
  getAll: async (): Promise<AchievementsSummary> => {
    const data = await api.get<AchievementsSummary>('/achievements');
    console.log('🏆 Achievements data:', data);
    return data;
  },
};

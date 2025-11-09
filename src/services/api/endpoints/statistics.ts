import api from '../client';

export interface SummaryStatistics {
  totalFriends: number;
  totalActiveOwes: number;
  totalOwedToMe: number;
  totalIOweThem: number;
  totalGroups: number;
  totalReturns: number;
}

export interface TopUser {
  userId: number;
  username: string;
  avatarUrl?: string;
  value: number;
  description: string;
}

export interface TopGroup {
  groupId: number;
  groupName: string;
  avatarUrl?: string;
  value: number;
  description: string;
}

export interface InterestingFact {
  title: string;
  value: string | number;
  description: string;
  icon?: string;
}

export interface MonthlyActivity {
  month: string;
  owesCreated: number;
  owesReceived: number;
  returnsMade: number;
}

export interface FullStatistics {
  summary: SummaryStatistics;
  topFriendsByOwes: TopUser[];
  topFriendsByAmount: TopUser[];
  topGroups: TopGroup[];
  interestingFacts: InterestingFact[];
  monthlyActivity: MonthlyActivity[];
  biggestOweCreated?: {
    amount: number;
    username: string;
    date: string;
  };
  biggestOweReceived?: {
    amount: number;
    username: string;
    date: string;
  };
  averageOweAmount: number;
  mostActiveDay: string;
  longestOwe?: {
    days: number;
    username: string;
  };
  fastestReturn?: {
    days: number;
    username: string;
  };
}

export const statisticsApi = {
  getSummary: async (): Promise<SummaryStatistics> => {
    const data = await api.get<SummaryStatistics>('/statistics/summary');
    console.log('📊 Statistics Summary data:', data);
    return data;
  },

  getFull: async (): Promise<FullStatistics> => {
    const data = await api.get<FullStatistics>('/statistics/full');
    console.log('📊 Statistics Full data:', data);
    return data;
  },
};

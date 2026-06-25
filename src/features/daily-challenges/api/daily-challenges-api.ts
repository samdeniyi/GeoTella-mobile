import { apiRequest } from '@/lib/api/client';
import type { Insight } from '@/features/insights/api/insights-api';

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    [key: string]: unknown;
  };
};

export type DailyChallengeType = 'EXPLORE_INSIGHT' | 'ATTEST_DATA_POINT' | 'DISCOVERY' | 'ATTESTATION' | 'FEEDBACK' | string;
export type DailyChallengeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string;

export type DailyChallenge = {
  id: string;
  /** New API field */
  position?: number;
  type: DailyChallengeType;
  /** New API field – human-readable label like "Explore an insight in X" */
  label?: string;
  /** Legacy field */
  title?: string;
  /** New API field */
  insightTitle?: string;
  /** New API: simple boolean */
  completed?: boolean;
  completedAt?: string | null;
  /** Legacy fields (still supported if present) */
  status?: DailyChallengeStatus;
  completedSteps?: number;
  totalSteps?: number;
  nextStepText?: string | null;
  ctaText?: string;
  insightId?: string | null;
};

export type StreakInfo = {
  current: number;
  longest: number;
  completedToday: boolean;
  broken: boolean;
  previousStreak: number;
};

export type DailyChallengeStatusResponse = {
  streak: number;
  streakReset: boolean;
  previousStreak?: number;
  challenges: DailyChallenge[];
  completedCount: number;
  totalCount: number;
  dayComplete: boolean;
};

/** GET /api/daily-challenges/status */
export const getDailyChallengesStatus = () =>
  apiRequest<ApiEnvelope<DailyChallengeStatusResponse>>('/api/daily-challenges/status');

/** GET /api/daily-challenges/{dailyChallengeId}/insight */
export const getDailyChallengeInsight = (dailyChallengeId: string) =>
  apiRequest<ApiEnvelope<Insight>>(`/api/daily-challenges/${dailyChallengeId}/insight`);

/** POST /api/daily-challenges/{dailyChallengeId}/complete */
export const completeDailyChallenge = (dailyChallengeId: string) =>
  apiRequest<ApiEnvelope<{ success: boolean }>>(`/api/daily-challenges/${dailyChallengeId}/complete`, {
    method: 'POST',
  });

// Extraction Helpers
export const extractChallenges = (raw: any): DailyChallenge[] => {
  if (!raw) return [];
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (!unwrapped) return [];
  if (Array.isArray(unwrapped.daily_challenges)) return unwrapped.daily_challenges;
  if (Array.isArray(unwrapped.dailyChallenges)) return unwrapped.dailyChallenges;
  if (Array.isArray(unwrapped.challenges)) return unwrapped.challenges;
  return [];
};

export const extractChallengesStatus = (raw: any): DailyChallengeStatusResponse | null => {
  if (!raw) return null;
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (!unwrapped) return null;

  // The API returns streak as either a number or an object { current, longest, ... }
  const rawStreak = unwrapped.streak;
  const streakNum =
    typeof rawStreak === 'number'
      ? rawStreak
      : typeof rawStreak === 'object' && rawStreak !== null
        ? (rawStreak.current ?? 0)
        : 0;

  const broken =
    typeof rawStreak === 'object' && rawStreak !== null ? rawStreak.broken : false;
  const prevStreak =
    typeof rawStreak === 'object' && rawStreak !== null
      ? rawStreak.previousStreak
      : (unwrapped.previousStreak ?? unwrapped.previous_streak ?? 0);

  const challenges = extractChallenges(raw);

  return {
    streak: streakNum,
    streakReset: unwrapped.streakReset ?? unwrapped.streak_reset ?? broken ?? false,
    previousStreak: prevStreak ?? 0,
    challenges,
    completedCount: unwrapped.completedCount ?? challenges.filter((c: any) => c.completed).length,
    totalCount: unwrapped.totalCount ?? challenges.length,
    dayComplete: unwrapped.dayComplete ?? false,
  };
};

export type DailyChallengeBadge = {
  type: 'SPARK' | 'FLAME' | 'BLAZE' | 'LEGEND' | string;
  name: string;
  description?: string;
  earned: boolean;
  earnedAt?: string | null;
  /** Backend may return either field name */
  streakRequired?: number;
  requiredStreakDays?: number;
};

/** Get the streak-days threshold from a badge regardless of field name */
export const getBadgeStreakDays = (badge: DailyChallengeBadge): number => {
  return badge.requiredStreakDays ?? badge.streakRequired ?? 0;
};

export type DailyChallengeBadgesResponse = {
  badges: DailyChallengeBadge[];
};

/** GET /api/users/me/daily-challenge-badges */
export const getDailyChallengeBadges = () =>
  apiRequest<ApiEnvelope<DailyChallengeBadgesResponse>>('/api/users/me/daily-challenge-badges');

export const extractDailyChallengeBadges = (raw: any): DailyChallengeBadge[] => {
  if (!raw) return [];
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (!unwrapped) return [];
  if (Array.isArray(unwrapped.badges)) return unwrapped.badges;
  if (Array.isArray(unwrapped.items)) return unwrapped.items;
  if (Array.isArray(unwrapped)) return unwrapped;
  return [];
};

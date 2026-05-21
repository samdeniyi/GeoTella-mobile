import { apiRequest } from '@/lib/api/client';

// Backend envelopes most responses as `{ data, message, statusCode, success }`.
export type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
  meta?: unknown;
};

export type WhoAmI = {
  id?: string;
  emailAddress?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  persona?: string;
  [key: string]: unknown;
};

export type LevelRef = {
  number: number;
  name: string;
  thresholdLabel?: string | null;
};

export type AchievementProgressBar = {
  current: number;
  required: number;
  percent: number;
  unit: string;
};

export type AchievementsResponse = {
  currentLevel: LevelRef;
  nextLevel: LevelRef | null;
  progress: AchievementProgressBar | null;
  verifiedInsightCount: number;
  submissionCount: number;
  isMaxLevel: boolean;
};

export type Badge = {
  type: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  progress: AchievementProgressBar | null;
};

export type BadgesResponse = {
  badges: Badge[];
};

export const getWhoAmI = () => apiRequest<ApiEnvelope<WhoAmI>>('/api/users/whoami');

export const getMyAchievements = () =>
  apiRequest<ApiEnvelope<AchievementsResponse>>('/api/users/me/achievements');

export const getMyBadges = () => apiRequest<ApiEnvelope<BadgesResponse>>('/api/users/me/badges');

// Pull `data` out of the API envelope. Returns null when absent.
export const unwrap = <T>(raw: ApiEnvelope<T> | T | unknown): T | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as ApiEnvelope<T>;
  if (r.data !== undefined && r.data !== null) return r.data;
  // Some endpoints return the payload directly; only return that when it
  // doesn't look like a wrapper.
  if (!('data' in r) && !('success' in r) && !('statusCode' in r)) return raw as T;
  return null;
};

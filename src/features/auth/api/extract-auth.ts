import type { User } from '@/types';

import type { AuthSuccess } from './auth-api';

// Backend response shape isn't confirmed yet — this helper inspects common
// locations (`token`, `accessToken`, nested under `data`) so callers can keep
// working before the contract is finalized. Tighten this once we know the shape.
export type AuthPayload = {
  token: string;
  user: User;
  refreshToken?: string;
  isOnboardingComplete?: boolean;
};

export const extractAuthPayload = (raw: AuthSuccess | unknown): AuthPayload | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const data = (r.data && typeof r.data === 'object' ? r.data : r) as Record<string, unknown>;

  const token =
    (typeof data.token === 'string' && data.token) ||
    (typeof data.accessToken === 'string' && data.accessToken) ||
    (typeof r.token === 'string' && r.token) ||
    (typeof r.accessToken === 'string' && r.accessToken) ||
    null;
  if (!token) return null;

  const userCandidate =
    (data.user && typeof data.user === 'object' ? data.user : null) ??
    (r.user && typeof r.user === 'object' ? r.user : null);

  let user: User | null = (userCandidate ?? null) as User | null;

  if (!user && data.id) {
    user = {
      id: data.id as string,
      email: (data.emailAddress as string) || (data.email as string) || '',
      role: (data.role as any) || 'GROWTH_SEEKER',
      fullName: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
      createdAt: new Date().toISOString(),
    };
  }

  const refreshToken =
    (typeof data.refreshToken === 'string' && data.refreshToken) ||
    (typeof r.refreshToken === 'string' && r.refreshToken) ||
    undefined;

  const isOnboardingComplete =
    typeof data.isOnboardingComplete === 'boolean'
      ? data.isOnboardingComplete
      : typeof r.isOnboardingComplete === 'boolean'
        ? r.isOnboardingComplete
        : undefined;

  return { token, user: user as User, refreshToken, isOnboardingComplete };
};

import type { UserRole } from '@/types';

// Backend persona enum vs. our internal UserRole. The backend uses INVESTOR;
// the app labels it GROWTH_SEEKER. EXPLORER matches on both sides.
export const toUserRole = (raw: string | null | undefined): UserRole | null => {
  if (!raw) return null;
  const v = String(raw).trim().toUpperCase();
  if (v === 'EXPLORER') return 'EXPLORER';
  if (v === 'INVESTOR' || v === 'GROWTH_SEEKER') return 'GROWTH_SEEKER';
  return null;
};

export const toBackendPersona = (role: UserRole): 'INVESTOR' | 'EXPLORER' =>
  role === 'EXPLORER' ? 'EXPLORER' : 'INVESTOR';

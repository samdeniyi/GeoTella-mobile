import type { UserRole } from '@/types';

type RoleTheme = {
  // Tailwind class names — used directly on RN components via NativeWind.
  accentBg: string;
  accentText: string;
  accentBorder: string;
  // Hex value — for places that need a real color (icon tint, status bar, native APIs).
  accentHex: string;
  label: string;
};

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  GROWTH_SEEKER: {
    accentBg: 'bg-brand',
    accentText: 'text-brand',
    accentBorder: 'border-brand',
    accentHex: '#0E5A3A',
    label: 'Growth & Investment Seeker',
  },
  EXPLORER: {
    accentBg: 'bg-accent',
    accentText: 'text-accent',
    accentBorder: 'border-accent',
    accentHex: '#E85A2D',
    label: 'Intelligent Explorer',
  },
};

const FALLBACK: RoleTheme = ROLE_THEMES.GROWTH_SEEKER;

export const getRoleTheme = (role: UserRole | null | undefined): RoleTheme =>
  role ? ROLE_THEMES[role] : FALLBACK;

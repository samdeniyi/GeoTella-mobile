import { useQuery } from '@tanstack/react-query';

import { getMyAchievements, getMyBadges, getWhoAmI } from './users-api';

export const usersKeys = {
  whoami: ['users', 'whoami'] as const,
  achievements: ['users', 'me', 'achievements'] as const,
  badges: ['users', 'me', 'badges'] as const,
};

export const useWhoAmIQuery = () => useQuery({ queryKey: usersKeys.whoami, queryFn: getWhoAmI });

export const useMyAchievementsQuery = () =>
  useQuery({ queryKey: usersKeys.achievements, queryFn: getMyAchievements });

export const useMyBadgesQuery = () =>
  useQuery({ queryKey: usersKeys.badges, queryFn: getMyBadges });

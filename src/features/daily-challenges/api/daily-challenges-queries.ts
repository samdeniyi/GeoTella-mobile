import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDailyChallengesStatus,
  getDailyChallengeInsight,
  completeDailyChallenge,
  getDailyChallengeBadges,
} from './daily-challenges-api';

export const dailyChallengesKeys = {
  status: () => ['daily-challenges', 'status'] as const,
  insight: (challengeId: string) => ['daily-challenges', 'insight', challengeId] as const,
};

export const useDailyChallengesStatusQuery = () =>
  useQuery({
    queryKey: dailyChallengesKeys.status(),
    queryFn: getDailyChallengesStatus,
  });

export const useDailyChallengeInsightQuery = (challengeId: string, enabled = false) =>
  useQuery({
    queryKey: dailyChallengesKeys.insight(challengeId),
    queryFn: () => getDailyChallengeInsight(challengeId),
    enabled: enabled && !!challengeId,
  });

export const useCompleteDailyChallengeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeDailyChallenge,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dailyChallengesKeys.status() });
      void qc.invalidateQueries({ queryKey: ['insights', 'feed'] });
      void qc.invalidateQueries({ queryKey: ['daily-challenges', 'badges'] });
    },
  });
};

export const useDailyChallengeBadgesQuery = () =>
  useQuery({
    queryKey: ['daily-challenges', 'badges'],
    queryFn: getDailyChallengeBadges,
  });

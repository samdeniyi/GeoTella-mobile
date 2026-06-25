import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  attestInsight,
  bookmarkInsight,
  createInsight,
  flagInsight,
  getBookmarks,
  getFeed,
  getInsightById,
  getMyContributions,
  getPendingVerification,
  likeInsight,
  unlikeInsight,
  recordInsightView,
  unbookmarkInsight,
  updateInsight,
  type FeedFilters,
} from './insights-api';

export const insightsKeys = {
  feed: (page = 1, limit = 100, filters: FeedFilters = {}) =>
    ['insights', 'feed', page, limit, filters] as const,
  detail: (id: string) => ['insights', 'detail', id] as const,
  pending: (page = 1, limit = 20) => ['insights', 'pending', page, limit] as const,
  bookmarks: (page = 1, limit = 50) => ['insights', 'bookmarks', page, limit] as const,
  contributions: (page = 1, limit = 50) => ['insights', 'contributions', page, limit] as const,
};

export const useFeedQuery = (page = 1, limit = 100, filters: FeedFilters = {}) =>
  useQuery({
    queryKey: insightsKeys.feed(page, limit, filters),
    queryFn: () => getFeed({ page, limit, ...filters }),
  });

export const useInsightQuery = (id?: string) =>
  useQuery({
    queryKey: id ? insightsKeys.detail(id) : ['insights', 'detail', 'unknown'],
    queryFn: () => getInsightById(id ?? ''),
    enabled: Boolean(id),
  });

export const usePendingVerificationQuery = (page = 1, limit = 20) =>
  useQuery({
    queryKey: insightsKeys.pending(page, limit),
    queryFn: () => getPendingVerification({ page, limit }),
  });

export const useBookmarksQuery = (page = 1, limit = 50) =>
  useQuery({
    queryKey: insightsKeys.bookmarks(page, limit),
    queryFn: () => getBookmarks({ page, limit }),
  });

export const useMyContributionsQuery = (page = 1, limit = 50) =>
  useQuery({
    queryKey: insightsKeys.contributions(page, limit),
    queryFn: () => getMyContributions({ page, limit }),
  });

export const useCreateInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInsight,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['insights', 'feed'] });
      void qc.invalidateQueries({ queryKey: ['insights', 'contributions'] });
    },
  });
};

export const useUpdateInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateInsight>[1] }) =>
      updateInsight(id, input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: insightsKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: ['insights', 'feed'] });
      void qc.invalidateQueries({ queryKey: ['insights', 'contributions'] });
    },
  });
};

export const useAttestInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: Parameters<typeof attestInsight>[1] }) =>
      attestInsight(id, type),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['insights', 'pending'] });
    },
  });
};

export const useRecordViewMutation = () => useMutation({ mutationFn: recordInsightView });

export const useLikeInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: likeInsight,
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: insightsKeys.detail(id) });
    },
  });
};

export const useUnlikeInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unlikeInsight,
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: insightsKeys.detail(id) });
    },
  });
};

export const useFlagInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => flagInsight(id, reason),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: insightsKeys.detail(vars.id) });
    },
  });
};

export const useBookmarkInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookmarkInsight,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['insights', 'bookmarks'] });
    },
  });
};

export const useUnbookmarkInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unbookmarkInsight,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['insights', 'bookmarks'] });
    },
  });
};

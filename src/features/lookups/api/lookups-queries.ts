import { useQuery } from '@tanstack/react-query';

import { getInsightCategories } from './lookups-api';

export const lookupsKeys = {
  insightCategories: ['lookups', 'insights', 'categories'] as const,
};

export const useInsightCategoriesQuery = () =>
  useQuery({
    queryKey: lookupsKeys.insightCategories,
    queryFn: getInsightCategories,
    staleTime: 5 * 60 * 1000,
  });

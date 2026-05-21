import { apiRequest } from '@/lib/api/client';

export type CategoryOption = {
  id: string;
  name: string;
};

export const getInsightCategories = () =>
  apiRequest<CategoryOption[] | { data?: CategoryOption[] }>('/api/lookups/insights/categories');

export const extractCategories = (
  raw: CategoryOption[] | { data?: CategoryOption[] } | unknown,
): CategoryOption[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown };
    if (Array.isArray(r.data)) return r.data as CategoryOption[];
  }
  return [];
};

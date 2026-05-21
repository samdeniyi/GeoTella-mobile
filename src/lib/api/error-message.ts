import { ApiError } from './client';

export const getErrorMessage = (e: unknown, fallback = 'Something went wrong'): string => {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
};

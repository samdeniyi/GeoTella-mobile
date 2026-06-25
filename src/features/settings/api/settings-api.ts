import { apiRequest } from '@/lib/api/client';

export type LocationPrivacyMode = 'PRECISE' | 'APPROXIMATE' | 'HIDDEN' | string;

export type NotificationPrefs = {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
};

export type PrivacyPrefs = {
  locationPrivacyMode: LocationPrivacyMode;
  shareUsageData: boolean;
};

export type UserSettings = {
  user: Record<string, unknown>;
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
  isEmailVerified: boolean;
};

export const getUserSettings = () =>
  apiRequest<UserSettings | { data?: UserSettings }>('/api/user/settings');

export type UpdateUserInfoInput = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export const updateUserInfo = (input: UpdateUserInfoInput) =>
  apiRequest<unknown>('/api/user/settings/update-userinfo', { method: 'PATCH', body: input });

export const updateNotificationPrefs = (input: Partial<NotificationPrefs>) =>
  apiRequest<unknown>('/api/user/settings/notifications', { method: 'PATCH', body: input });

export const updatePrivacyPrefs = (input: Partial<PrivacyPrefs>) =>
  apiRequest<unknown>('/api/user/settings/privacy', { method: 'PATCH', body: input });

export type DataPrivacyResponse = {
  locationPrivacy?: { mode?: string; label?: string };
  dataSovereignty?: { pendingExportRequest?: boolean; pendingDeletionRequest?: boolean };
  identityVerification?: { status?: string; label?: string };
  [key: string]: unknown;
};

export const getDataPrivacy = () =>
  apiRequest<DataPrivacyResponse | { data?: DataPrivacyResponse }>(
    '/api/user/settings/data-privacy',
  );

export type FaqItem = {
  id?: string;
  question?: string;
  title?: string;
  answer?: string;
  description?: string;
  [key: string]: unknown;
};

export const getFaq = () => apiRequest<FaqItem[] | { data?: FaqItem[] }>('/api/user/settings/faq');

export type PrivacyPolicy = {
  version: string;
  effectiveDate: string;
  title: string;
  content: string;
};

export const getPrivacyPolicy = () =>
  apiRequest<PrivacyPolicy | { data?: PrivacyPolicy }>('/api/user/settings/legal/privacy-policy', {
    // Public legal text — accessible from the signup screen before login.
    unauthenticated: true,
  });

export const unwrapPrivacyPolicy = (raw: unknown): PrivacyPolicy | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { data?: unknown };
  if (r.data && typeof r.data === 'object') return r.data as PrivacyPolicy;
  return raw as PrivacyPolicy;
};

export const deleteAccount = (confirmationPhrase: string) =>
  apiRequest<unknown>('/api/user/settings/account', {
    method: 'DELETE',
    body: { confirmationPhrase },
  });

// Convenience unwrappers — backend wraps responses inconsistently.
export const unwrapSettings = (raw: unknown): UserSettings | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { data?: unknown };
  if (r.data && typeof r.data === 'object') return r.data as UserSettings;
  return raw as UserSettings;
};

export const unwrapDataPrivacy = (raw: unknown): DataPrivacyResponse | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { data?: unknown };
  if (r.data && typeof r.data === 'object') return r.data as DataPrivacyResponse;
  return raw as DataPrivacyResponse;
};

export const unwrapFaq = (raw: unknown): FaqItem[] => {
  if (Array.isArray(raw)) return raw as FaqItem[];
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown };
    if (Array.isArray(r.data)) return r.data as FaqItem[];
  }
  return [];
};

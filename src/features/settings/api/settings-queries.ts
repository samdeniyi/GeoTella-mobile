import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteAccount,
  getDataPrivacy,
  getFaq,
  getPrivacyPolicy,
  getUserSettings,
  updateNotificationPrefs,
  updatePrivacyPrefs,
  updateUserInfo,
} from './settings-api';

export const settingsKeys = {
  all: ['settings'] as const,
  user: ['settings', 'user'] as const,
  dataPrivacy: ['settings', 'data-privacy'] as const,
  faq: ['settings', 'faq'] as const,
  privacyPolicy: ['settings', 'privacy-policy'] as const,
};

export const useUserSettingsQuery = () =>
  useQuery({ queryKey: settingsKeys.user, queryFn: getUserSettings });

export const useDataPrivacyQuery = () =>
  useQuery({ queryKey: settingsKeys.dataPrivacy, queryFn: getDataPrivacy });

export const useFaqQuery = () => useQuery({ queryKey: settingsKeys.faq, queryFn: getFaq });

export const usePrivacyPolicyQuery = (enabled = true) =>
  useQuery({
    queryKey: settingsKeys.privacyPolicy,
    queryFn: getPrivacyPolicy,
    enabled,
    staleTime: 60 * 60 * 1000,
  });

const invalidateUserSettings = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: settingsKeys.user });
  void qc.invalidateQueries({ queryKey: settingsKeys.dataPrivacy });
};

export const useUpdateUserInfoMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: () => {
      invalidateUserSettings(qc);
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateNotificationPrefsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPrefs,
    onSuccess: () => invalidateUserSettings(qc),
  });
};

export const useUpdatePrivacyPrefsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePrivacyPrefs,
    onSuccess: () => invalidateUserSettings(qc),
  });
};

export const useDeleteAccountMutation = () => useMutation({ mutationFn: deleteAccount });

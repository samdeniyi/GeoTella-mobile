import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeOnboarding, getProfile, setPersona, uploadProfilePhoto } from './profile-api';

export const profileQueryKey = ['profile'] as const;

export const useProfileQuery = () =>
  useQuery({
    queryKey: profileQueryKey,
    queryFn: getProfile,
  });

export const useSetPersonaMutation = () => useMutation({ mutationFn: setPersona });

export const useCompleteOnboardingMutation = () => useMutation({ mutationFn: completeOnboarding });

export const useUploadProfilePhotoMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
};

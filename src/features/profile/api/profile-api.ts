import { apiRequest } from '@/lib/api/client';

import type {
  APP_FUNCTIONAL_ROLES,
  AREAS_OF_EXPERTISE,
  CONTRIBUTION_TYPES,
  DEAL_SIZES,
  EXPLORATION_REASONS,
  FOCUS_SECTORS,
  LANGUAGES,
} from './onboarding-enums';

type V<T> = T[keyof T];

export type SetPersonaInput = {
  persona: 'INVESTOR' | 'EXPLORER';
};

export type CompleteOnboardingInput = {
  appFunctionalRole?: V<typeof APP_FUNCTIONAL_ROLES>[];
  focusSectors?: V<typeof FOCUS_SECTORS>[];
  dealSize?: V<typeof DEAL_SIZES>[];
  organisation?: string;
  baseCity?: string;
  areasOfExpertise?: V<typeof AREAS_OF_EXPERTISE>[];
  explorationReasons?: V<typeof EXPLORATION_REASONS>[];
  languages?: V<typeof LANGUAGES>[];
  contributionTypes?: V<typeof CONTRIBUTION_TYPES>[];
};

// Backend persona enum on the profile is 'EXPLORER' | 'INVESTOR'.
export type ProfilePersona = 'EXPLORER' | 'INVESTOR' | string;

export type ProfileBio = {
  id?: string;
  appFunctionalRole?: string | null;
  areasOfExpertise?: unknown[] | null;
  baseCity?: string | null;
  contributionTypes?: unknown[] | null;
  countryOfFocus?: string | null;
  dealSize?: string | null;
  displayName?: string | null;
  explorationReasons?: unknown[] | null;
  focusSectors?: unknown[] | null;
  investmentInterests?: unknown[] | null;
  languages?: unknown[] | null;
  organisation?: string | null;
  personaLabel?: string | null;
  profilePhotoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedDate?: string | null;
};

export type Profile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  username?: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  role?: string;
  persona?: ProfilePersona;
  isActive?: boolean;
  isOnboardingComplete?: boolean;
  isPublic?: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  explorerLevel?: number;
  contributionCount?: number;
  verifiedInsightCount?: number;
  activeSubscriptionId?: string | null;
  bio?: ProfileBio | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

// The backend always envelopes mutations as `{ data, message, statusCode, success }`.
export type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
  meta?: unknown;
};

export type ProfileResponse = ApiEnvelope<Profile> | Profile;

export const setPersona = (input: SetPersonaInput) =>
  apiRequest<ProfileResponse>('/api/profiles/onboarding/persona', {
    method: 'POST',
    body: input,
  });

export const completeOnboarding = (input: CompleteOnboardingInput) =>
  apiRequest<ProfileResponse>('/api/profiles/onboarding/complete', {
    method: 'POST',
    body: input,
  });

export const getProfile = () => apiRequest<ProfileResponse>('/api/profiles');

// Upload a new profile picture — multipart/form-data with a single `file` field.
const guessImageMime = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
};

export type ProfilePhotoInput = { uri: string; name?: string; type?: string };

export const uploadProfilePhoto = (input: ProfilePhotoInput) => {
  const fd = new FormData();
  const name = input.name ?? input.uri.split('/').pop() ?? 'photo.jpg';
  const type = input.type ?? guessImageMime(input.uri);
  fd.append('file', { uri: input.uri, name, type } as unknown as Blob);
  return apiRequest<ProfileResponse>('/api/profiles/upload', {
    method: 'POST',
    formData: fd,
  });
};

export const extractProfile = (raw: ProfileResponse | unknown): Profile | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as ApiEnvelope<Profile> & { id?: string };
  if (r.data && typeof r.data === 'object') return r.data;
  if (typeof r.id === 'string') return r as Profile;
  return null;
};

import { create } from 'zustand';

import type { UserRole } from '@/types';

type SignupDraft = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  phone?: string;
  otpVerified: boolean;
  role: UserRole | null;
  // 'tell us more' fields differ per role — keep a loose bag so each step writes what it owns.
  details: Record<string, unknown>;
};

type SignupState = SignupDraft & {
  setBasic: (
    v: Pick<SignupDraft, 'fullName' | 'email' | 'dateOfBirth' | 'password' | 'phone'>,
  ) => void;
  setOtpVerified: (v: boolean) => void;
  setRole: (role: UserRole) => void;
  patchDetails: (patch: Record<string, unknown>) => void;
  reset: () => void;
};

const initial: SignupDraft = {
  fullName: '',
  email: '',
  dateOfBirth: '',
  password: '',
  phone: undefined,
  otpVerified: false,
  role: null,
  details: {},
};

export const useSignupStore = create<SignupState>((set) => ({
  ...initial,
  setBasic: (v) => set(v),
  setOtpVerified: (otpVerified) => set({ otpVerified }),
  setRole: (role) => set({ role }),
  patchDetails: (patch) => set((s) => ({ details: { ...s.details, ...patch } })),
  reset: () => set(initial),
}));

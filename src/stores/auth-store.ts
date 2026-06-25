import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { logout } from '@/features/auth/api/auth-api';
import { queryClient } from '@/lib/query-client';
import { secureStorage } from '@/lib/secure-storage';
import { useSignupStore } from '@/stores/signup-store';
import type { User, UserRole } from '@/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  hydrate: () => Promise<void>;
  signIn: (params: { user: User; token: string; refreshToken?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  token: null,

  hydrate: async () => {
    set({ status: 'loading' });
    // Read defensively — a transient SecureStore failure on Android (e.g. the
    // keystore is temporarily unavailable just after boot) shouldn't sign the
    // user out. Only flip to `unauthenticated` when we positively confirm the
    // session is missing.
    let token: string | null = null;
    let userJson: string | null = null;
    try {
      [token, userJson] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.AUTH_TOKEN),
        secureStorage.get(STORAGE_KEYS.USER),
      ]);
    } catch {
      // Storage read failed — leave whatever's in storage alone so the next
      // launch can retry. Treat this launch as signed-out.
      set({ status: 'unauthenticated', user: null, token: null });
      return;
    }
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({ status: 'authenticated', user, token });
        return;
      } catch {
        // The stored user blob is corrupt but the token may still be valid —
        // wipe only the broken record, not the token.
        await secureStorage.remove(STORAGE_KEYS.USER);
      }
    }
    set({ status: 'unauthenticated', user: null, token: null });
  },

  signIn: async ({ user, token, refreshToken }) => {
    // Drop any cached queries from a previous session so the new user never
    // sees the old user's profile / feed / notifications etc.
    queryClient.clear();
    await Promise.all([
      secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, token),
      secureStorage.set(STORAGE_KEYS.USER, JSON.stringify(user)),
      refreshToken
        ? secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        : Promise.resolve(),
    ]);
    set({ status: 'authenticated', user, token });
    useSignupStore.getState().reset();
  },

  signOut: async () => {
    // Fire-and-forget server logout — we still want to clear local state even
    // if the network call fails (e.g. expired token, offline).
    try {
      await logout();
    } catch {
      // ignore — local cleanup below is the source of truth.
    }
    await Promise.all([
      secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN),
      secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      secureStorage.remove(STORAGE_KEYS.USER),
    ]);
    set({ status: 'unauthenticated', user: null, token: null });
    useSignupStore.getState().reset();
    // Wipe cached queries so a subsequent login (even as a different user)
    // doesn't briefly show the previous user's data.
    queryClient.clear();
  },

  setRole: (role) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, role };
    set({ user: updated });
    void secureStorage.set(STORAGE_KEYS.USER, JSON.stringify(updated));
  },
}));

export const useUser = () => useAuthStore((s) => s.user);
export const useUserRole = (): UserRole | null => useAuthStore((s) => s.user?.role ?? null);
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');

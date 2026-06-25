import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Lightweight wallet cache — the API is the source of truth, but the store
// provides instant reads for balance and optimistic unlock tracking while
// queries settle.
// ---------------------------------------------------------------------------

export type WalletState = {
  /** Cached balance from the last dashboard fetch. */
  balance: number;
  /** Set the cached balance (called after dashboard query succeeds). */
  setBalance: (balance: number) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,

  setBalance: (balance) => set({ balance }),
}));

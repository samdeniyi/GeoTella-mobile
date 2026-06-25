import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPurchaseIntent,
  getEarnTokenDetails,
  getHowItWorks,
  getReferralSummary,
  getTokenBundles,
  getTransactionById,
  getTransactions,
  getWalletDashboard,
  unlockFullInsight,
} from './wallet-api';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const walletKeys = {
  all: ['wallet'] as const,
  dashboard: () => ['wallet', 'dashboard'] as const,
  bundles: () => ['wallet', 'bundles'] as const,
  howItWorks: () => ['wallet', 'how-it-works'] as const,
  referral: () => ['wallet', 'referral'] as const,
  earn: () => ['wallet', 'earn'] as const,
  transactions: (limit?: number) => ['wallet', 'transactions', limit] as const,
  transactionDetail: (id: string) => ['wallet', 'transaction', id] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useWalletDashboardQuery = () =>
  useQuery({
    queryKey: walletKeys.dashboard(),
    queryFn: getWalletDashboard,
  });

export const useTokenBundlesQuery = () =>
  useQuery({
    queryKey: walletKeys.bundles(),
    queryFn: getTokenBundles,
  });

export const useHowItWorksQuery = () =>
  useQuery({
    queryKey: walletKeys.howItWorks(),
    queryFn: getHowItWorks,
  });

export const useReferralSummaryQuery = () =>
  useQuery({
    queryKey: walletKeys.referral(),
    queryFn: getReferralSummary,
  });

export const useEarnTokenDetailsQuery = () =>
  useQuery({
    queryKey: walletKeys.earn(),
    queryFn: getEarnTokenDetails,
  });

export const useTransactionsQuery = (limit?: number) =>
  useQuery({
    queryKey: walletKeys.transactions(limit),
    queryFn: () => getTransactions(limit),
  });

export const useTransactionDetailQuery = (id?: string) =>
  useQuery({
    queryKey: id ? walletKeys.transactionDetail(id) : ['wallet', 'transaction', 'unknown'],
    queryFn: () => getTransactionById(id ?? ''),
    enabled: Boolean(id),
  });

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** Debit 5 tokens to unlock a full insight. */
export const useUnlockInsightMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unlockFullInsight,
    onSuccess: (_data, insightId) => {
      // Refresh wallet balance + the insight detail so the `feature` field updates.
      void qc.invalidateQueries({ queryKey: walletKeys.dashboard() });
      void qc.invalidateQueries({ queryKey: walletKeys.transactions() });
      void qc.invalidateQueries({ queryKey: ['insights', 'detail', insightId] });
      void qc.invalidateQueries({ queryKey: ['insights', 'feed'] });
    },
  });
};

/** Create a Stripe PaymentIntent for a token bundle. Returns `clientSecret`. */
export const usePurchaseIntentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseIntent,
    onSuccess: () => {
      // After a successful payment confirmation (handled outside this hook)
      // we invalidate. We also invalidate here in case the webhook fires fast.
      void qc.invalidateQueries({ queryKey: walletKeys.dashboard() });
      void qc.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
};

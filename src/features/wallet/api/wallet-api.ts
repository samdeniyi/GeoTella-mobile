import { apiRequest } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Response Wrapper
// ---------------------------------------------------------------------------

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    [key: string]: unknown;
  };
};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type WalletDashboard = {
  balance: number;
  insightUnlockEstimate?: number; // Mapped from api
  estimatedInsightUnlocks?: number; // Legacy fallback
  tokensExpiringIn30Days?: number;
  expiryWarning?: boolean;
  freeMonthlyInsightViews?: {
    limit: number;
    used: number;
    available: number;
    resetsAt: string;
  };
};

export type TokenBundle = {
  id: string;
  name: string;
  tokenAmount: number; // Mapped from api
  tokens?: number; // Legacy fallback
  price: string | number; // API returns string e.g. "19.00"
  currency: string;
  isActive: boolean;
  bestValue: boolean;
  sortOrder: number;
  pricePerToken?: number;
  tag?: string;
};

export type SpendOption = {
  key: string;
  label: string;
  tokenCost: number;
  icon?: string;
};

export type EarnOption = {
  key: string;
  label: string;
  reward: string;
  icon?: string;
};

export type HowItWorksData = {
  spendTokensOn: SpendOption[];
  alwaysFree: string[];
  earnTokens: EarnOption[];
  goodToKnow: string[];
  cta?: {
    label: string;
  };
  // Legacy fields fallback
  spendOptions?: { label: string; cost: number | string; icon?: string }[];
  freeFeatures?: string[];
  earnOptions?: { label: string; reward: number | string; icon?: string }[];
};

export type ReferralSummary = {
  referralCode?: string;
  inviteLink?: string;
  invitedFriendsCount?: number;
  invitedCount?: number; // legacy fallback
  referralTokensEarned?: number;
  tokensEarned?: number; // legacy fallback
  referralBonusPercent?: number;
};

export type EarnTokenOption = {
  key: string;
  title: string;
  description: string;
  reward: string;
  status: string; // "CLAIMED", "AVAILABLE", etc
  claimed: boolean;
  claimsCount?: number;
  tokensEarned?: number;
  referralCode?: string;
  inviteLink?: string;
  invitedFriendsCount?: number;
  action?: {
    label: string;
    key: string;
  };
  // Legacy fields
  id?: string;
  type?: string;
  label?: string;
  icon?: string;
};

export type TransactionType =
  | 'PURCHASE_CREDIT'
  | 'INSIGHT_UNLOCK_DEBIT'
  | 'EARN_CREDIT'
  | 'REFERRAL_CREDIT'
  | 'EXPIRY_DEBIT'
  | string;

export type WalletTransaction = {
  id: string;
  type?: TransactionType;
  title?: string;
  description?: string;
  subtitle?: string;
  insight?: string;
  amount?: number;
  displayAmount?: string;
  balanceAfter?: number;
  status?: string;
  reference?: string;
  createdAt?: string;
  date?: string;
  insightId?: string;
  insightTitle?: string;
  bundleName?: string;
  tokenBundleId?: string;
  referenceType?: string;
};

export type PurchaseIntentResponse = {
  clientSecret: string;
  paymentIntentId?: string;
};

export type UnlockInsightResponse = {
  success?: boolean;
  balance?: number;
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /api/wallet/dashboard */
export const getWalletDashboard = () =>
  apiRequest<ApiEnvelope<WalletDashboard>>('/api/wallet/dashboard');

/** GET /api/wallet/token-bundles */
export const getTokenBundles = () =>
  apiRequest<ApiEnvelope<{ items: TokenBundle[] }>>('/api/wallet/token-bundles');

/** GET /api/wallet/how-it-works */
export const getHowItWorks = () =>
  apiRequest<ApiEnvelope<HowItWorksData>>('/api/wallet/how-it-works');

/** GET /api/wallet/referral-summary */
export const getReferralSummary = () =>
  apiRequest<ApiEnvelope<ReferralSummary>>('/api/wallet/referral-summary');

/** GET /api/wallet/earn-token-details */
export const getEarnTokenDetails = () =>
  apiRequest<ApiEnvelope<{ items: EarnTokenOption[] }>>('/api/wallet/earn-token-details');

/** GET /api/wallet/transactions */
export const getTransactions = (limit?: number) =>
  apiRequest<ApiEnvelope<{ balance: number; items: WalletTransaction[] }>>('/api/wallet/transactions', {
    query: limit ? { limit } : undefined,
  });

/** GET /api/wallet/transactions/:id */
export const getTransactionById = (transactionId: string) =>
  apiRequest<ApiEnvelope<WalletTransaction>>(`/api/wallet/transactions/${transactionId}`);

/** POST /api/wallet/unlock-full-insight */
export const unlockFullInsight = (insightId: string) =>
  apiRequest<ApiEnvelope<UnlockInsightResponse>>('/api/wallet/unlock-full-insight', {
    method: 'POST',
    body: { insightId },
  });

/** POST /api/wallet/purchase-intent */
export const createPurchaseIntent = (bundleId: string) =>
  apiRequest<ApiEnvelope<PurchaseIntentResponse>>('/api/wallet/purchase-intent', {
    method: 'POST',
    body: { bundleId },
  });

// ---------------------------------------------------------------------------
// Extraction & Unwrapping Helpers
// ---------------------------------------------------------------------------

// Pull `data` out of the API envelope. Returns null when absent.
// Pull `data` out of the API envelope. Returns null when absent.
export const unwrap = <T>(raw: ApiEnvelope<T> | null | undefined): T | null => {
  if (!raw) return null;
  return raw.data !== undefined ? raw.data : null;
};

export const extractBundles = (raw: any): TokenBundle[] => {
  if (!raw) return [];
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === 'object') {
    if (Array.isArray(unwrapped.items)) return unwrapped.items;
    if (Array.isArray(unwrapped.bundles)) return unwrapped.bundles;
    if (Array.isArray(unwrapped.data)) return unwrapped.data;
  }
  return [];
};

export const extractTransactions = (raw: any): WalletTransaction[] => {
  if (!raw) return [];
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === 'object') {
    if (Array.isArray(unwrapped.items)) return unwrapped.items;
    if (Array.isArray(unwrapped.transactions)) return unwrapped.transactions;
    if (Array.isArray(unwrapped.data)) return unwrapped.data;
  }
  return [];
};

export const extractTransaction = (raw: any): WalletTransaction | null => {
  if (!raw) return null;
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (!unwrapped || typeof unwrapped !== 'object') return null;
  if (unwrapped.data && typeof unwrapped.data === 'object') return unwrapped.data;
  if (typeof unwrapped.id === 'string') return unwrapped as WalletTransaction;
  return null;
};

export const extractEarnOptions = (raw: any): EarnTokenOption[] => {
  if (!raw) return [];
  const unwrapped = raw.data !== undefined ? raw.data : raw;
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === 'object') {
    if (Array.isArray(unwrapped.items)) return unwrapped.items;
    if (Array.isArray(unwrapped.options)) return unwrapped.options;
    if (Array.isArray(unwrapped.data)) return unwrapped.data;
  }
  return [];
};

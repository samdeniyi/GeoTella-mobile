import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  WarningIcon,
  TokenWalletIcon,
  LockIcon,
  FireIcon,
  CheckIcon,
  UsersIcon,
  GiftIcon,
  MailIcon,
} from '@/components/ui/Icons';
import {
  extractTransactions,
  unwrap,
  type WalletTransaction,
} from '@/features/wallet/api/wallet-api';
import {
  useTransactionsQuery,
  useWalletDashboardQuery,
} from '@/features/wallet/api/wallet-queries';

// Map backend transaction types to icon components. Matches the original
// hardcoded `iconType` logic so the UI stays visually consistent.
const renderTxIcon = (tx: WalletTransaction) => {
  const type = (tx.type ?? '').toUpperCase();

  if (type.includes('PURCHASE') || type.includes('BUNDLE')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
        <TokenWalletIcon color="#0E5A3A" size={18} />
      </View>
    );
  }
  if (type.includes('INSIGHT') || type.includes('UNLOCK')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF5F0]">
        <LockIcon color="#E85A2D" size={18} />
      </View>
    );
  }
  if (type.includes('HEATMAP') || type.includes('HOT_ZONE') || type.includes('MAP')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF5F0]">
        <FireIcon color="#E85A2D" size={18} />
      </View>
    );
  }
  if (type.includes('VERIFICATION') || type.includes('GROUND_TRUTH') || type.includes('EARN')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
        <CheckIcon color="#0E5A3A" size={14} />
      </View>
    );
  }
  if (type.includes('REFERRAL')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
        <UsersIcon color="#0E5A3A" size={18} />
      </View>
    );
  }
  if (type.includes('FOUNDING')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
        <GiftIcon color="#0E5A3A" size={18} />
      </View>
    );
  }
  if (type.includes('EMAIL')) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
        <MailIcon color="#0E5A3A" size={18} />
      </View>
    );
  }
  // Default
  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-border/40">
      <TokenWalletIcon color="#0D1B1E" size={18} />
    </View>
  );
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

export default function TransactionsScreen() {
  const txQuery = useTransactionsQuery(30);
  const dashboardQuery = useWalletDashboardQuery();
  const dashboard = unwrap(dashboardQuery.data);
  const transactions = useMemo(() => extractTransactions(txQuery.data), [txQuery.data]);
  const expiringTokens = dashboard?.tokensExpiringIn30Days ?? 0;

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <SafeAreaView edges={['top']} className="flex-row items-center gap-4 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-xl font-extrabold text-text">Transactions</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {txQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-6 py-6">
            {/* Expiration warning with nested Buy button */}
            {expiringTokens > 0 ? (
              <View className="mx-6 flex-row items-center justify-between rounded-2xl border border-[#F8DCCB]/30 bg-[#FFF5F0] p-4">
                <View className="flex-1 flex-row items-center gap-3">
                  <WarningIcon color="#E85A2D" size={20} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-[#C14622]">
                      {expiringTokens} tokens expire in 30 days
                    </Text>
                    <Text className="mt-0.5 text-xs text-[#C14622] opacity-80">
                      Top up to keep your balance.
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push('/wallet/buy')}
                  className="rounded-full bg-brand px-4 py-1.5 active:opacity-90"
                >
                  <Text className="text-xs font-bold text-white">Buy</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Transaction Section */}
            <View>
              <Text className="mx-6 mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                RECENT
              </Text>

              {transactions.length === 0 ? (
                <Text className="mx-6 text-sm text-text opacity-50">No transactions yet.</Text>
              ) : (
                <View className="mx-6 overflow-hidden rounded-[32px] border border-border bg-surface-card">
                  {transactions.map((tx, index) => {
                    const isLast = index === transactions.length - 1;
                    const amount = tx.amount ?? 0;
                    const isCredit = tx.displayAmount
                      ? tx.displayAmount.startsWith('+')
                      : amount > 0;
                    const displayAmount = tx.displayAmount ?? (isCredit ? `+${amount}` : `${amount}`);
                    const description =
                      tx.subtitle ??
                      tx.description ??
                      (tx.insightTitle
                        ? `${tx.insightTitle} · ${formatDate(tx.createdAt ?? tx.date)}`
                        : formatDate(tx.createdAt ?? tx.date));

                    return (
                      <Pressable
                        key={tx.id}
                        onPress={() =>
                          router.push({
                            pathname: '/wallet/transaction/[id]',
                            params: { id: tx.id },
                          })
                        }
                        className={`flex-row items-center justify-between px-5 py-4 active:bg-border/10 ${
                          !isLast ? 'border-b border-border/30' : ''
                        }`}
                      >
                        <View className="flex-1 flex-row items-center gap-4">
                          {renderTxIcon(tx)}
                          <View className="flex-1">
                            <Text className="text-sm font-bold leading-snug text-text">
                              {tx.title ?? tx.type ?? 'Transaction'}
                            </Text>
                            <Text className="mt-0.5 text-xs leading-snug text-text opacity-50">
                              {description}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className={`ml-4 text-base font-extrabold ${
                            isCredit ? 'text-brand' : 'text-[#C14622]'
                          }`}
                        >
                          {displayAmount}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

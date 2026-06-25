import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  TokenWalletIcon,
  CheckIcon,
  UsersIcon,
  GiftIcon,
  MailIcon,
  EyeIcon,
} from '@/components/ui/Icons';
import { extractTransaction } from '@/features/wallet/api/wallet-api';
import { useTransactionDetailQuery } from '@/features/wallet/api/wallet-queries';

const formatFullDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detailQuery = useTransactionDetailQuery(id);
  const tx = useMemo(() => extractTransaction(detailQuery.data), [detailQuery.data]);

  if (detailQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#0B4A33" />
      </View>
    );
  }

  if (!tx) {
    return (
      <View className="flex-1 items-center justify-center bg-surface p-6">
        <Text className="text-base text-text opacity-60">Transaction not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-brand px-6 py-2">
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const amount = tx.amount ?? 0;
  const isCredit = tx.displayAmount
    ? tx.displayAmount.startsWith('+')
    : amount > 0;
  const displayAmount = tx.displayAmount ?? (isCredit ? `+${amount}` : `-${Math.abs(amount)}`);
  const type = (tx.type ?? '').toUpperCase();

  const renderTopIcon = () => {
    if (type.includes('PURCHASE') || type.includes('BUNDLE')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
          <TokenWalletIcon color="#0E5A3A" size={28} />
        </View>
      );
    }
    if (type.includes('INSIGHT') || type.includes('UNLOCK') || type.includes('HEATMAP') || type.includes('MAP')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF5F0]">
          <EyeIcon color="#E85A2D" size={28} />
        </View>
      );
    }
    if (type.includes('VERIFICATION') || type.includes('GROUND_TRUTH') || type.includes('EARN')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
          <CheckIcon color="#0E5A3A" size={24} />
        </View>
      );
    }
    if (type.includes('REFERRAL')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
          <UsersIcon color="#0E5A3A" size={28} />
        </View>
      );
    }
    if (type.includes('FOUNDING')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
          <GiftIcon color="#0E5A3A" size={28} />
        </View>
      );
    }
    if (type.includes('EMAIL')) {
      return (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
          <MailIcon color="#0E5A3A" size={28} />
        </View>
      );
    }
    return (
      <View className="h-16 w-16 items-center justify-center rounded-full bg-border/40">
        <TokenWalletIcon color="#0D1B1E" size={28} />
      </View>
    );
  };

  const isSpend = type.includes('INSIGHT') || type.includes('UNLOCK') || type.includes('MAP');

  const handleAction = () => {
    if (isSpend && tx.insightId) {
      router.push({
        pathname: '/(app)/insight/[id]',
        params: { id: tx.insightId },
      });
    } else {
      router.push('/(app)/(tabs)/map');
    }
  };

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
        <Text className="text-xl font-extrabold text-text">Transaction Details</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {/* Body content */}
      <View className="flex-1 justify-between p-6">
        <View className="items-center py-4">
          {renderTopIcon()}

          <Text className="mt-4 text-lg font-bold text-text">
            {tx.title ?? tx.type ?? 'Transaction'}
          </Text>

          <View className="mt-2 flex-row items-baseline gap-1">
            <Text
              style={{ fontFamily: 'Georgia' }}
              className={`text-4xl font-extrabold ${isCredit ? 'text-brand' : 'text-[#C14622]'}`}
            >
              {displayAmount}
            </Text>
            <Text
              className={`ml-1 text-base font-bold ${isCredit ? 'text-brand' : 'text-[#C14622]'}`}
            >
              tokens
            </Text>
          </View>

          {/* Status badge */}
          {(() => {
            const status = tx.status ?? 'Completed';
            const isPending = status.toUpperCase() === 'PENDING';
            if (isPending) {
              return (
                <View className="mt-4 flex-row items-center gap-1.5 rounded-full border border-[#FFF5F0] bg-[#FFF5F0] px-3.5 py-1">
                  <Text className="text-xs font-bold text-[#C14622]">
                    ⏳ Pending
                  </Text>
                </View>
              );
            }
            return (
              <View className="mt-4 flex-row items-center gap-1.5 rounded-full border border-[#DCF5EA] bg-[#DCF5EA] px-3.5 py-1">
                <Text className="text-xs font-bold text-brand">
                  ✓ {status}
                </Text>
              </View>
            );
          })()}

          {/* Details Card */}
          <View className="mt-8 w-full overflow-hidden rounded-[32px] border border-border bg-surface-card">
            <View className="flex-row justify-between border-b border-border/30 px-6 py-4">
              <Text className="text-sm text-text opacity-50">Type</Text>
              <Text className="text-sm font-bold text-text">{tx.type ?? '—'}</Text>
            </View>

            {tx.insightTitle || tx.bundleName ? (
              <View className="flex-row justify-between border-b border-border/30 px-6 py-4">
                <Text className="text-sm text-text opacity-50">
                  {tx.bundleName ? 'Pack' : 'Insight'}
                </Text>
                <Text
                  className="ml-4 flex-1 text-right text-sm font-bold text-text"
                  numberOfLines={1}
                >
                  {tx.insightTitle ?? tx.bundleName}
                </Text>
              </View>
            ) : null}

            <View className="flex-row justify-between border-b border-border/30 px-6 py-4">
              <Text className="text-sm text-text opacity-50">Date</Text>
              <Text className="text-sm font-bold text-text">{formatFullDate(tx.createdAt ?? tx.date)}</Text>
            </View>

            {typeof tx.balanceAfter === 'number' ? (
              <View className="flex-row justify-between border-b border-border/30 px-6 py-4">
                <Text className="text-sm text-text opacity-50">Balance after</Text>
                <Text className="text-sm font-bold text-text">{tx.balanceAfter} tokens</Text>
              </View>
            ) : null}

            {tx.reference ? (
              <View className="flex-row justify-between px-6 py-4">
                <Text className="text-sm text-text opacity-50">Reference</Text>
                <Text className="text-sm font-bold text-text">{tx.reference}</Text>
              </View>
            ) : null}
          </View>

          {/* View Insight/Explore Button */}
          <Pressable
            onPress={handleAction}
            className="mt-6 h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface-card active:bg-border/10"
          >
            <EyeIcon color="#0D1B1E" size={18} />
            <Text className="text-base font-bold text-text">
              {isSpend ? 'View insight' : 'Explore feed'}
            </Text>
          </Pressable>
        </View>

        {/* Contact Support Link */}
        <SafeAreaView edges={['bottom']} className="items-center pb-2">
          <Pressable onPress={() => router.push('/contact-support')}>
            <Text className="text-sm font-bold text-brand underline">
              Contact support about this
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
}

import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  TokenWalletIcon,
  WarningIcon,
  ClockIcon,
  GiftIcon,
  InfoIcon,
  ArrowRight,
} from '@/components/ui/Icons';
import { useWalletDashboardQuery } from '@/features/wallet/api/wallet-queries';
import { unwrap } from '@/features/wallet/api/wallet-api';

export default function WalletScreen() {
  const dashboardQuery = useWalletDashboardQuery();
  const dashboard = unwrap(dashboardQuery.data);

  const balance = dashboard?.balance ?? 0;
  const estimatedUnlocks =
    dashboard?.insightUnlockEstimate ?? dashboard?.estimatedInsightUnlocks ?? Math.floor(balance / 5);
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
        <Text className="text-xl font-extrabold text-text">Wallet</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {dashboardQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-5 py-6">
            {/* Current Balance Card */}
            <View className="mx-6 rounded-[32px] border border-border bg-surface-card p-8">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-brand">
                CURRENT BALANCE
              </Text>
              <View className="mt-3 flex-row items-baseline gap-1">
                <Text style={{ fontFamily: 'Georgia' }} className="text-6xl font-extrabold text-text">
                  {balance}
                </Text>
                <Text className="ml-1 text-xl font-bold text-text">tokens</Text>
              </View>
              <Text className="mt-2 text-sm text-text opacity-60">
                ≈ {estimatedUnlocks} {estimatedUnlocks === 1 ? 'full insight unlock' : 'full insight unlocks'}
              </Text>
            </View>

            {/* Buy tokens Button */}
            <Pressable
              onPress={() => router.push('/wallet/buy')}
              className="mx-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
            >
              <TokenWalletIcon color="white" size={18} />
              <Text className="text-base font-bold text-white">Buy tokens</Text>
            </Pressable>

            {/* Warning banner — only show if tokens are expiring */}
            {expiringTokens > 0 ? (
              <View className="mx-6 flex-row items-center gap-3 rounded-2xl border border-[#F8DCCB]/30 bg-[#FFF5F0] p-4">
                <WarningIcon color="#E85A2D" size={20} />
                <Text className="text-sm font-semibold text-[#C14622] text-accent-dark">
                  {expiringTokens} tokens expire in 30 days
                </Text>
              </View>
            ) : null}

            {/* Navigation Options List */}
            <View className="gap-3 px-6">
              {/* Transaction history */}
              <Pressable
                onPress={() => router.push('/wallet/transactions')}
                className="flex-row items-center justify-between rounded-[24px] border border-border bg-surface-card p-5 active:opacity-90"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#DCF5EA]">
                    <ClockIcon color="#0E5A3A" size={22} />
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-text">Transaction history</Text>
                    <Text className="mt-0.5 text-xs text-text opacity-50">
                      Credits, debits & expiry
                    </Text>
                  </View>
                </View>
                <ArrowRight size={16} color="#0D1B1E" />
              </Pressable>

              {/* Earn free tokens */}
              <Pressable
                onPress={() => router.push('/wallet/earn')}
                className="flex-row items-center justify-between rounded-[24px] border border-border bg-surface-card p-5 active:opacity-90"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FFF5F0]">
                    <GiftIcon color="#FF812D" size={22} />
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-text">Earn free tokens</Text>
                    <Text className="mt-0.5 text-xs text-text opacity-50">
                      Up to 25 tokens available
                    </Text>
                  </View>
                </View>
                <ArrowRight size={16} color="#0D1B1E" />
              </Pressable>

              {/* How tokens work */}
              <Pressable
                onPress={() => router.push('/wallet/how-tokens-work')}
                className="flex-row items-center justify-between rounded-[24px] border border-border bg-surface-card p-5 active:opacity-90"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#DCF5EA]">
                    <InfoIcon color="#0E5A3A" size={22} />
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-text">How tokens work</Text>
                    <Text className="mt-0.5 text-xs text-text opacity-50">What you can unlock</Text>
                  </View>
                </View>
                <ArrowRight size={16} color="#0D1B1E" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

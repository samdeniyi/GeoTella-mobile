import { useStripe } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, ClockIcon, ArrowRight } from '@/components/ui/Icons';
import {
  extractBundles,
  unwrap,
  type TokenBundle,
} from '@/features/wallet/api/wallet-api';
import {
  usePurchaseIntentMutation,
  useTokenBundlesQuery,
  walletKeys,
} from '@/features/wallet/api/wallet-queries';
import { queryClient } from '@/lib/query-client';

export default function BuyTokenScreen() {
  const bundlesQuery = useTokenBundlesQuery();
  const bundles = useMemo(() => extractBundles(bundlesQuery.data), [bundlesQuery.data]);

  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const purchaseIntent = usePurchaseIntentMutation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Auto-select first bundle once loaded (or the "best value" one if tagged).
  const effectiveBundles = bundles.length > 0 ? bundles : [];
  const selectedBundle =
    effectiveBundles.find((b) => b.id === selectedBundleId) ??
    effectiveBundles.find((b) => b.tag) ??
    effectiveBundles[0] ??
    null;

  const handlePurchase = async () => {
    if (!selectedBundle) return;
    setPaying(true);

    try {
      // 1. Create PaymentIntent on the backend.
      const result = await purchaseIntent.mutateAsync(selectedBundle.id);
      const unwrapped = unwrap(result);
      const clientSecret = unwrapped?.clientSecret;

      if (!clientSecret) {
        Alert.alert('Error', 'Could not create payment. Please try again.');
        setPaying(false);
        return;
      }

      // 2. Initialise Stripe Payment Sheet.
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Geotela',
        returnURL: 'geotela://stripe-redirect',
      });

      if (initError) {
        Alert.alert('Payment Error', initError.message);
        setPaying(false);
        return;
      }

      // 3. Present the Payment Sheet.
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or payment failed.
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', presentError.message);
        }
        setPaying(false);
        return;
      }

      // 4. Payment succeeded — refresh wallet data.
      void queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });

      const tokensCount = selectedBundle.tokenAmount ?? selectedBundle.tokens ?? 0;
      Alert.alert(
        'Purchase Successful',
        `You have purchased ${tokensCount} tokens!`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setPaying(false);
    }
  };

  if (bundlesQuery.isLoading) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top']} className="flex-row items-center gap-4 bg-surface px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
          >
            <BackIcon size={20} />
          </Pressable>
          <Text className="text-xl font-extrabold text-text">Buy Token</Text>
        </SafeAreaView>
        <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      </View>
    );
  }

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
        <Text className="text-xl font-extrabold text-text">Buy Token</Text>
      </SafeAreaView>

      <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 p-6">
          <Text className="text-sm leading-relaxed text-text" style={{ opacity: 0.7 }}>
            No subscription. Buy a pack, spend tokens on what you want — top up anytime.
          </Text>

          {/* Cards list */}
          <View className="gap-4">
            {effectiveBundles.map((pack: TokenBundle) => {
              const isSelected = selectedBundle?.id === pack.id;
              const tokens = pack.tokenAmount ?? pack.tokens ?? 0;
              const priceVal = typeof pack.price === 'string' ? parseFloat(pack.price) : (pack.price ?? 0);
              const perToken = pack.pricePerToken ?? (tokens > 0 ? priceVal / tokens : 0);
              const displayTag = pack.tag ?? (pack.bestValue ? 'BEST VALUE' : undefined);
              return (
                <TouchableOpacity
                  key={pack.id}
                  onPress={() => setSelectedBundleId(pack.id)}
                  activeOpacity={0.9}
                  style={[
                    {
                      borderRadius: 32,
                      borderWidth: 1,
                      padding: 24,
                      backgroundColor: isSelected ? '#0E5A3A' : '#FAF9F6',
                      borderColor: isSelected ? '#0E5A3A' : '#DCD9CE',
                    },
                    isSelected && {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 4,
                    },
                  ]}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-[10px] font-bold tracking-widest"
                      style={{
                        color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#0D1B1E',
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    >
                      {pack.name?.toUpperCase?.() ?? ''}
                    </Text>
                    {displayTag ? (
                      <View className="rounded-full bg-[#FF812D] px-2.5 py-0.5">
                        <Text className="text-[9px] font-extrabold text-white">{displayTag}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View className="mt-2 flex-row items-baseline gap-1">
                    <Text
                      style={{ fontFamily: 'Georgia', color: isSelected ? '#FFFFFF' : '#0D1B1E' }}
                      className="text-5xl font-extrabold"
                    >
                      {tokens}
                    </Text>
                    <Text
                      className="ml-1 text-lg font-bold"
                      style={{
                        color: isSelected ? 'rgba(255, 255, 255, 0.7)' : '#3B82F6',
                      }}
                    >
                      tk
                    </Text>
                  </View>

                  <Text
                    className="mt-2 text-sm font-semibold"
                    style={{
                      color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#0D1B1E',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    ${priceVal.toFixed(2)}{' '}
                    <Text style={{ fontWeight: 'normal', opacity: 0.5 }}>· ${perToken.toFixed(2)} / token</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Expiration Footnote */}
          <View className="flex-row gap-3 py-2">
            <ClockIcon color="#6B7280" size={18} />
            <Text className="flex-1 text-xs leading-normal text-text" style={{ opacity: 0.6 }}>
              Tokens expire 12 months after purchase — reminder 30 days before.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer sticky action button */}
      <SafeAreaView
        edges={['bottom']}
        className="bg-surface px-6 py-4"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(220, 217, 206, 0.2)' }}
      >
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={paying || !selectedBundle}
          activeOpacity={0.9}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand"
          style={[
            {
              opacity: paying || !selectedBundle ? 0.5 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
        >
          {paying ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-base font-bold text-white">
                Continue with{' '}
                {selectedBundle
                  ? selectedBundle.name.charAt(0) + selectedBundle.name.slice(1).toLowerCase()
                  : ''}
              </Text>
              <ArrowRight color="white" size={18} />
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { extractInsights, type Insight } from '@/features/insights/api/insights-api';
import {
  useAttestInsightMutation,
  usePendingVerificationQuery,
} from '@/features/insights/api/insights-queries';
import { normalizeInsight } from '@/features/insights/normalize';
import { getErrorMessage } from '@/lib/api/error-message';

const ATTESTATIONS_REQUIRED = 3;

export function VerifyStep() {
  const pending = usePendingVerificationQuery();
  const attest = useAttestInsightMutation();

  const items = useMemo<Insight[]>(() => extractInsights(pending.data), [pending.data]);

  return (
    <ScrollView
      className="flex-1 px-6"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={pending.isFetching && !pending.isLoading}
          onRefresh={pending.refetch}
        />
      }
    >
      <View className="mb-6 flex-row items-center gap-4 rounded-3xl border border-orange-100 bg-orange-50 p-6">
        <Text className="text-xl text-orange-600">ⓘ</Text>
        <Text className="flex-1 text-xs text-text opacity-80">
          Each verification earns <Text className="font-bold text-text">+15 Trust Score</Text>. Be
          honest — false attestations reduce your score.
        </Text>
      </View>

      <Text className="mb-6 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
        {items.length} pending verification{items.length === 1 ? '' : 's'}
      </Text>

      {pending.isLoading ? (
        <View className="mt-10 items-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : pending.isError ? (
        <View className="mt-10 items-center px-6">
          <Text className="text-center text-sm text-text opacity-60">
            {getErrorMessage(pending.error, 'Could not load pending verifications.')}
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="mt-10 items-center px-6">
          <Text className="text-center text-sm text-text opacity-60">
            Nothing waiting for verification right now.
          </Text>
        </View>
      ) : (
        items.map((raw) => {
          const item = normalizeInsight(raw);
          const attestations =
            raw.attestCount ??
            raw.checklist?.attestCount ??
            (Array.isArray(raw.attestations) ? raw.attestations.length : 0);
          const needs = Math.max(0, ATTESTATIONS_REQUIRED - attestations);
          const progress = Math.min(1, attestations / ATTESTATIONS_REQUIRED);
          const isPending = attest.isPending && attest.variables?.id === raw.id;

          return (
            <View key={raw.id} className="mb-6 rounded-[32px] border border-border bg-white p-6">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Text className="font-bold text-white">{item.user.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1">
                      <Text className="font-bold text-text">{item.user.name}</Text>
                      <Text>{item.user.flag}</Text>
                    </View>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                      {item.time}
                    </Text>
                  </View>
                </View>
                {item.tags[0] ? (
                  <View className="rounded-xl border border-border bg-surface px-3 py-1.5">
                    <Text className="text-xs font-bold text-text opacity-60">{item.tags[0]}</Text>
                  </View>
                ) : null}
              </View>

              <Text className="mb-1 text-[10px] font-bold text-text opacity-40">
                ⊙ {item.location}
              </Text>
              <Text className="mb-4 text-xl font-bold leading-tight text-text">{item.title}</Text>
              {item.description ? (
                <Text
                  className="mb-4 text-sm leading-relaxed text-text opacity-60"
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
              ) : null}

              <View className="mb-2 flex-row justify-between">
                <Text className="text-[10px] font-bold text-text opacity-40">
                  {attestations}/{ATTESTATIONS_REQUIRED} verifications
                </Text>
                <Text className="text-[10px] font-bold uppercase text-orange-500">
                  Needs {needs} more
                </Text>
              </View>
              <View className="mb-8 h-1.5 w-full rounded-full bg-border/20">
                <View
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>

              <View className="flex-row gap-4">
                <Pressable
                  disabled={isPending}
                  onPress={() => attest.mutate({ id: raw.id, type: 'REFUTE' })}
                  className="h-14 flex-1 items-center justify-center rounded-2xl border border-border bg-white"
                >
                  <Text className="font-bold text-accent">✕ Refute</Text>
                </Pressable>
                <Pressable
                  disabled={isPending}
                  onPress={() => attest.mutate({ id: raw.id, type: 'ATTEST' })}
                  className="h-14 flex-1 items-center justify-center rounded-2xl bg-brand"
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="font-bold text-white">✓ Attest</Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      <View className="h-20" />
    </ScrollView>
  );
}

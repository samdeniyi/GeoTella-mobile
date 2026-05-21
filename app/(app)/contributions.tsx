import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowRight, BackIcon, CheckIcon } from '@/components/ui/Icons';
import {
  extractInsights,
  type GrowthRating,
  type Insight,
} from '@/features/insights/api/insights-api';
import { useMyContributionsQuery } from '@/features/insights/api/insights-queries';
import { normalizeInsight } from '@/features/insights/normalize';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useAddStore } from '@/stores/add-store';
import { useUserRole } from '@/stores/auth-store';

const statusLabel = (s?: string): { label: string; tone: 'green' | 'amber' | 'grey' } => {
  if (!s) return { label: 'Draft', tone: 'grey' };
  if (s === 'PUBLISHED' || s === 'VERIFIED') return { label: s, tone: 'green' };
  if (s === 'PENDING' || s === 'PENDING_VERIFICATION') return { label: 'Pending', tone: 'amber' };
  return { label: s, tone: 'grey' };
};

const categoryNameOf = (raw: Insight): string | undefined => {
  if (raw.categoryName) return raw.categoryName;
  if (typeof raw.category === 'object' && raw.category?.name) return raw.category.name;
  if (typeof raw.category === 'string') return raw.category;
  return undefined;
};

export default function MyContributionsScreen() {
  const router = useRouter();
  const role = useUserRole();
  const isExplorer = role === 'EXPLORER';

  const contributionsQuery = useMyContributionsQuery();
  const items = useMemo(() => extractInsights(contributionsQuery.data), [contributionsQuery.data]);

  const setAddData = useAddStore((s) => s.setData);
  const resetAdd = useAddStore((s) => s.reset);

  // Prefill the add-store with this insight's fields, then route to the
  // contribute modal in edit mode. Submit will PATCH instead of POST because
  // `editingId` is set.
  const editInsight = (raw: Insight) => {
    resetAdd();
    const lat = typeof raw.latitude === 'number' ? raw.latitude : 0;
    const lng = typeof raw.longitude === 'number' ? raw.longitude : 0;
    const locationName =
      raw.locationDisplay ||
      [raw.locationLabel ?? raw.locationName, raw.regionName, raw.countryName]
        .filter(Boolean)
        .join(' · ') ||
      'Existing location';
    setAddData({
      editingId: raw.id,
      headline: raw.title ?? '',
      description: raw.body ?? '',
      categoryId: raw.categoryId ?? '',
      categoryName: categoryNameOf(raw),
      growthSignal: (raw.growthRating ?? 'WARMING') as GrowthRating,
      sourceLink: typeof raw.sourceCitations === 'string' ? raw.sourceCitations : '',
      location: {
        name: locationName,
        address: raw.locationDisplay,
        coords: { lat, lng },
        country: raw.countryName,
        region: raw.regionName,
        city: raw.locationLabel ?? raw.locationName,
      },
    });
    router.push('/(app)/add');
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="flex-row items-center gap-6 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-2xl font-bold text-text">My Contributions</Text>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={contributionsQuery.isFetching && !contributionsQuery.isLoading}
            onRefresh={contributionsQuery.refetch}
          />
        }
      >
        <Text className="mb-10 mt-4 text-base leading-relaxed text-text opacity-50">
          {isExplorer
            ? "Your journey as an Intelligent Explorer. All the stories you've shared with the GeoTela community."
            : "Your audit trail as a Growth & Investment Seeker. Every insight you've verified or submitted."}
        </Text>

        {contributionsQuery.isLoading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : contributionsQuery.isError ? (
          <View className="mt-10 items-center px-6">
            <Text className="text-center text-sm text-text opacity-60">
              {getErrorMessage(contributionsQuery.error, 'Could not load your contributions.')}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View className="mt-10 items-center px-6">
            <Text className="text-center text-sm text-text opacity-60">
              You haven't contributed any insights yet.
            </Text>
          </View>
        ) : (
          <View className="mb-20 gap-6">
            {items.map((raw) => {
              const item = normalizeInsight(raw);
              const status = statusLabel(raw.status);
              const verifyCount =
                raw.attestCount ??
                raw.checklist?.attestCount ??
                (Array.isArray(raw.attestations) ? raw.attestations.length : 0);
              return (
                <View
                  key={raw.id}
                  className="overflow-hidden rounded-[32px] border border-border bg-white p-8"
                >
                  <View className="mb-2 flex-row items-start justify-between">
                    <Text className="flex-1 text-[10px] font-bold uppercase tracking-widest text-brand">
                      {item.location.toUpperCase()}
                    </Text>
                    <View
                      className={cn(
                        'flex-row items-center gap-1 rounded-full border px-3 py-1',
                        status.tone === 'green'
                          ? 'border-green-100 bg-green-50'
                          : status.tone === 'amber'
                            ? 'border-orange-100 bg-orange-50'
                            : 'border-border/40 bg-surface-card',
                      )}
                    >
                      <Text
                        className={cn(
                          'text-[10px] font-bold',
                          status.tone === 'green'
                            ? 'text-green-700'
                            : status.tone === 'amber'
                              ? 'text-orange-600'
                              : 'text-text opacity-60',
                        )}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <Text className="mb-4 text-xl font-bold leading-tight text-text">
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                      {item.description}
                    </Text>
                  ) : null}

                  {item.tags.length > 0 ? (
                    <View className="mb-8 flex-row flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <View
                          key={tag}
                          className="rounded-full border border-border bg-surface-card px-4 py-2"
                        >
                          <Text className="text-xs font-medium text-text opacity-50">#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View className="mb-6 h-[1px] w-full bg-border/30" />

                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-text opacity-30">{item.time}</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="h-5 w-5 items-center justify-center rounded-full border border-brand/40">
                        <CheckIcon size={10} color="#0B4A33" />
                      </View>
                      <Text className="text-xs font-bold text-text">
                        {verifyCount} Verification{verifyCount === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => editInsight(raw)}
                    className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface-card"
                  >
                    <Text className="text-sm font-bold text-text">Edit insight</Text>
                    <ArrowRight size={14} color="#0D1B1E" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

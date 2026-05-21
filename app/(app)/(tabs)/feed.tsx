import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChallengeCard } from '@/components/features/feed/ChallengeCard';
import { FeedCard } from '@/components/features/feed/FeedCard';
import { Logo, BellIcon } from '@/components/ui/Icons';
import { extractInsights, type FeedFilters } from '@/features/insights/api/insights-api';
import { useFeedQuery } from '@/features/insights/api/insights-queries';
import {
  countActiveFilters,
  FeedFilterModal,
} from '@/features/insights/components/FeedFilterModal';
import { normalizeInsight } from '@/features/insights/normalize';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useUserRole } from '@/stores/auth-store';

export default function FeedScreen() {
  const router = useRouter();
  const role = useUserRole();
  const isExplorer = role === 'EXPLORER';

  const [filters, setFilters] = useState<FeedFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const feed = useFeedQuery(1, 20, filters);
  const items = useMemo(() => extractInsights(feed.data).map(normalizeInsight), [feed.data]);
  const activeCount = countActiveFilters(filters);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="px-6 pb-2">
        <View className="flex-row items-center justify-between py-2">
          <Logo />
          <Pressable onPress={() => router.push('/notifications')}>
            <BellIcon />
          </Pressable>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-text">
            {isExplorer ? 'Geo-stories' : 'For you'}
          </Text>
          <Pressable
            onPress={() => setFilterOpen(true)}
            className={cn(
              'flex-row items-center gap-2 rounded-full border px-4 py-2',
              activeCount > 0 ? 'border-brand bg-brand' : 'border-border bg-surface-card',
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                activeCount > 0 ? 'text-white' : 'text-text opacity-70',
              )}
            >
              Filter{activeCount > 0 ? ` · ${activeCount}` : ''}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={feed.isFetching && !feed.isLoading}
            onRefresh={feed.refetch}
          />
        }
      >
        <ChallengeCard
          role={role}
          onPress={() => router.push({ pathname: '/(app)/add', params: { tab: 'verify' } })}
        />

        {feed.isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : feed.isError ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              {getErrorMessage(feed.error, 'Could not load the feed.')}
            </Text>
            <Pressable
              onPress={() => feed.refetch()}
              className="mt-4 rounded-2xl border border-border px-5 py-3"
            >
              <Text className="text-sm font-bold text-text">Try again</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              {activeCount > 0
                ? 'No insights match these filters.'
                : 'No insights yet. Be the first to contribute.'}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              role={role}
              onPress={() =>
                router.push({ pathname: '/(app)/insight/[id]', params: { id: item.id } })
              }
            />
          ))
        )}

        <View className="h-20" />
      </ScrollView>

      <FeedFilterModal
        visible={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChallengeCard } from '@/components/features/feed/ChallengeCard';
import { FeedCard } from '@/components/features/feed/FeedCard';
import { Logo, BellIcon, FireIcon } from '@/components/ui/Icons';
import { extractInsights, type FeedFilters } from '@/features/insights/api/insights-api';
import { useFeedQuery } from '@/features/insights/api/insights-queries';
import {
  countActiveFilters,
  FeedFilterModal,
} from '@/features/insights/components/FeedFilterModal';
import { normalizeInsight } from '@/features/insights/normalize';
import {
  useDailyChallengesStatusQuery,
} from '@/features/daily-challenges/api/daily-challenges-queries';
import {
  extractChallengesStatus,
  getDailyChallengeInsight,
} from '@/features/daily-challenges/api/daily-challenges-api';
import { useUnreadNotificationsCount } from '@/features/notifications/api/notifications-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useUserRole } from '@/stores/auth-store';
import { Share } from 'react-native';
import { MilestoneModal } from '@/components/features/feed/MilestoneModal';

export default function FeedScreen() {
  const router = useRouter();
  const role = useUserRole();
  const isExplorer = role === 'EXPLORER';

  const [filters, setFilters] = useState<FeedFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const feed = useFeedQuery(1, 100, filters);
  const items = useMemo(() => extractInsights(feed.data).map(normalizeInsight), [feed.data]);
  const activeCount = countActiveFilters(filters);
  const unreadCount = useUnreadNotificationsCount();

  const challengesQuery = useDailyChallengesStatusQuery();
  const challengeStatus = useMemo(() => extractChallengesStatus(challengesQuery.data), [challengesQuery.data]);
  const streak = challengeStatus?.streak ?? 0;

  const [lastSeenStreak, setLastSeenStreak] = useState<number | null>(null);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(3);

  useEffect(() => {
    if (streak > 0) {
      if (lastSeenStreak !== null && streak > lastSeenStreak) {
        const milestoneValues = [3, 7, 14, 30];
        if (milestoneValues.includes(streak)) {
          setMilestoneStreak(streak);
          setMilestoneOpen(true);
        }
      }
      setLastSeenStreak(streak);
    }
  }, [streak, lastSeenStreak]);

  const handleChallengePress = async (challenge: import('@/features/daily-challenges/api/daily-challenges-api').DailyChallenge) => {
    if (!challenge) return;

    const isAttest = challenge.type?.toUpperCase().includes('ATTEST') || challenge.type?.toUpperCase().includes('FEEDBACK');

    if (isAttest) {
      router.push({
        pathname: '/(app)/add',
        params: { tab: 'verify', dailyChallengeId: challenge.id },
      });
      return;
    }

    if (challenge.insightId) {
      router.push({
        pathname: '/(app)/insight/[id]',
        params: { id: challenge.insightId, dailyChallengeId: challenge.id },
      });
      return;
    }

    try {
      const res = await getDailyChallengeInsight(challenge.id);
      if (res.success && res.data?.id) {
        router.push({
          pathname: '/(app)/insight/[id]',
          params: { id: res.data.id, dailyChallengeId: challenge.id },
        });
      } else {
        router.push({
          pathname: '/(app)/add',
          params: { tab: 'verify', dailyChallengeId: challenge.id },
        });
      }
    } catch {
      router.push({
        pathname: '/(app)/add',
        params: { tab: 'verify', dailyChallengeId: challenge.id },
      });
    }
  };

  const handleShareStreak = async () => {
    try {
      await Share.share({
        message: `I'm on a ${streak}-day quest streak on Geotela! 🔥 Check out the ground truth map and join me!`,
      });
    } catch {
      // no-op
    }
  };

  const handleRefresh = async () => {
    void feed.refetch();
    void challengesQuery.refetch();
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="px-6 pb-2">
        <View className="flex-row items-center justify-between py-2">
          <Logo />
          <View className="flex-row items-center gap-3">
            {streak !== undefined && (
              <View className="flex-row items-center gap-1 rounded-full bg-[#FFF5F0] border border-[#F8DCCB]/30 px-3.5 py-1">
                <FireIcon size={16} color="#E85A2D" />
                <Text className="text-xs font-bold text-[#E85A2D]">{streak}</Text>
              </View>
            )}
            <Pressable onPress={() => router.push('/notifications')}>
              <BellIcon hasUnread={unreadCount > 0} />
            </Pressable>
          </View>
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
            refreshing={(feed.isFetching || challengesQuery.isFetching) && !feed.isLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {challengeStatus?.streakReset && (
          <View className="mb-6 flex-row items-center gap-4 rounded-[24px] border border-border bg-[#F4F1EA] p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E5E1D8]">
              <FireIcon size={20} color="#9CA3AF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-text">
                Your streak reset
              </Text>
              <Text className="text-xs text-text opacity-70 mt-0.5">
                Your {challengeStatus.previousStreak ?? 0}-day streak ended — finish today's activity to start a new one.
              </Text>
            </View>
          </View>
        )}

        <ChallengeCard
          role={role}
          challengeStatus={challengeStatus}
          onChallengePress={handleChallengePress}
          onShareStreak={handleShareStreak}
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

      <MilestoneModal
        visible={milestoneOpen}
        streak={milestoneStreak}
        onClose={() => setMilestoneOpen(false)}
        onShare={handleShareStreak}
      />
    </View>
  );
}

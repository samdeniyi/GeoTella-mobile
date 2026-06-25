import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/features/feed/FeedCard';
import { Logo, BellIcon } from '@/components/ui/Icons';
import { extractInsights } from '@/features/insights/api/insights-api';
import { useBookmarksQuery } from '@/features/insights/api/insights-queries';
import { useBookmarkOverrides } from '@/features/insights/bookmark-store';
import { normalizeInsight } from '@/features/insights/normalize';
import { useUnreadNotificationsCount } from '@/features/notifications/api/notifications-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { useUserRole } from '@/stores/auth-store';

export default function SavedScreen() {
  const router = useRouter();
  const role = useUserRole();
  const bookmarks = useBookmarksQuery();
  const items = useMemo(
    () => extractInsights(bookmarks.data).map(normalizeInsight),
    [bookmarks.data],
  );
  const unreadCount = useUnreadNotificationsCount();

  // Mirror server truth into the override store so feed/detail cards reflect
  // the saved state immediately when the user lands here from another tab.
  const setOverride = useBookmarkOverrides((s) => s.set);
  useEffect(() => {
    for (const item of items) setOverride(item.id, true);
  }, [items, setOverride]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="px-6 pb-2">
        <View className="flex-row items-center justify-between py-2">
          <Logo />
          <Pressable onPress={() => router.push('/notifications')}>
            <BellIcon hasUnread={unreadCount > 0} />
          </Pressable>
        </View>

        <Text className="mt-8 text-4xl font-bold text-text">Saved Insights</Text>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={bookmarks.isFetching && !bookmarks.isLoading}
            onRefresh={bookmarks.refetch}
          />
        }
      >
        {bookmarks.isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : bookmarks.isError ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              {getErrorMessage(bookmarks.error, 'Could not load saved insights.')}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              Tap the bookmark icon on any insight to save it here.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              role={role}
              bookmarked
              onPress={() =>
                router.push({ pathname: '/(app)/insight/[id]', params: { id: item.id } })
              }
            />
          ))
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

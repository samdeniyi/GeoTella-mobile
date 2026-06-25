import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, CheckIcon } from '@/components/ui/Icons';
import {
  extractNotifications,
  type NotificationItem,
} from '@/features/notifications/api/notifications-api';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/features/notifications/api/notifications-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useUserRole } from '@/stores/auth-store';

const initials = (name?: string) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '?';

const formatTime = (iso?: string): string => {
  if (!iso) return '';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  const diff = Date.now() - ts;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'YESTERDAY';
  if (days < 7) return `${days}D AGO`;
  return new Date(ts).toLocaleDateString().toUpperCase();
};

const getActorBg = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash % 2 === 0 ? 'bg-brand' : 'bg-accent';
};

export default function NotificationsScreen() {
  const router = useRouter();
  const role = useUserRole();
  const isExplorer = role === 'EXPLORER';

  const query = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const all = useMemo(() => extractNotifications(query.data), [query.data]);

  const handlePress = (n: NotificationItem) => {
    if (!n.isRead && !n.read) markRead.mutate(n.id);
    const insightId = n.insight?.id ?? n.insightId;
    if (insightId) {
      router.push({ pathname: '/(app)/insight/[id]', params: { id: String(insightId) } });
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView
        edges={['top']}
        className="flex-row items-center justify-between border-b border-border/50 bg-surface px-6 py-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-xl font-bold text-text">Notifications</Text>
        <Pressable
          onPress={() => markAll.mutate()}
          disabled={markAll.isPending || all.length === 0}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          {markAll.isPending ? (
            <ActivityIndicator size="small" />
          ) : (
            <CheckIcon size={18} color="#0D1B1E" />
          )}
        </Pressable>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={query.refetch}
          />
        }
      >
        {query.isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator color={isExplorer ? '#E85A2D' : '#0E5A3A'} />
          </View>
        ) : query.isError ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              {getErrorMessage(query.error, 'Could not load notifications.')}
            </Text>
          </View>
        ) : all.length === 0 ? (
          <View className="mt-20 items-center px-8">
            <Text className="text-center text-base text-text opacity-60">
              No notifications yet. We'll let you know when something happens.
            </Text>
          </View>
        ) : (
          all.map((n) => renderNotification(n, handlePress, isExplorer))
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

function renderNotification(
  n: NotificationItem,
  onPress: (n: NotificationItem) => void,
  isExplorer: boolean,
) {
  const actorName =
    n.actor?.fullName ?? [n.actor?.firstName, n.actor?.lastName].filter(Boolean).join(' ') ?? '';
  const isNew = !(n.isRead ?? n.read);
  const message = n.message ?? n.body ?? n.title ?? '';
  const location = n.insight?.location ?? n.location;
  const insightTitle = n.insight?.title;
  const time = n.time ?? formatTime(n.createdAt);

  return (
    <Pressable
      key={n.id}
      onPress={() => onPress(n)}
      className={cn(
        'flex-row gap-4 border-b border-border/30 px-6 py-5',
        isNew && (isExplorer ? 'bg-accent/5' : 'bg-brand/5'),
      )}
    >
      {isNew && (
        <View
          className={cn(
            'absolute left-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1.5 rounded-full',
            isExplorer ? 'bg-accent' : 'bg-brand',
          )}
        />
      )}

      <View className="flex-1 flex-row gap-4">
        {n.actor ? (
          <View
            className={cn(
              'h-12 w-12 items-center justify-center rounded-full',
              getActorBg(actorName),
            )}
          >
            <Text className="font-bold text-white">{initials(actorName)}</Text>
          </View>
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-card">
            {n.type === 'INSIGHT_VERIFIED' && (
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#0E5A3A]">
                <CheckIcon size={16} color="white" />
              </View>
            )}
            {n.type === 'VERIFY_REQUEST' && (
              <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-accent/60 bg-[#FFF5F0]">
                <Text className="text-sm font-bold text-accent">!</Text>
              </View>
            )}
            {n.type === 'TRUST_INCREASE' && (
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand/10">
                <Text className="font-extrabold text-brand">G</Text>
              </View>
            )}
            {n.type === 'BADGE_UNLOCKED' && (
              <View className="h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Text className="font-extrabold text-accent">🏅</Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-1 justify-center">
          {message ? (
            <Text className="mb-1 text-sm leading-snug text-text">{message}</Text>
          ) : (
            <Text className="mb-1 text-sm leading-snug text-text">
              {n.type === 'FOLLOW' && actorName ? (
                <>
                  <Text className="font-bold">{actorName}</Text> started following you
                  {location ? (
                    <>
                      {' '}
                      in <Text className="font-bold">{location}</Text>
                    </>
                  ) : null}
                  .
                </>
              ) : n.type === 'INSIGHT_ADDED' && actorName ? (
                <>
                  <Text className="font-bold">{actorName}</Text> added an insight
                  {location ? (
                    <>
                      {' '}
                      for <Text className="font-bold">{location}</Text>
                    </>
                  ) : null}
                  {insightTitle ? <>: "{insightTitle}"</> : null}
                </>
              ) : n.type === 'INSIGHT_VERIFIED' && insightTitle ? (
                <>
                  Your insight <Text className="font-bold">"{insightTitle}"</Text> was verified.
                </>
              ) : (
                <Text className="text-text opacity-60">{n.type ?? 'Notification'}</Text>
              )}
            </Text>
          )}
          {time ? <Text className="text-[10px] font-bold text-text opacity-40">{time}</Text> : null}
        </View>

        <View className="justify-center">
          {n.type === 'FOLLOW' && (
            <Pressable
              className={cn(
                'rounded-xl px-4 py-2 shadow-sm',
                isExplorer ? 'bg-accent' : 'bg-brand',
              )}
            >
              <Text className="text-xs font-bold text-white">Follow back</Text>
            </Pressable>
          )}
          {(n.type === 'INSIGHT_ADDED' || n.type === 'INSIGHT_VERIFIED') && (
            <Pressable
              onPress={() => onPress(n)}
              className="rounded-xl border border-border bg-surface-card px-5 py-2 shadow-sm"
            >
              <Text className="text-xs font-bold text-text">View</Text>
            </Pressable>
          )}
          {n.type === 'VERIFY_REQUEST' && (
            <Pressable
              className={cn(
                'rounded-xl px-5 py-2 shadow-sm',
                isExplorer ? 'bg-accent' : 'bg-brand',
              )}
            >
              <Text className="text-xs font-bold text-white">Verify</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

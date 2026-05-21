import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, ShareIcon } from '@/components/ui/Icons';
import {
  unwrap,
  type AchievementsResponse,
  type BadgesResponse,
} from '@/features/users/api/users-api';
import { useMyAchievementsQuery, useMyBadgesQuery } from '@/features/users/api/users-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';

export default function AchievementsScreen() {
  const router = useRouter();
  const achievementsQuery = useMyAchievementsQuery();
  const badgesQuery = useMyBadgesQuery();

  const achievements = unwrap<AchievementsResponse>(achievementsQuery.data);
  const badgesPayload = unwrap<BadgesResponse>(badgesQuery.data);
  const badges = badgesPayload?.badges ?? [];

  const currentLevel = achievements?.currentLevel;
  const nextLevel = achievements?.nextLevel;
  const progress = achievements?.progress;

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView
        edges={['top']}
        className="flex-row items-center justify-between bg-surface px-6 py-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-xl font-bold text-text">Achievements</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card">
          <ShareIcon size={20} />
        </Pressable>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 py-10">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-[32px] bg-orange-50">
            <Text className="text-4xl">🏅</Text>
          </View>
          <Text className="mb-4 text-3xl font-bold text-text">Achievements</Text>
          <Text className="text-center text-base leading-relaxed text-text opacity-70">
            Unlock badges by contributing ground-truth data and verifying insights in your city.
          </Text>
        </View>

        {achievementsQuery.isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : null}

        {/* Current level + next milestone */}
        {currentLevel ? (
          <View className="mx-6 mb-10 rounded-[40px] border-2 border-accent bg-white p-8 shadow-sm">
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  LEVEL {currentLevel.number} · {currentLevel.name}
                </Text>
                <Text className="text-2xl font-bold text-text">
                  {nextLevel ? `Next: ${nextLevel.name}` : 'Max level reached'}
                </Text>
              </View>
              {progress ? (
                <View className="flex-row items-center gap-2 rounded-2xl bg-orange-100 px-4 py-2">
                  <Text className="text-lg text-accent">🔥</Text>
                  <Text className="text-lg font-bold text-accent">{progress.percent}%</Text>
                </View>
              ) : null}
            </View>
            {progress ? (
              <View className="mb-3 h-3 w-full rounded-full bg-border/20">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${progress.percent}%` }}
                />
              </View>
            ) : null}
            {progress ? (
              <Text className="text-right text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                {progress.current}/{progress.required} {progress.unit}
              </Text>
            ) : null}
          </View>
        ) : null}

        {badgesQuery.isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : badgesQuery.isError ? (
          <View className="mb-10 px-8">
            <Text className="text-center text-sm text-text opacity-60">
              {getErrorMessage(badgesQuery.error, 'Could not load badges.')}
            </Text>
          </View>
        ) : badges.length === 0 ? (
          <View className="mb-10 px-8">
            <Text className="text-center text-sm text-text opacity-60">
              No badges available yet.
            </Text>
          </View>
        ) : (
          <View className="mb-20 flex-row flex-wrap gap-4 px-6">
            {badges.map((badge) => (
              <View
                key={badge.type}
                className={cn(
                  'min-h-[160px] w-[30.5%] items-center justify-between rounded-[32px] border-2 p-4',
                  badge.earned
                    ? 'border-accent bg-orange-50'
                    : 'border-border/50 bg-surface-card opacity-60',
                )}
              >
                {!badge.earned && (
                  <Text className="absolute right-3 top-3 text-sm text-text opacity-40">🔒</Text>
                )}
                <View className="mb-2 h-12 w-12 items-center justify-center">
                  <Text className="text-2xl">{badge.earned ? '🏅' : '🔒'}</Text>
                </View>
                <Text className="text-center text-[10px] font-bold uppercase leading-tight text-text">
                  {badge.name}
                </Text>
                {badge.progress ? (
                  <View className="mt-2 w-full">
                    <View className="h-1 w-full rounded-full bg-border/20">
                      <View
                        className={cn(
                          'h-full rounded-full',
                          badge.earned ? 'bg-accent' : 'bg-text/40',
                        )}
                        style={{ width: `${badge.progress.percent}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-center text-[9px] font-bold text-text opacity-40">
                      {badge.progress.current}/{badge.progress.required}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

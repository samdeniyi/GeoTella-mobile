import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, CheckIcon, ShareIcon } from '@/components/ui/Icons';
import {
  unwrap,
  type AchievementsResponse,
  type BadgesResponse,
} from '@/features/users/api/users-api';
import { useMyAchievementsQuery, useMyBadgesQuery } from '@/features/users/api/users-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';

export default function CertificationsScreen() {
  const router = useRouter();
  const badgesQuery = useMyBadgesQuery();
  const achievementsQuery = useMyAchievementsQuery();

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
        <Text className="text-xl font-bold text-text">Certifications</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card">
          <ShareIcon size={20} />
        </Pressable>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 py-10">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-[32px] border border-brand/10 bg-brand/5">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
              <CheckIcon size={24} color="#0B4A33" />
            </View>
          </View>
          <Text className="mb-4 text-3xl font-bold text-text">Certifications</Text>
          <Text className="text-center text-base leading-relaxed text-text opacity-70">
            Professional status and data accuracy ratings verified by the GeoTela Global Governance
            board.
          </Text>
        </View>

        {/* Audit Progress */}
        {currentLevel ? (
          <View className="mx-6 mb-10 rounded-[40px] border border-border bg-white p-8 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-text">Audit Progress</Text>
              {progress ? (
                <Text className="text-sm font-bold text-brand">{progress.percent}%</Text>
              ) : null}
            </View>
            <Text className="mb-3 text-xs font-medium text-text opacity-40">
              Level {currentLevel.number} · {currentLevel.name}
              {nextLevel ? ` · Next: ${nextLevel.name}` : ''}
            </Text>
            {progress ? (
              <>
                <View className="mb-3 h-2 w-full rounded-full bg-border/20">
                  <View
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${progress.percent}%` }}
                  />
                </View>
                <Text className="text-right text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  {progress.current}/{progress.required} {progress.unit}
                </Text>
              </>
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
              {getErrorMessage(badgesQuery.error, 'Could not load certifications.')}
            </Text>
          </View>
        ) : badges.length === 0 ? (
          <View className="mb-10 px-8">
            <Text className="text-center text-sm text-text opacity-60">
              No certifications available yet.
            </Text>
          </View>
        ) : (
          <View className="mb-20 flex-row flex-wrap gap-4 px-6">
            {badges.map((cert) => (
              <View
                key={cert.type}
                className={cn(
                  'min-h-[200px] w-[47.5%] items-center rounded-[40px] border-2 p-6',
                  cert.earned
                    ? 'border-brand/30 bg-white'
                    : 'border-border/50 bg-surface-card opacity-60',
                )}
              >
                {!cert.earned && (
                  <Text className="absolute right-4 top-4 text-xl text-text opacity-40">🔒</Text>
                )}
                <View
                  className={cn(
                    'mb-4 h-14 w-14 items-center justify-center rounded-2xl',
                    cert.earned ? 'bg-brand/5' : 'bg-border/10',
                  )}
                >
                  <Text className="text-2xl">{cert.earned ? '🏅' : '🔒'}</Text>
                </View>
                <Text className="mb-2 text-xs font-bold uppercase tracking-tight text-brand">
                  {cert.name}
                </Text>
                <Text className="text-center text-[10px] leading-normal text-text opacity-60">
                  {cert.description}
                </Text>
                {cert.progress ? (
                  <View className="mt-3 w-full">
                    <View className="h-1 w-full rounded-full bg-border/20">
                      <View
                        className={cn(
                          'h-full rounded-full',
                          cert.earned ? 'bg-brand' : 'bg-text/40',
                        )}
                        style={{ width: `${cert.progress.percent}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-center text-[9px] font-bold text-text opacity-40">
                      {cert.progress.current}/{cert.progress.required}
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

import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

import { BookmarkIcon, PinIcon } from '@/components/ui/Icons';
import {
  useBookmarkInsightMutation,
  useUnbookmarkInsightMutation,
} from '@/features/insights/api/insights-queries';
import { useBookmarkOverride, useBookmarkOverrides } from '@/features/insights/bookmark-store';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

export type FeedItem = {
  id: string;
  user: {
    name: string;
    avatar: string;
    flag: string;
  };
  time: string;
  percentageChange?: string;
  image: string;
  location: string;
  title: string;
  description: string;
  tags: string[];
  growthScore?: number;
  verified?: boolean;
  source?: string;
};

type FeedCardProps = {
  item: FeedItem;
  role: UserRole | null;
  onPress?: () => void;
  bookmarked?: boolean;
};

export function FeedCard({ item, role, onPress, bookmarked = false }: FeedCardProps) {
  const isExplorer = role === 'EXPLORER';
  const bookmark = useBookmarkInsightMutation();
  const unbookmark = useUnbookmarkInsightMutation();

  // Shared override store keyed by insight id — every FeedCard rendering this
  // insight (feed, saved, detail, contributions) reads the same value, so a
  // toggle on one screen reflects everywhere without waiting for a refetch.
  const override = useBookmarkOverride(item.id);
  const setOverride = useBookmarkOverrides((s) => s.set);
  const isSaved = override ?? bookmarked;

  const toggleSave = () => {
    const next = !isSaved;
    setOverride(item.id, next);
    const mutation = next ? bookmark : unbookmark;
    mutation.mutate(item.id, {
      onError: () => setOverride(item.id, !next),
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-6 overflow-hidden rounded-[32px] border border-border bg-surface-card shadow-sm"
    >
      {/* Card Header */}
      <View className="flex-row items-center justify-between p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-accent">
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

        <View className="flex-row items-center gap-3">
          {item.percentageChange && (
            <View
              className={cn(
                'rounded-full px-3 py-1',
                item.percentageChange.startsWith('+') ? 'bg-accent/10' : 'bg-red-100',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  item.percentageChange.startsWith('+') ? 'text-accent' : 'text-red-600',
                )}
              >
                {item.percentageChange}
              </Text>
            </View>
          )}
          <Pressable onPress={toggleSave} hitSlop={8}>
            <BookmarkIcon focused={isSaved} size={18} />
          </Pressable>
        </View>
      </View>

      {item.image ? (
        <Image
          key={item.image}
          source={{ uri: item.image }}
          style={{ width: '100%', height: 224 }}
          resizeMode="cover"
          accessibilityLabel={item.title}
        />
      ) : null}

      {/* Card Content */}
      <View className="p-6">
        <View className="mb-3 flex-row items-center gap-1.5">
          <PinIcon size={14} color="#6B7280" />
          <Text className="text-sm font-bold text-text opacity-40">{item.location}</Text>
        </View>

        <Text className="mb-3 text-2xl font-bold leading-tight text-text">{item.title}</Text>

        {item.description ? (
          <Text className="mb-6 text-base leading-relaxed text-text opacity-70" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Tags */}
        {item.tags.length > 0 ? (
          <View className="mb-6 flex-row flex-wrap gap-2">
            {item.tags.map((tag, i) => (
              <View key={i} className="rounded-xl border border-border bg-surface px-4 py-2">
                <Text className="text-xs font-bold text-text opacity-70">{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {(item.source || item.verified) && (
          <View className="mb-4 flex-row items-center gap-3">
            <Text className="text-brand">🔗</Text>
            <Text className="text-sm font-bold text-brand">
              {item.source || 'Verified Source'} {item.verified ? '· Verified' : ''}
            </Text>
          </View>
        )}

        {/* Footer info */}
        <View className="flex-row items-center justify-between">
          {isExplorer ? (
            <></>
          ) : typeof item.growthScore === 'number' ? (
            <View className="flex-1">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  Growth Score
                </Text>
                <Text className="text-base font-bold text-brand">{item.growthScore}/100</Text>
              </View>
              <View className="h-1.5 w-full rounded-full bg-border/20">
                <View
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${item.growthScore}%` as any }}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

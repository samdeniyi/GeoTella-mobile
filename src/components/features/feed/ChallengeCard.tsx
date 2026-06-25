import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { ArrowRight, CheckIcon, FireIcon } from '@/components/ui/Icons';
import type { DailyChallenge, DailyChallengeStatusResponse } from '@/features/daily-challenges/api/daily-challenges-api';
import type { UserRole } from '@/types';

type ChallengeCardProps = {
  role: UserRole | null;
  challengeStatus: DailyChallengeStatusResponse | null;
  onChallengePress?: (challenge: DailyChallenge) => void;
  onShareStreak?: () => void;
};

/** Map challenge type → CTA label */
const getCTALabel = (challenge: DailyChallenge, streakBroken: boolean): string => {
  if (streakBroken) return 'START NOW';
  const type = challenge.type?.toUpperCase() ?? '';
  if (type.includes('ATTEST') || type.includes('FEEDBACK')) return 'REVIEW & ATTEST';
  return 'EXPLORE NOW';
};

export function ChallengeCard({ role, challengeStatus, onChallengePress, onShareStreak }: ChallengeCardProps) {
  if (!challengeStatus || challengeStatus.challenges.length === 0) return null;

  const { challenges, completedCount, totalCount, dayComplete, streak, streakReset } = challengeStatus;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.max(0, (completedCount / totalCount) * 100)) : 0;

  // ─── All-done state ───
  if (dayComplete) {
    return (
      <View
        className="relative mb-6 overflow-hidden rounded-[32px] border-2 bg-white p-6"
        style={{ borderColor: '#E85A2D' }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full bg-green-50 px-3 py-1 border border-green-100">
            <Text className="text-[10px] font-bold text-green-700">
              ⚡ Completed
            </Text>
          </View>
          <Text className="text-xs font-bold text-text opacity-40">
            {completedCount}/{totalCount}
          </Text>
        </View>

        <View className="flex-row items-start gap-4 mb-6">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-brand">
            <CheckIcon size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold leading-tight text-text">
              Activity complete!
            </Text>
            <Text className="mt-1 text-sm text-text opacity-70">
              You kept your streak alive — see you tomorrow.
            </Text>
          </View>
        </View>

        {/* Streak details badge */}
        <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-[#FFF5F0] border border-[#F8DCCB]/30 p-4">
          <View className="flex-row items-center gap-2">
            <FireIcon size={18} color="#E85A2D" />
            <Text className="text-sm font-bold text-[#E85A2D]">
              {streak}-day streak
            </Text>
          </View>
          <Text className="text-xs font-bold text-[#E85A2D] opacity-80">
            +1 today
          </Text>
        </View>

        <Pressable
          onPress={onShareStreak}
          className="w-full rounded-2xl bg-brand py-4 items-center justify-center"
        >
          <Text className="text-base font-bold text-white">
            SHARE YOUR STREAK
          </Text>
        </Pressable>
      </View>
    );
  }

  // ─── Active quest state — show one challenge at a time ───
  // Find the first incomplete challenge (the current active one)
  const activeChallenge = challenges.find((c) => !c.completed) ?? challenges[0];
  if (!activeChallenge) return null;

  // Figure out the "next step" text: the challenge AFTER the active one
  const activeIdx = challenges.indexOf(activeChallenge);
  const nextChallenge = activeIdx >= 0 && activeIdx < challenges.length - 1
    ? challenges[activeIdx + 1]
    : null;
  const nextStepText = nextChallenge
    ? (nextChallenge.label || nextChallenge.title || nextChallenge.insightTitle || null)
    : null;

  // Title: use label from the API
  const title = activeChallenge.label || activeChallenge.title || activeChallenge.insightTitle || 'Complete this challenge';
  const ctaText = getCTALabel(activeChallenge, streakReset);

  return (
    <View
      className="relative mb-6 overflow-hidden rounded-[32px] border-2 bg-white p-6"
      style={{ borderColor: '#E85A2D' }}
    >
      {/* Header row */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 rounded-full bg-accent/10 px-3 py-1">
          <Text className="text-[10px] font-bold text-accent">
            ⚡ Daily Quest
          </Text>
        </View>
        <Text className="text-xs font-bold text-text opacity-40">
          {completedCount}/{totalCount}
        </Text>
      </View>

      {/* Challenge title */}
      <Text className="mb-4 text-2xl font-bold leading-tight text-text">
        {title}
      </Text>

      {/* Progress Bar */}
      <View className="mb-4 h-2.5 w-full rounded-full bg-border/20">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${progressPercent}%`, backgroundColor: '#E85A2D' }}
        />
      </View>

      {/* Next Step sub-text */}
      {nextStepText ? (
        <Text className="mb-6 text-xs text-text opacity-50" numberOfLines={1}>
          Next: {nextStepText}
        </Text>
      ) : (
        <View className="mb-2" />
      )}

      {/* CTA Button */}
      <Pressable
        onPress={() => onChallengePress?.(activeChallenge)}
        className="flex-row items-center justify-center gap-2 rounded-2xl py-4 bg-accent active:opacity-90"
      >
        <Text className="text-base font-bold text-white uppercase">
          {ctaText}
        </Text>
        <ArrowRight size={18} color="white" />
      </Pressable>
    </View>
  );
}

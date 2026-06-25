import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

import { FireIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/cn';

export type MilestoneBadgeType = 'SPARK' | 'FLAME' | 'BLAZE' | 'LEGEND';

type MilestoneModalProps = {
  visible: boolean;
  streak: number;
  onClose: () => void;
  onShare?: () => void;
};

type BadgeConfig = {
  name: string;
  title: string;
  badgeLabel: string;
  description: string;
  colorTheme: 'orange' | 'green';
  bgGradientClasses: string;
  badgeContainerBg: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  headerTextColor: string;
};

const badgeConfigs: Record<number, BadgeConfig> = {
  3: {
    name: 'SPARK',
    title: '3-day streak!',
    badgeLabel: 'Spark badge earned',
    description: 'You’re building a habit — three days of fresh insights in a row.',
    colorTheme: 'orange',
    bgGradientClasses: 'bg-gradient-to-br from-[#FFAE68] to-[#FF5E2C]',
    badgeContainerBg: 'bg-[#FAF1E3]',
    badgeTextColor: 'text-[#B06D14]',
    badgeBorderColor: 'border-[#F0D5AE]',
    headerTextColor: 'text-[#C17A19]',
  },
  7: {
    name: 'FLAME',
    title: '7-day streak!',
    badgeLabel: 'Flame badge earned',
    description: 'A full week of staying close to the ground truth. Keep the flame alive.',
    colorTheme: 'green',
    bgGradientClasses: 'bg-gradient-to-br from-[#5DDC9D] to-[#0D7E44]',
    badgeContainerBg: 'bg-[#E3F2EB]',
    badgeTextColor: 'text-[#1D7A4D]',
    badgeBorderColor: 'border-[#ADD9C4]',
    headerTextColor: 'text-[#1D7A4D]',
  },
  14: {
    name: 'BLAZE',
    title: '14-day streak!',
    badgeLabel: 'Blaze badge earned',
    description: 'Two weeks strong — your insights are shaping the map.',
    colorTheme: 'green',
    bgGradientClasses: 'bg-gradient-to-br from-[#5DDC9D] to-[#0D7E44]',
    badgeContainerBg: 'bg-[#E3F2EB]',
    badgeTextColor: 'text-[#1D7A4D]',
    badgeBorderColor: 'border-[#ADD9C4]',
    headerTextColor: 'text-[#1D7A4D]',
  },
  30: {
    name: 'LEGEND',
    title: '30-day streak!',
    badgeLabel: 'Legend badge earned',
    description: 'A full month of ground truth. You’re a GeoTela legend.',
    colorTheme: 'orange',
    bgGradientClasses: 'bg-gradient-to-br from-[#FFAE68] to-[#FF5E2C]',
    badgeContainerBg: 'bg-[#FAF1E3]',
    badgeTextColor: 'text-[#B06D14]',
    badgeBorderColor: 'border-[#F0D5AE]',
    headerTextColor: 'text-[#C17A19]',
  },
};

export function MilestoneModal({ visible, streak, onClose, onShare }: MilestoneModalProps) {
  // Determine which config to use. If streak matches exactly one of the milestones, use it.
  // Otherwise find the closest milestone reached.
  const milestoneValues = [3, 7, 14, 30];
  const matchedValue = milestoneValues.find((v) => v === streak) || 3;
  const config = (badgeConfigs[matchedValue] ?? badgeConfigs[3]) as BadgeConfig;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-[#FAF6EB] p-8">
        {/* Top close button */}
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-6 h-12 w-12 items-center justify-center rounded-full bg-border/20 active:opacity-60"
        >
          <Text className="text-xl font-bold text-text">✕</Text>
        </Pressable>

        <View className="w-full flex-1 justify-center items-center">
          {/* Milestone unlocked label */}
          <Text className={cn('text-xs font-bold uppercase tracking-widest mb-6', config.headerTextColor)}>
            Milestone Unlocked
          </Text>

          {/* Huge circle Badge */}
          <View
            className={cn(
              'h-48 w-48 rounded-full items-center justify-center shadow-lg relative mb-8',
              config.bgGradientClasses
            )}
            style={{
              backgroundColor: config.colorTheme === 'orange' ? '#FF812D' : '#10B981',
              shadowColor: config.colorTheme === 'orange' ? '#FF812D' : '#10B981',
              shadowOpacity: 0.3,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            {/* Soft inner glow */}
            <View className="absolute inset-2 rounded-full border border-white/20" />
            <FireIcon size={28} color="white" />
            <Text className="text-6xl font-extrabold text-white mt-1">
              {matchedValue}
            </Text>
            <Text className="text-[10px] font-bold text-white tracking-widest mt-1">
              DAY STREAK
            </Text>
          </View>

          {/* Streak text */}
          <Text className="text-3xl font-extrabold text-text text-center">
            {config.title}
          </Text>

          {/* Capsule badge earned */}
          <View className={cn(
            'mt-4 px-4 py-1.5 rounded-full border flex-row items-center gap-1.5',
            config.badgeContainerBg,
            config.badgeBorderColor
          )}>
            <Text className={cn('text-xs font-bold', config.badgeTextColor)}>
              🎗 {config.badgeLabel}
            </Text>
          </View>

          {/* Description */}
          <Text className="mt-6 px-4 text-center text-sm leading-relaxed text-text opacity-70">
            {config.description}
          </Text>

          {/* Timeline Pills */}
          <View className="mt-8 flex-row items-center gap-3.5">
            {milestoneValues.map((val) => {
              const isReached = val <= matchedValue;
              const isSelected = matchedValue === val;
              return (
                <View
                  key={val}
                  className={cn(
                    'h-10 w-10 items-center justify-center rounded-full border',
                    isReached
                      ? config.colorTheme === 'orange'
                        ? 'bg-[#FAF1E3] border-[#FF812D]'
                        : 'bg-[#E3F2EB] border-brand'
                      : 'bg-border/10 border-border/20'
                  )}
                  style={isSelected ? {
                    shadowColor: config.colorTheme === 'orange' ? '#FF812D' : '#10B981',
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  } : undefined}
                >
                  <Text className={cn(
                    'text-xs font-bold',
                    isReached
                      ? config.colorTheme === 'orange'
                        ? 'text-[#B06D14]'
                        : 'text-[#1D7A4D]'
                      : 'text-text opacity-25'
                  )}>
                    {val}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-4 mt-auto">
          <Pressable
            onPress={onClose}
            className="w-full h-14 items-center justify-center rounded-2xl bg-brand active:opacity-90"
          >
            <Text className="text-base font-bold text-white">
              Keep it going
            </Text>
          </Pressable>

          <Pressable
            onPress={onShare}
            className="w-full items-center justify-center py-2 active:opacity-60"
          >
            <Text className="text-sm font-bold text-brand">
              Share your streak
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';

import { LockIcon, FireIcon, GiftIcon } from '@/components/ui/Icons';

const CloseIcon = ({ size = 16, color = '#111827' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function WelcomeGiftScreen() {
  const handleStartExploring = () => {
    router.replace('/(app)/(tabs)/map');
  };

  const handleSeeHowTokensWork = () => {
    router.replace('/(app)/(tabs)/map');
    router.push('/wallet/how-tokens-work');
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top right circular close button */}
      <SafeAreaView edges={['top']} className="absolute right-6 top-6 z-10">
        <Pressable
          onPress={handleStartExploring}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-[#FAF9F6] shadow-sm active:opacity-80"
        >
          <CloseIcon size={16} />
        </Pressable>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 pb-12 pt-20">
          {/* Large circular welcome gift token badge */}
          <View className="h-36 w-36 items-center justify-center rounded-full border-[10px] border-[#FAF9F6] bg-[#0E5A3A] shadow-xl shadow-brand/20">
            <Text className="text-5xl font-extrabold text-white">10</Text>
            <Text className="mt-1 text-[10px] font-bold tracking-[2px] text-white/80">TOKENS</Text>
          </View>

          {/* Subtitle */}
          <Text className="mt-8 text-[10px] font-bold uppercase tracking-[3px] text-brand">
            WELCOME GIFT
          </Text>

          {/* Title */}
          <Text
            style={{ fontFamily: 'Georgia' }}
            className="mt-3 text-center text-3xl font-extrabold leading-tight text-text"
          >
            You've got 10 tokens to start
          </Text>

          {/* Description */}
          <Text className="mt-4 px-3 text-center text-sm leading-relaxed text-text opacity-70">
            Spend tokens to unlock full insights and the Growth Hot Zones map. Earn more by
            verifying data and inviting friends.
          </Text>

          {/* Details Card List */}
          <View className="mt-8 w-full overflow-hidden rounded-[32px] border border-[#E6DFB9] bg-[#FAF7E8]">
            {/* Row 1: Unlock a full insight */}
            <View className="py-4.5 flex-row items-center justify-between border-b border-[#E6DFB9]/50 px-6">
              <View className="flex-row items-center gap-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EBF5F0]">
                  <LockIcon color="#0E5A3A" size={14} />
                </View>
                <Text className="text-sm font-bold text-text">Unlock a full insight</Text>
              </View>
              <Text className="text-sm font-bold text-[#0E5A3A]">5 tk</Text>
            </View>

            {/* Row 2: Reveal Growth Hot Zones */}
            <View className="py-4.5 flex-row items-center justify-between border-b border-[#E6DFB9]/50 px-6">
              <View className="flex-row items-center gap-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EBF5F0]">
                  <FireIcon color="#0E5A3A" size={14} />
                </View>
                <Text className="text-sm font-bold text-text">Reveal Growth Hot Zones</Text>
              </View>
              <Text className="text-sm font-bold text-[#0E5A3A]">15 tk</Text>
            </View>

            {/* Row 3: Earn by contributing */}
            <View className="py-4.5 flex-row items-center justify-between px-6">
              <View className="flex-row items-center gap-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EBF5F0]">
                  <GiftIcon color="#0E5A3A" size={14} />
                </View>
                <Text className="text-sm font-bold text-text">Earn by contributing</Text>
              </View>
              <Text className="text-sm font-bold text-[#B85317]">Free</Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View className="w-full gap-5">
            <Pressable
              onPress={handleStartExploring}
              className="mt-8 h-14 w-full items-center justify-center rounded-2xl bg-[#0E5A3A] shadow active:opacity-90"
            >
              <Text className="text-base font-bold text-white">Start exploring</Text>
            </Pressable>

            <Pressable onPress={handleSeeHowTokensWork} className="py-2 active:opacity-70">
              <Text className="text-center text-sm font-extrabold text-[#0E5A3A]">
                See how tokens work
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

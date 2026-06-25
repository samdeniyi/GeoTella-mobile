import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, Pressable, ScrollView, Text, View, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  GiftIcon,
  LinkIcon,
  CopyIcon,
  ShareIcon,
  UsersIcon,
} from '@/components/ui/Icons';
import { useReferralSummaryQuery } from '@/features/wallet/api/wallet-queries';
import { unwrap } from '@/features/wallet/api/wallet-api';

export default function InviteFriendsScreen() {
  const [copied, setCopied] = useState(false);
  const referralQuery = useReferralSummaryQuery();
  const data = unwrap(referralQuery.data);

  const inviteLink = data?.inviteLink ?? '';
  const invitedCount = data?.invitedFriendsCount ?? data?.invitedCount ?? 0;
  const tokensEarned = data?.referralTokensEarned ?? data?.tokensEarned ?? 0;

  const handleCopy = () => {
    if (!inviteLink) return;
    try {
      Clipboard.setString(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied', 'Invite link copied to clipboard!');
    } catch {
      Alert.alert('Copied', 'Invite link copied: ' + inviteLink);
    }
  };

  const handleShare = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Join me on GeoTela! Get 20% bonus tokens on your first purchase using my link: ${inviteLink}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <SafeAreaView edges={['top']} className="flex-row items-center gap-4 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-xl font-extrabold text-text">Invite Friends</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {referralQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center gap-6 p-6">
            {/* Large Gift Icon circle */}
            <View className="mt-4 h-28 w-28 items-center justify-center rounded-full border-4 border-[#FAF9F6] bg-[#FFF5F0] shadow-lg">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
                <GiftIcon color="white" size={32} />
              </View>
            </View>

            {/* Title */}
            <Text
              style={{ fontFamily: 'Georgia' }}
              className="mt-2 text-center text-3xl font-extrabold leading-tight text-text"
            >
              Give 20%, get 20%
            </Text>

            {/* Subtitle */}
            <Text className="px-4 text-center text-sm leading-relaxed text-text opacity-70">
              You and your friend each get a 20% bonus on their first bundle purchase.
            </Text>

            {/* Copy Link field */}
            {inviteLink ? (
              <View className="mt-2 w-full flex-row items-center justify-between rounded-2xl border border-border bg-surface-card px-4 py-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <LinkIcon color="#6B7280" size={18} />
                  <Text className="text-sm font-semibold text-text opacity-80" numberOfLines={1}>
                    {inviteLink}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCopy}
                  className="flex-row items-center gap-1.5 rounded-xl bg-brand px-4 py-2 active:opacity-90"
                >
                  <CopyIcon color="white" size={14} />
                  <Text className="text-xs font-bold text-white">{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Share button */}
            <Pressable
              onPress={handleShare}
              className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
            >
              <ShareIcon color="white" size={18} />
              <Text className="text-base font-bold text-white">Share invite link</Text>
            </Pressable>

            {/* Section: HOW IT WORKS */}
            <View className="mt-4 w-full">
              <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                HOW IT WORKS
              </Text>

              <View className="gap-5">
                {/* Step 1 */}
                <View className="flex-row items-start gap-4">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-[#DCF5EA]">
                    <Text className="text-sm font-extrabold text-brand">1</Text>
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-sm font-bold text-text">Share your invite link</Text>
                  </View>
                </View>

                {/* Step 2 */}
                <View className="flex-row items-start gap-4">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-[#DCF5EA]">
                    <Text className="text-sm font-extrabold text-brand">2</Text>
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-sm font-bold text-text">
                      Your friend buys their first bundle
                    </Text>
                  </View>
                </View>

                {/* Step 3 */}
                <View className="flex-row items-start gap-4">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-[#DCF5EA]">
                    <Text className="text-sm font-extrabold text-brand">3</Text>
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-sm font-bold text-text">
                      You both get +20% bonus tokens
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Footnote card */}
            <View className="mb-10 mt-6 w-full flex-row items-center justify-between rounded-[24px] border border-border bg-surface-card p-5">
              <View className="flex-row items-center gap-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
                  <UsersIcon color="#0E5A3A" size={18} />
                </View>
                <Text className="text-sm font-extrabold text-text">
                  {invitedCount} friend{invitedCount === 1 ? '' : 's'} joined
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-brand">+{tokensEarned} tokens</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

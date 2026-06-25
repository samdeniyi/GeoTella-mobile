import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  TokenWalletIcon,
  EyeIcon,
  FireIcon,
  CheckIcon,
  MailIcon,
  GiftIcon,
  UsersIcon,
  CardIcon,
  ClockIcon,
  CompassIcon,
} from '@/components/ui/Icons';
import { useHowItWorksQuery } from '@/features/wallet/api/wallet-queries';
import { unwrap } from '@/features/wallet/api/wallet-api';

// Icons keyed by backend icon slug — fallback to EyeIcon.
const spendIcons: Record<string, React.ReactNode> = {
  eye: <EyeIcon color="#0E5A3A" size={18} />,
  insight: <EyeIcon color="#0E5A3A" size={18} />,
  fire: <FireIcon color="#E85A2D" size={18} />,
  heatmap: <FireIcon color="#E85A2D" size={18} />,
};
const earnIcons: Record<string, React.ReactNode> = {
  email: <MailIcon color="#0E5A3A" size={18} />,
  founding: <GiftIcon color="#0E5A3A" size={18} />,
  verification: <CheckIcon color="#0E5A3A" size={14} />,
  referral: <UsersIcon color="#0E5A3A" size={18} />,
};
const goodToKnowIcons = [
  <CardIcon color="#6B7280" size={18} key="card" />,
  <ClockIcon color="#6B7280" size={18} key="clock" />,
  <CompassIcon color="#6B7280" size={18} key="compass" />,
];

export default function HowTokensWorkScreen() {
  const howQuery = useHowItWorksQuery();
  const unwrapped = unwrap(howQuery.data);

  const spendOptions = (unwrapped?.spendTokensOn ?? unwrapped?.spendOptions ?? [
    { label: 'Full insight detail', tokenCost: 5, icon: 'eye' },
    { label: 'Growth Hot Zones (heat map)', tokenCost: 15, icon: 'fire' },
  ]).map((opt: any) => ({
    label: opt.label,
    cost: opt.tokenCost !== undefined ? `${opt.tokenCost} tk` : (opt.cost ?? ''),
    icon: opt.icon ?? (opt.key === 'GROWTH_HOT_ZONES' ? 'fire' : 'eye'),
  }));

  const freeFeatures = unwrapped?.alwaysFree ?? unwrapped?.freeFeatures ?? [
    'Map browse, search & card preview',
    '3 full insight views every month',
    'Save, bookmark, filter & sort',
    'Submit, attest & flag data',
    'Connect with a local advisor',
  ];

  const earnOptions = (unwrapped?.earnTokens ?? unwrapped?.earnOptions ?? [
    { label: 'Verify your email', reward: '+10', icon: 'email' },
    { label: 'Founding member (first 30)', reward: '+25', icon: 'founding' },
    { label: 'Verified ground-truth data', reward: '+2 each', icon: 'verification' },
    { label: 'Refer a friend', reward: '+20%', icon: 'referral' },
  ]).map((opt: any) => ({
    label: opt.label,
    reward: opt.reward,
    icon: opt.icon ?? (
      opt.key === 'VERIFY_EMAIL' ? 'email' :
      opt.key === 'FOUNDING_MEMBER' ? 'founding' :
      opt.key === 'VERIFIED_GROUND_TRUTH' ? 'verification' :
      opt.key === 'REFER_FRIEND' ? 'referral' : 'email'
    ),
  }));

  const goodToKnow = unwrapped?.goodToKnow ?? [
    'No subscription — buy token packs anytime',
    'Tokens expire 12 months after purchase (30-day reminder)',
    'The Explorer experience is always free',
  ];

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
        <Text className="text-xl font-extrabold text-text">How Tokens Work</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {howQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-6 p-6">
            <Text className="text-sm leading-relaxed text-text opacity-70">
              Tokens unlock the deeper, paid features. Browsing and contributing stay free — you only
              spend when you want more.
            </Text>

            {/* SPEND TOKENS ON */}
            <View>
              <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                SPEND TOKENS ON
              </Text>
              <View className="overflow-hidden rounded-[32px] border border-border bg-surface-card">
                {spendOptions.map((item: { label: string; cost: string | number; icon?: string }, idx: number) => {
                  const isLast = idx === spendOptions.length - 1;
                  const icon = spendIcons[item.icon ?? ''] ?? <EyeIcon color="#0E5A3A" size={18} />;
                  const isFire = item.icon === 'fire' || item.icon === 'heatmap';
                  return (
                    <View
                      key={idx}
                      className={`flex-row items-center justify-between px-5 py-4 ${
                        !isLast ? 'border-b border-border/30' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-4">
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-full ${
                            isFire ? 'bg-[#FFF5F0]' : 'bg-[#DCF5EA]'
                          }`}
                        >
                          {icon}
                        </View>
                        <Text className="text-sm font-bold text-text">{item.label}</Text>
                      </View>
                      <Text
                        className={`text-sm font-bold ${isFire ? 'text-[#E85A2D]' : 'text-brand'}`}
                      >
                        {typeof item.cost === 'number' ? `${item.cost} tk` : item.cost}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ALWAYS FREE */}
            <View>
              <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                ALWAYS FREE
              </Text>
              <View className="gap-4 rounded-[32px] border border-border bg-surface-card p-5">
                {freeFeatures.map((text: string, idx: number) => (
                  <View key={idx} className="flex-row items-center gap-3">
                    <CheckIcon color="#0E5A3A" size={16} />
                    <Text className="text-sm font-medium text-text">{text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* EARN TOKENS */}
            <View>
              <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                EARN TOKENS
              </Text>
              <View className="overflow-hidden rounded-[32px] border border-border bg-surface-card">
                {earnOptions.map((item: { label: string; reward: string; icon?: string }, idx: number) => {
                  const isLast = idx === earnOptions.length - 1;
                  const icon = earnIcons[item.icon ?? ''] ?? <GiftIcon color="#0E5A3A" size={18} />;
                  return (
                    <View
                      key={idx}
                      className={`flex-row items-center justify-between px-5 py-4 ${
                        !isLast ? 'border-b border-border/30' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
                          {icon}
                        </View>
                        <Text className="text-sm font-bold text-text">{item.label}</Text>
                      </View>
                      <Text className="text-sm font-extrabold text-brand">
                        {typeof item.reward === 'number' ? `+${item.reward}` : item.reward}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* GOOD TO KNOW */}
            <View className="mb-8">
              <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                GOOD TO KNOW
              </Text>
              <View className="overflow-hidden rounded-[32px] border border-border bg-surface-card">
                {goodToKnow.map((text: string, idx: number) => {
                  const isLast = idx === goodToKnow.length - 1;
                  return (
                    <View
                      key={idx}
                      className={`flex-row items-center gap-4 px-5 py-4 ${
                        !isLast ? 'border-b border-border/30' : ''
                      }`}
                    >
                      {goodToKnowIcons[idx] ?? <CardIcon color="#6B7280" size={18} />}
                      <Text className="flex-1 text-sm font-medium leading-normal text-text">
                        {text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Footer sticky action button */}
      <SafeAreaView edges={['bottom']} className="border-t border-border/20 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.push('/wallet/buy')}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
        >
          <TokenWalletIcon color="white" size={18} />
          <Text className="text-base font-bold text-white">Buy tokens</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

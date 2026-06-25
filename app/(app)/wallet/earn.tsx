import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  MailIcon,
  GiftIcon,
  CheckIcon,
  UsersIcon,
  ArrowRight,
} from '@/components/ui/Icons';
import {
  extractEarnOptions,
  type EarnTokenOption,
} from '@/features/wallet/api/wallet-api';
import { useEarnTokenDetailsQuery } from '@/features/wallet/api/wallet-queries';

// Map backend earn-option types to icons. Falls back to GiftIcon.
const earnIconMap: Record<string, React.ReactNode> = {
  email: <MailIcon color="#0E5A3A" size={18} />,
  EMAIL_VERIFICATION: <MailIcon color="#0E5A3A" size={18} />,
  VERIFY_EMAIL: <MailIcon color="#0E5A3A" size={18} />,
  founding: <GiftIcon color="#0E5A3A" size={18} />,
  FOUNDING_MEMBER: <GiftIcon color="#0E5A3A" size={18} />,
  verification: <CheckIcon color="#0E5A3A" size={14} />,
  GROUND_TRUTH: <CheckIcon color="#0E5A3A" size={14} />,
  VERIFY_GROUND_TRUTH: <CheckIcon color="#0E5A3A" size={14} />,
  VERIFY_GROUND_TRUTH_DATA: <CheckIcon color="#0E5A3A" size={14} />,
  referral: <UsersIcon color="#0E5A3A" size={18} />,
  REFERRAL: <UsersIcon color="#0E5A3A" size={18} />,
  INVITE_FRIENDS: <UsersIcon color="#0E5A3A" size={18} />,
};

const getIcon = (option: EarnTokenOption) => {
  const key = option.key ?? option.type ?? option.icon ?? '';
  return earnIconMap[key] ?? <GiftIcon color="#0E5A3A" size={18} />;
};

export default function EarnTokenScreen() {
  const earnQuery = useEarnTokenDetailsQuery();
  const options = useMemo(() => extractEarnOptions(earnQuery.data), [earnQuery.data]);

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
        <Text className="text-xl font-extrabold text-text">Earn Token</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      {earnQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-6 p-6">
            <Text className="text-sm leading-relaxed text-text opacity-70">
              Stockpile tokens by verifying, contributing, and inviting — no purchase needed.
            </Text>

            {/* Cards List */}
            <View className="gap-4">
              {options.map((option, idx) => {
                const isClaimed = option.claimed === true;
                const rewardLabel =
                  typeof option.reward === 'number'
                    ? `+${option.reward}`
                    : option.reward ?? '';

                // Determine action for unclaimed items.
                const isSubmitType =
                  option.key === 'VERIFY_GROUND_TRUTH' ||
                  option.key === 'VERIFY_GROUND_TRUTH_DATA' ||
                  option.type === 'GROUND_TRUTH' ||
                  option.type === 'verification';
                const isReferralType =
                  option.key === 'INVITE_FRIENDS' ||
                  option.type === 'REFERRAL' ||
                  option.type === 'referral';

                const action = option.action;
                const showActionBtn = !isClaimed && (action || isSubmitType || isReferralType);

                return (
                  <View
                    key={option.key ?? option.id ?? idx}
                    className="gap-3 rounded-[32px] border border-border bg-surface-card p-6"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="mr-4 flex-1 flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCF5EA]">
                          {getIcon(option)}
                        </View>
                        <Text className="flex-1 text-base font-extrabold text-text">
                          {option.title ?? option.label ?? option.key ?? 'Earn tokens'}
                        </Text>
                      </View>
                      <View className="rounded-full bg-[#DCF5EA] px-3 py-1">
                        <Text className="text-xs font-extrabold text-brand">{rewardLabel}</Text>
                      </View>
                    </View>

                    <View className="mt-2">
                      {option.description ? (
                        <Text className="text-xs leading-normal text-text opacity-50">
                          {option.description}
                        </Text>
                      ) : null}

                      {isClaimed ? (
                        <View className="mt-3 flex-row items-center gap-2">
                          <CheckIcon color="#0E5A3A" size={14} />
                          <Text className="text-xs font-bold text-brand">Claimed</Text>
                        </View>
                      ) : showActionBtn ? (
                        <Pressable
                          onPress={() => {
                            if (action?.key === 'SUBMIT_DATA' || isSubmitType) {
                              router.push('/add');
                            } else if (action?.key === 'INVITE_FRIENDS' || isReferralType) {
                              router.push('/wallet/invite');
                            }
                          }}
                          className="mt-3 h-10 flex-row items-center justify-center gap-2 self-start rounded-xl bg-brand px-5 active:opacity-90"
                        >
                          <Text className="text-xs font-bold text-white">
                            {action?.label ?? (isSubmitType ? '+ Submit data' : 'Invite friends')}
                          </Text>
                          {(action?.key === 'INVITE_FRIENDS' || isReferralType) && (
                            <ArrowRight color="white" size={12} />
                          )}
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { BackIcon, ExplorerIcon, InvestorIcon, SelectedCheckIcon } from '@/components/ui/Icons';
import { toBackendPersona } from '@/features/auth/api/persona-mapping';
import { useSetPersonaMutation } from '@/features/profile/api/profile-queries';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useSignupStore } from '@/stores/signup-store';
import type { UserRole } from '@/types';

const OPTIONS: { role: UserRole; title: string; subtitle: string }[] = [
  {
    role: 'GROWTH_SEEKER',
    title: 'Growth & Investment Seeker',
    subtitle: 'Find high-growth locations, verified data, and investment intelligence.',
  },
  {
    role: 'EXPLORER',
    title: 'Intelligent Explorer',
    subtitle: 'Discover community-verified stories and contribute what you know.',
  },
];

export default function SelectRole() {
  const router = useRouter();
  const setRole = useSignupStore((s) => s.setRole);
  const setPersonaMutation = useSetPersonaMutation();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected) return;
    setServerError(null);
    try {
      await setPersonaMutation.mutateAsync({ persona: toBackendPersona(selected) });
      setRole(selected);
      useAuthStore.getState().setRole(selected);
      router.push({ pathname: '/(auth)/signup/details', params: { role: selected } });
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not save your selection. Please try again.'));
    }
  };

  return (
    <Screen className="pb-10 pt-6" scroll>
      <Pressable
        onPress={() => router.back()}
        className="mb-10 h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-card"
      >
        <BackIcon size={20} />
      </Pressable>

      <Text className="text-4xl font-bold leading-tight text-text">
        Set up your <Text className="italic text-accent">lens.</Text>
      </Text>
      <Text className="mt-4 text-lg leading-relaxed text-text opacity-70">
        Choose how you'll use GeoTela. We'll tune the map and feed to match.
      </Text>

      <View className="mt-12 gap-6">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.role;
          const Icon = opt.role === 'GROWTH_SEEKER' ? InvestorIcon : ExplorerIcon;
          return (
            <Pressable
              key={opt.role}
              onPress={() => setSelected(opt.role)}
              className={cn(
                'relative overflow-hidden rounded-[32px] border-2 bg-surface-card p-6',
                isActive ? 'border-brand' : 'border-border',
              )}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <View className="mb-4">
                    <Icon />
                  </View>
                  <Text className="text-2xl font-bold text-text">{opt.title}</Text>
                  <Text className="mt-3 text-base leading-relaxed text-text opacity-70">
                    {opt.subtitle}
                  </Text>
                </View>
                {isActive && (
                  <View>
                    <SelectedCheckIcon />
                  </View>
                )}
              </View>

              <View className="absolute -bottom-4 -right-4 opacity-10">
                {opt.role === 'GROWTH_SEEKER' ? (
                  <View className="h-24 w-40 rounded-tl-full border-r-2 border-t-2 border-brand" />
                ) : (
                  <View className="h-24 w-24 rounded-full border-2 border-accent" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-12">
        <Button
          label="Save & Continue"
          onPress={onContinue}
          disabled={!selected}
          loading={setPersonaMutation.isPending}
        />
        <Text className="mt-6 text-center text-sm font-medium text-text opacity-50">
          You can change this anytime in Profile.
        </Text>
      </View>
    </Screen>
  );
}

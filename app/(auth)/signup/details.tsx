import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import {
  APP_FUNCTIONAL_ROLES,
  AREAS_OF_EXPERTISE,
  CONTRIBUTION_TYPES,
  DEAL_SIZES,
  EXPLORATION_REASONS,
  FOCUS_SECTORS,
  toEnum,
  toEnums,
} from '@/features/profile/api/onboarding-enums';
import { useCompleteOnboardingMutation } from '@/features/profile/api/profile-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useSignupStore } from '@/stores/signup-store';
import { getRoleTheme } from '@/theme/role-theme';

const ROLES = [
  'Investor',
  'Fund Manager',
  'VC/PE Analyst',
  'Entrepreneur',
  'Consultant',
  'Researcher',
  'Other',
];
const SECTORS = [
  'Fintech',
  'Real Estate',
  'Tech',
  'Agriculture',
  'Energy',
  'Manufacturing',
  'Healthcare',
  'Trade & Logistics',
];
const TICKET_SIZES = ['<$50K', '$50K-$500K', '$500K-$5M', '$5M+'];

const EXPERTISE = [
  'Culture',
  'Infrastructure',
  'Trade',
  'Climate',
  'Politics',
  'Tech',
  'Housing',
  'Agriculture',
  'Finance',
  'Health',
];
const EXPLORE_REASONS = [
  'Research',
  'Travel blogging',
  'Journalism',
  'Development work',
  'Personal interest',
];
const LANGUAGES = [
  'English',
  'French',
  'Arabic',
  'Swahili',
  'Portuguese',
  'Spanish',
  'Hausa',
  'Other',
];
const CONTRIBUTIONS = [
  'On-ground reports',
  'Market data',
  'Photos / Media',
  'Research notes',
  'News links',
];

export default function SignupDetails() {
  const router = useRouter();
  const { role, patchDetails } = useSignupStore();
  const completeOnboarding = useCompleteOnboardingMutation();
  const theme = getRoleTheme(role);
  const isExplorer = role === 'EXPLORER';

  // Shared state
  const [organisation, setOrganisation] = useState('');
  const [baseCity, setBaseCity] = useState('');

  // Investor specific
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState('');

  // Explorer specific
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedContributions, setSelectedContributions] = useState<string[]>([]);

  const [serverError, setServerError] = useState<string | null>(null);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const submit = async (submitFull: boolean) => {
    setServerError(null);

    // Build the payload — only include fields the user actually selected. Empty
    // arrays/strings are omitted so we don't overwrite later edits with blanks.
    const payload: Parameters<typeof completeOnboarding.mutateAsync>[0] = {};
    if (submitFull) {
      if (selectedRole) {
        const v = toEnum(APP_FUNCTIONAL_ROLES, selectedRole);
        if (v) payload.appFunctionalRole = [v];
      }
      const sectors = toEnums(FOCUS_SECTORS, selectedSectors);
      if (sectors.length) payload.focusSectors = sectors;

      if (selectedTicket) {
        const v = toEnum(DEAL_SIZES, selectedTicket);
        if (v) payload.dealSize = [v];
      }
      if (organisation.trim()) payload.organisation = organisation.trim();
      if (baseCity.trim()) payload.baseCity = baseCity.trim();

      const expertise = toEnums(AREAS_OF_EXPERTISE, selectedExpertise);
      if (expertise.length) payload.areasOfExpertise = expertise;

      const reasons = toEnums(EXPLORATION_REASONS, selectedReasons);
      if (reasons.length) payload.explorationReasons = reasons;

      const contributions = toEnums(CONTRIBUTION_TYPES, selectedContributions);
      if (contributions.length) payload.contributionTypes = contributions;
    }

    try {
      await completeOnboarding.mutateAsync(payload);
      // Keep the local draft in sync for any downstream screens still reading from it.
      patchDetails(payload);
      router.replace('/(auth)/signup/welcome');
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not save your profile. Please try again.'));
    }
  };

  const onFinish = () => submit(true);
  const onSkip = () => submit(false);

  return (
    <Screen scroll keyboardAvoiding className="pb-12 pt-6">
      <BackButton className="mb-8" />

      <View
        className={cn(
          'mb-6 flex-row items-center gap-2 self-start rounded-full px-4 py-2',
          isExplorer ? 'bg-[#FBE2D6]' : 'bg-[#DCF5EA]',
        )}
      >
        {/* <InvestorIcon size={14} color={isExplorer ? '#E85A2D' : '#0B4A33'} /> */}
        <Text className={cn('text-sm font-bold', isExplorer ? 'text-accent' : 'text-brand')}>
          {theme.label}
        </Text>
      </View>

      <Text className="text-4xl font-bold leading-tight text-text">
        Tell us more about{' '}
        <Text className={cn(isExplorer ? 'text-accent' : 'text-brand')}>you.</Text>
      </Text>
      <Text className="mt-4 text-lg leading-relaxed text-text opacity-70">
        {isExplorer
          ? 'Help us match you with the best locations to explore and communities to contribute to.'
          : 'Help us surface the most relevant growth signals and investment opportunities for your focus.'}
      </Text>

      <View className="mt-8 h-[1px] w-full bg-border opacity-50" />

      {!isExplorer ? (
        <>
          <View className="mt-8">
            <Text className="mb-4 text-sm font-bold text-text opacity-80">Your role</Text>
            <View className="flex-row flex-wrap gap-2">
              {ROLES.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={selectedRole === r}
                  onPress={() => setSelectedRole(r)}
                />
              ))}
            </View>
          </View>

          <View className="mt-8">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text">Organisation / Company</Text>
              <Text className="text-xs font-bold text-text opacity-40">optional</Text>
            </View>
            <Input
              placeholder="e.g. Kalahari Ventures"
              value={organisation}
              onChangeText={setOrganisation}
            />
          </View>

          <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">Focus sectors</Text>
              <Text className="text-[10px] font-bold text-text opacity-40">pick any</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {SECTORS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={selectedSectors.includes(s)}
                  onPress={() => toggleItem(selectedSectors, setSelectedSectors, s)}
                />
              ))}
            </View>
          </View>

          <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">
                Typical ticket / deal size
              </Text>
              <Text className="text-xs font-bold text-text opacity-40">optional</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TICKET_SIZES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={selectedTicket === t}
                  onPress={() => setSelectedTicket(t)}
                />
              ))}
            </View>
          </View>
        </>
      ) : (
        <>
          <View className="mt-10">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">Your base city</Text>
              <Text className="text-xs font-bold text-text opacity-40">optional</Text>
            </View>
            <Input
              placeholder="e.g. Lagos, Nairobi, Accra..."
              value={baseCity}
              onChangeText={setBaseCity}
            />
          </View>

          <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">Areas of interest</Text>
              <Text className="text-[10px] font-bold text-text opacity-40">pick any</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {EXPERTISE.map((e) => (
                <Chip
                  key={e}
                  label={e}
                  variant="accent"
                  selected={selectedExpertise.includes(e)}
                  onPress={() => toggleItem(selectedExpertise, setSelectedExpertise, e)}
                />
              ))}
            </View>
          </View>

          <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">Why do you explore?</Text>
              <Text className="text-[10px] font-bold text-text opacity-40">optional</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {EXPLORE_REASONS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  variant="accent"
                  selected={selectedReasons.includes(r)}
                  onPress={() => toggleItem(selectedReasons, setSelectedReasons, r)}
                />
              ))}
            </View>
          </View>

          {/* <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">Languages</Text>
              <Text className="text-[10px] font-bold text-text opacity-40">optional</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <Chip
                  key={l}
                  label={l}
                  variant="accent"
                  selected={selectedLanguages.includes(l)}
                  onPress={() => toggleItem(selectedLanguages, setSelectedLanguages, l)}
                />
              ))}
            </View>
          </View> */}

          <View className="mt-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text opacity-80">
                How will you contribute?
              </Text>
              <Text className="text-[10px] font-bold text-text opacity-40">optional</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {CONTRIBUTIONS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  variant="accent"
                  selected={selectedContributions.includes(c)}
                  onPress={() => toggleItem(selectedContributions, setSelectedContributions, c)}
                />
              ))}
            </View>
          </View>
        </>
      )}

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-12 gap-6">
        <Button
          label="Finish setup"
          onPress={onFinish}
          loading={completeOnboarding.isPending}
          rightIcon={<ArrowRight size={20} />}
        />
        {/* <Pressable onPress={onSkip} disabled={completeOnboarding.isPending}>
          <Text className="text-center text-base font-bold text-text opacity-50">
            Skip for now →
          </Text>
        </Pressable> */}
      </View>
    </Screen>
  );
}

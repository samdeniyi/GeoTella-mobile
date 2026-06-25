import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/ui/Icons';
import { unwrapPrivacyPolicy } from '@/features/settings/api/settings-api';
import { usePrivacyPolicyQuery } from '@/features/settings/api/settings-queries';
import { getErrorMessage } from '@/lib/api/error-message';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const policyQuery = usePrivacyPolicyQuery();
  const policy = unwrapPrivacyPolicy(policyQuery.data);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView
        edges={['top']}
        className="flex-row items-center gap-3 border-b border-border/40 px-6 py-3"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-lg font-bold text-text">Privacy Policy</Text>
      </SafeAreaView>

      {policyQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B4A33" />
        </View>
      ) : policyQuery.isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-text opacity-60">
            {getErrorMessage(policyQuery.error, 'Could not load the policy.')}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator>
          {policy?.title ? (
            <Text className="mb-2 text-2xl font-bold text-text">{policy.title}</Text>
          ) : null}
          {policy?.version || policy?.effectiveDate ? (
            <Text className="mb-6 text-xs text-text opacity-60">
              {[policy?.version ? `Version ${policy.version}` : null, policy?.effectiveDate]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}
          <Text className="text-base leading-relaxed text-text opacity-80">
            {policy?.content ?? ''}
          </Text>
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}

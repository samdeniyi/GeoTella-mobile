import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowRight, BackIcon } from '@/components/ui/Icons';
import {
  unwrapDataPrivacy,
  unwrapPrivacyPolicy,
  unwrapSettings,
  type LocationPrivacyMode,
} from '@/features/settings/api/settings-api';
import {
  useDataPrivacyQuery,
  usePrivacyPolicyQuery,
  useUpdatePrivacyPrefsMutation,
  useUserSettingsQuery,
} from '@/features/settings/api/settings-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';

const LOCATION_MODES: { mode: LocationPrivacyMode; label: string; description: string }[] = [
  { mode: 'PRECISE', label: 'Precise', description: 'Share exact coordinates with verified data.' },
  { mode: 'APPROXIMATE', label: 'Approximate', description: 'Round to neighbourhood-level only.' },
  { mode: 'HIDDEN', label: 'Hidden', description: 'Never share location with the platform.' },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const dataPrivacyQuery = useDataPrivacyQuery();
  const settingsQuery = useUserSettingsQuery();
  const updatePrivacy = useUpdatePrivacyPrefsMutation();

  const dataPrivacy = unwrapDataPrivacy(dataPrivacyQuery.data);
  const settings = unwrapSettings(settingsQuery.data);

  const [modeOpen, setModeOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [optimisticMode, setOptimisticMode] = useState<LocationPrivacyMode | null>(null);

  // Fetch the policy lazily — only when the user opens the modal — so we don't
  // burn a request on every visit to this screen.
  const policyQuery = usePrivacyPolicyQuery(policyOpen);
  const policy = unwrapPrivacyPolicy(policyQuery.data);

  useEffect(() => {
    if (settings?.privacy?.locationPrivacyMode) setOptimisticMode(null);
  }, [settings?.privacy?.locationPrivacyMode]);

  const currentMode: LocationPrivacyMode =
    optimisticMode ??
    settings?.privacy?.locationPrivacyMode ??
    dataPrivacy?.locationPrivacy?.mode ??
    'PRECISE';

  const currentModeLabel = useMemo(
    () =>
      LOCATION_MODES.find((m) => m.mode === currentMode)?.label ??
      dataPrivacy?.locationPrivacy?.label ??
      String(currentMode),
    [currentMode, dataPrivacy?.locationPrivacy?.label],
  );

  const identityLabel = dataPrivacy?.identityVerification?.label ?? '—';
  const sovereignty = dataPrivacy?.dataSovereignty;
  const sovereigntyLabel = sovereignty?.pendingDeletionRequest
    ? 'Deletion pending'
    : sovereignty?.pendingExportRequest
      ? 'Export pending'
      : 'Manage';

  const selectMode = async (mode: LocationPrivacyMode) => {
    setUpdateError(null);
    setOptimisticMode(mode);
    setModeOpen(false);
    try {
      await updatePrivacy.mutateAsync({ locationPrivacyMode: mode });
    } catch (e) {
      setOptimisticMode(null);
      setUpdateError(getErrorMessage(e, 'Could not update location privacy.'));
    }
  };

  const items = [
    {
      label: 'Location Privacy',
      subLabel: 'Control how your precise location is shared.',
      value: currentModeLabel,
      onPress: () => setModeOpen(true),
    },
    {
      label: 'Identity Verification',
      subLabel: 'Manage your biometric and ID data.',
      value: identityLabel,
    },
    {
      label: 'Data Sovereignty',
      subLabel: 'Request a copy or deletion of your data.',
      value: sovereigntyLabel,
    },
    // { label: 'Encryption Keys', subLabel: 'Manage your local SHA-256 keys.', value: 'View' },
  ];

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="flex-row items-center gap-6 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-2xl font-bold text-text">Data & Privacy</Text>
      </SafeAreaView>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center py-10">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <Text className="text-2xl">🔒</Text>
          </View>
          <Text className="mb-4 text-2xl font-bold text-text">Your Data, Your Control</Text>
          <Text className="text-center text-base leading-relaxed text-text opacity-70">
            GeoTela uses end-to-end encryption for all sensitive contributions. We never sell your
            personal data to third parties.
          </Text>
        </View>

        {(dataPrivacyQuery.isLoading || settingsQuery.isLoading) && !dataPrivacy ? (
          <View className="items-center py-6">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : null}

        {updateError ? (
          <Text className="mb-4 text-center text-sm font-medium text-danger">{updateError}</Text>
        ) : null}

        <View className="mb-6">
          {items.map((item, idx) => (
            <Pressable
              key={item.label}
              disabled={!item.onPress}
              onPress={item.onPress}
              className={cn(
                'flex-row items-center justify-between py-6',
                idx !== items.length - 1 && 'border-b border-border/50',
              )}
            >
              <View className="mr-4 flex-1">
                <Text className="text-base font-bold text-text">{item.label}</Text>
                <Text className="mt-0.5 text-xs text-text opacity-40">{item.subLabel}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-brand">{item.value}</Text>
                <ArrowRight size={16} color="#0D1B1E" />
              </View>
            </Pressable>
          ))}
        </View>

        <View className="mb-20 rounded-[32px] border border-orange-100 bg-orange-50 p-8">
          <Text className="mb-4 text-xl font-bold text-text">Privacy Policy</Text>
          <Text className="mb-6 text-base leading-relaxed text-text opacity-70">
            Our mission is to create a transparent but private geo-intelligence network. Learn how
            we handle your data in accordance with global standards.
          </Text>
          <Pressable onPress={() => setPolicyOpen(true)}>
            <Text className="font-bold text-brand">Read Full Policy</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Full privacy policy modal */}
      <Modal
        visible={policyOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPolicyOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          {/* Tap-the-backdrop-to-close — only the area above the sheet. */}
          <Pressable onPress={() => setPolicyOpen(false)} className="flex-1" />
          {/* Fixed-height sheet so the inner ScrollView has a bounded parent
              and actually scrolls. max-height inside a flexed parent doesn't. */}
          <View className="h-[80%] rounded-t-[32px] bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="flex-1 text-2xl font-bold text-text">
                {policy?.title ?? 'Privacy Policy'}
              </Text>
              <Pressable onPress={() => setPolicyOpen(false)} hitSlop={12}>
                <Text className="text-xl text-text opacity-50">✕</Text>
              </Pressable>
            </View>
            {policy ? (
              <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                v{policy.version} · Effective {policy.effectiveDate}
              </Text>
            ) : null}

            {policyQuery.isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#0B4A33" />
              </View>
            ) : policyQuery.isError ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-sm text-text opacity-60">
                  {getErrorMessage(policyQuery.error, 'Could not load the policy.')}
                </Text>
              </View>
            ) : (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <Text className="text-base leading-relaxed text-text opacity-80">
                  {policy?.content ?? ''}
                </Text>
              </ScrollView>
            )}

            <Pressable
              onPress={() => setPolicyOpen(false)}
              className="mt-4 h-14 items-center justify-center rounded-2xl bg-brand"
            >
              <Text className="font-bold text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modeOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModeOpen(false)}
      >
        <Pressable onPress={() => setModeOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable
            onPress={() => {
              /* keep open */
            }}
            className="rounded-t-[32px] bg-white p-6"
          >
            <Text className="mb-6 text-2xl font-bold text-text">Location privacy</Text>
            {LOCATION_MODES.map((m) => (
              <Pressable
                key={m.mode}
                onPress={() => selectMode(m.mode)}
                className={cn(
                  'mb-3 rounded-2xl border p-5',
                  currentMode === m.mode ? 'border-brand bg-emerald-50' : 'border-border bg-white',
                )}
              >
                <Text className="mb-1 text-base font-bold text-text">{m.label}</Text>
                <Text className="text-xs text-text opacity-60">{m.description}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setModeOpen(false)}
              className="mt-4 h-14 items-center justify-center rounded-2xl border border-border bg-white"
            >
              <Text className="font-bold text-text">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

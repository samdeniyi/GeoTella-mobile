import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddHeader, type AddTab, type SubmitStep } from '@/components/features/add/AddHeader';
import { DescribeStep } from '@/components/features/add/steps/DescribeStep';
import { EvidenceStep } from '@/components/features/add/steps/EvidenceStep';
import { LocateStep } from '@/components/features/add/steps/LocateStep';
import { ReviewStep } from '@/components/features/add/steps/ReviewStep';
import { SuccessStep } from '@/components/features/add/steps/SuccessStep';
import { VerifyStep } from '@/components/features/add/steps/VerifyStep';
import {
  extractInsights,
  type InsightPersona,
  type UpdateInsightInput,
} from '@/features/insights/api/insights-api';
import {
  useCreateInsightMutation,
  usePendingVerificationQuery,
  useUpdateInsightMutation,
} from '@/features/insights/api/insights-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { useAddStore } from '@/stores/add-store';
import { useUserRole } from '@/stores/auth-store';

// Backend expects 'EXPLORER' or 'GROWTH_SEEKER' verbatim — same as the role store.
const personaForRole = (role: ReturnType<typeof useUserRole>): InsightPersona =>
  role === 'EXPLORER' ? 'EXPLORER' : 'GROWTH_SEEKER';

export default function AddScreen() {
  const router = useRouter();
  // Optional `?tab=verify` opens the Verify tab directly — used by the daily
  // challenge card on the feed.
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const reset = useAddStore((s) => s.reset);
  const data = useAddStore((s) => s.data);
  const role = useUserRole();
  const create = useCreateInsightMutation();
  const update = useUpdateInsightMutation();
  const pendingQuery = usePendingVerificationQuery();
  const pendingCount = useMemo(
    () => extractInsights(pendingQuery.data).length,
    [pendingQuery.data],
  );

  const [tab, setTab] = useState<AddTab>(tabParam === 'verify' ? 'verify' : 'submit');
  const [step, setStep] = useState<SubmitStep>('locate');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const close = () => {
    reset();
    router.back();
  };

  const handleTabChange = (next: AddTab) => {
    setTab(next);
    if (next === 'submit') setStep('locate');
  };

  const onSubmit = async () => {
    setSubmitError(null);
    if (!data.location) {
      setSubmitError('Pick a location first.');
      setStep('locate');
      return;
    }
    if (!data.headline.trim()) {
      setSubmitError('Add a headline before submitting.');
      setStep('describe');
      return;
    }
    if (!data.categoryId) {
      setSubmitError('Pick a category before submitting.');
      setStep('describe');
      return;
    }
    try {
      if (data.editingId) {
        // Edit flow — PATCH /api/insights/{id}. The endpoint takes JSON only,
        // so we ignore the photo here (re-upload would need a separate route).
        const patch: UpdateInsightInput = {
          title: data.headline.trim(),
          categoryId: data.categoryId,
          growthRating: data.growthSignal,
          body: data.description.trim() || undefined,
          latitude: data.location.coords.lat,
          longitude: data.location.coords.lng,
          persona: personaForRole(role),
          sourceCitations: data.sourceLink?.trim() || undefined,
        };
        await update.mutateAsync({ id: data.editingId, input: patch });
      } else {
        await create.mutateAsync({
          title: data.headline.trim(),
          categoryId: data.categoryId,
          growthRating: data.growthSignal,
          body: data.description.trim() || undefined,
          country: data.location.country,
          // Backend currently rejects unknown regions (e.g. "Lagos" — that's a
          // city/state, not a region). Leave it empty until the backend either
          // accepts free-text regions or we have a regions lookup.
          region: undefined,
          location: data.location.city ?? data.location.address,
          latitude: data.location.coords.lat,
          longitude: data.location.coords.lng,
          persona: personaForRole(role),
          sourceCitations: data.sourceLink?.trim() || undefined,
          notesForVerifiers: data.verifierNotes?.trim() || undefined,
          file: data.photo,
        });
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(getErrorMessage(e, 'Could not submit. Please try again.'));
    }
  };

  const goToContributions = () => {
    reset();
    setSubmitted(false);
    router.replace('/contributions');
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1">
          <SuccessStep
            onDone={() => {
              setSubmitted(false);
              close();
            }}
            onViewContributions={goToContributions}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']}>
        <AddHeader
          step={step}
          tab={tab}
          onTabChange={handleTabChange}
          onClose={close}
          pendingCount={pendingCount}
        />
      </SafeAreaView>

      {tab === 'verify' ? (
        <VerifyStep />
      ) : step === 'locate' ? (
        <LocateStep onNext={() => setStep('describe')} onCancel={close} />
      ) : step === 'describe' ? (
        <DescribeStep onNext={() => setStep('evidence')} onCancel={close} />
      ) : step === 'evidence' ? (
        <EvidenceStep onNext={() => setStep('review')} onCancel={close} />
      ) : (
        <ReviewStep
          onSubmit={onSubmit}
          onEdit={() => setStep('locate')}
          submitting={create.isPending || update.isPending}
          error={submitError}
          submitLabel={data.editingId ? 'Save changes' : 'Submit for verification'}
        />
      )}
    </View>
  );
}

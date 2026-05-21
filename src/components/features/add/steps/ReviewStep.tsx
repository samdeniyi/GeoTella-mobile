import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ArrowRight, CheckIcon } from '@/components/ui/Icons';
import { useAddStore } from '@/stores/add-store';

type Props = {
  onSubmit: () => void;
  onEdit: () => void;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
};

export function ReviewStep({
  onSubmit,
  onEdit,
  submitting = false,
  error,
  submitLabel = 'Submit for verification',
}: Props) {
  const { data } = useAddStore();

  const details = [
    { label: 'Location', value: data.location?.name ?? '—' },
    {
      label: 'Coordinates',
      value: data.location
        ? `${data.location.coords.lat.toFixed(5)}, ${data.location.coords.lng.toFixed(5)}`
        : '—',
    },
    { label: 'Category', value: data.categoryName ?? '—' },
    { label: 'Growth Signal', value: data.growthSignal },
    { label: 'Headline', value: data.headline || '—' },
    { label: 'Description', value: data.description || '—' },
    { label: 'Source link', value: data.sourceLink || '—' },
    { label: 'Photo attached', value: data.photo ? 'Yes' : 'No' },
  ];

  return (
    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
      <View className="mb-6 flex-row items-center gap-3">
        <Text className="text-brand">📄</Text>
        <Text className="text-lg font-bold text-text">Review before submitting</Text>
      </View>

      <View className="mb-8 rounded-[32px] border border-border bg-white p-8">
        {details.map((item, i) => (
          <View
            key={item.label}
            className={i !== details.length - 1 ? 'mb-6 border-b border-border/50 pb-6' : ''}
          >
            <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              {item.label}
            </Text>
            <Text className="text-base font-bold text-text">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="mb-10 flex-row items-center gap-4 rounded-[24px] border border-border bg-white p-6">
        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-green-100 bg-green-50">
          <View className="h-6 w-6 items-center justify-center rounded-lg border border-green-700">
            <CheckIcon size={14} color="#0B4A33" />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-text">3 independent verifications required</Text>
          <Text className="text-xs text-text opacity-40">
            Nearby Intelligent Explorers will review your insight before it goes live.
          </Text>
        </View>
      </View>

      {error ? (
        <Text className="mb-4 text-center text-sm font-medium text-danger">{error}</Text>
      ) : null}

      <View className="mb-10 gap-4">
        <Pressable
          onPress={onSubmit}
          disabled={submitting}
          className="h-16 flex-row items-center justify-center gap-2 rounded-[24px] bg-brand"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-base font-bold text-white">{submitLabel}</Text>
              <ArrowRight size={18} color="white" />
            </>
          )}
        </Pressable>
        <Pressable
          onPress={onEdit}
          disabled={submitting}
          className="h-16 items-center justify-center rounded-[24px] border border-border bg-surface-card"
        >
          <Text className="text-base font-bold text-text">Edit</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

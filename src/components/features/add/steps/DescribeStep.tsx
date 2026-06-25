import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { ArrowRight } from '@/components/ui/Icons';
import type { GrowthRating } from '@/features/insights/api/insights-api';
import { extractCategories } from '@/features/lookups/api/lookups-api';
import { useInsightCategoriesQuery } from '@/features/lookups/api/lookups-queries';
import { cn } from '@/lib/cn';
import { useAddStore } from '@/stores/add-store';

cssInterop(LinearGradient, { className: 'style' });

type Props = {
  onNext: () => void;
  onCancel: () => void;
};

const SIGNALS: { key: GrowthRating; label: string }[] = [
  { key: 'COOLING', label: 'Cooling' },
  { key: 'STEADY', label: 'Steady' },
  { key: 'WARMING', label: 'Warming' },
  { key: 'HOT', label: 'Hot' },
];

const SIGNAL_KEYS: GrowthRating[] = SIGNALS.map((s) => s.key);

const THUMB_SIZE = 32;
const TRACK_HEIGHT = 32;
// Vertical padding around the track to give the user a fatter hit area.
const TRACK_HIT_VPAD = 16;

export function DescribeStep({ onNext, onCancel }: Props) {
  const { data, setData } = useAddStore();
  const categoriesQuery = useInsightCategoriesQuery();
  const categories = useMemo(() => extractCategories(categoriesQuery.data), [categoriesQuery.data]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const currentIndex = Math.max(0, SIGNAL_KEYS.indexOf(data.growthSignal));

  // Map an x within the track to the nearest signal index, then commit.
  const commitFromX = (x: number) => {
    if (trackWidth <= 0) return;
    const step = trackWidth / (SIGNALS.length - 1);
    const clampedX = Math.max(0, Math.min(trackWidth, x));
    const idx = Math.round(clampedX / step);
    const signal = SIGNAL_KEYS[idx];
    if (signal && signal !== data.growthSignal) setData({ growthSignal: signal });
  };

  // React Native's responder system handles drag better than gesture-handler
  // inside a ScrollView — onMoveShouldSetResponder claims the gesture only
  // when the user actually drags, so vertical scrolls still work.
  const trackResponderHandlers = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: (e: GestureResponderEvent) => commitFromX(e.nativeEvent.locationX),
    onResponderMove: (e: GestureResponderEvent) => commitFromX(e.nativeEvent.locationX),
    onResponderRelease: (e: GestureResponderEvent) => commitFromX(e.nativeEvent.locationX),
    onResponderTerminationRequest: () => false,
  };

  const thumbLeft =
    trackWidth > 0
      ? (currentIndex / (SIGNALS.length - 1)) * trackWidth - THUMB_SIZE / 2
      : -THUMB_SIZE / 2;

  const canContinue = Boolean(data.headline && data.categoryId && data.description?.trim());

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
    <ScrollView
      className="flex-1 px-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Location Breadcrumb */}
      <View className="mb-8 flex-row items-center gap-3 rounded-2xl border border-[#DCF5EA] bg-[#F1F8F5] p-4">
        <Text className="text-brand">⊙</Text>
        <Text className="flex-1 font-bold text-brand" numberOfLines={1}>
          {data.location?.name ?? 'Pick a location first'}
        </Text>
      </View>

      {/* Category Selection */}
      <View className="mb-8">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Category
        </Text>
        <Pressable
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center justify-between rounded-2xl border border-[#DCD9CE] bg-[#F2EAD133] p-5"
        >
          <Text className={cn(data.categoryName ? 'text-text' : 'text-text opacity-40')}>
            {data.categoryName ?? 'Select Category'}
          </Text>
          <Text className="text-text opacity-40">▼</Text>
        </Pressable>
      </View>

      {/* Growth Signal */}
      <View className="mb-10">
        <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Growth Signal
        </Text>

        <View
          // Tall hit area + responder handlers means the user can drag
          // anywhere along the gradient and the thumb follows.
          style={{ paddingVertical: TRACK_HIT_VPAD }}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...trackResponderHandlers}
        >
          <LinearGradient
            colors={['#8EA0AC', '#006837', '#7C7D32', '#E85A2D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: TRACK_HEIGHT, width: '100%', borderRadius: 16 }}
            pointerEvents="none"
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: TRACK_HIT_VPAD + (TRACK_HEIGHT - THUMB_SIZE) / 2,
              left: thumbLeft,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F2EAD1',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <View className="h-6 w-6 rounded-full border-2 border-white/30 bg-[#F2EAD1]" />
          </View>
        </View>

        <View className="mt-2 flex-row justify-between px-1">
          {SIGNALS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setData({ growthSignal: s.key })}
              className="items-center"
            >
              <Text
                className={cn(
                  'text-[10px] font-extrabold uppercase tracking-widest',
                  data.growthSignal === s.key ? 'text-accent' : 'text-text opacity-40',
                )}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Headline */}
      <View className="mb-8">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Insight Headline
        </Text>
        <TextInput
          className="rounded-2xl border border-border bg-white p-5 text-text"
          placeholder="e.g., Yaba tech corridor 12 fintech offices"
          placeholderTextColor="#9CA3AF"
          value={data.headline}
          onChangeText={(t) => setData({ headline: t })}
        />
      </View>

      {/* Description */}
      <View className="mb-10">
        <View className="mb-3 flex-row justify-between">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
            Data Point Description
          </Text>
          <Text className="text-[10px] font-bold uppercase text-brand">
            {Math.max(0, 500 - (data.description?.length ?? 0))} left
          </Text>
        </View>
        <TextInput
          className="h-40 rounded-2xl border border-border bg-white p-5 text-text"
          placeholder="Describe your data point in detail (max 500 characters)..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          textAlignVertical="top"
          value={data.description}
          onChangeText={(t) => setData({ description: t })}
        />
      </View>

      <View className="mb-10 gap-4">
        <Pressable
          onPress={canContinue ? onNext : undefined}
          disabled={!canContinue}
          className={`h-16 flex-row items-center justify-center gap-2 rounded-[24px] ${
            canContinue ? 'bg-brand' : 'bg-brand/40'
          }`}
        >
          <Text className="text-base font-bold text-white">Next: Evidence</Text>
          <ArrowRight size={18} color="white" />
        </Pressable>
        <Pressable
          onPress={onCancel}
          className="h-16 items-center justify-center rounded-[24px] border border-border bg-surface-card"
        >
          <Text className="text-base font-bold text-text">Cancel</Text>
        </Pressable>
      </View>

      {/* Category picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable onPress={() => setPickerOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable
            onPress={() => {
              /* keep open */
            }}
            className="max-h-[70%] rounded-t-[32px] bg-white p-6"
          >
            <Text className="mb-4 text-2xl font-bold text-text">Pick a category</Text>
            {categoriesQuery.isLoading ? (
              <ActivityIndicator color="#0B4A33" />
            ) : categories.length === 0 ? (
              <Text className="text-sm text-text opacity-60">No categories available.</Text>
            ) : (
              <ScrollView>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setData({ categoryId: c.id, categoryName: c.name });
                      setPickerOpen(false);
                    }}
                    className="border-b border-border/30 py-4"
                  >
                    <Text
                      className={cn(
                        'text-base font-bold',
                        data.categoryId === c.id ? 'text-brand' : 'text-text',
                      )}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

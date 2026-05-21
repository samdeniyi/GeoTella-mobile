import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import type { FeedFilters, GrowthRating } from '@/features/insights/api/insights-api';
import { extractCategories } from '@/features/lookups/api/lookups-api';
import { useInsightCategoriesQuery } from '@/features/lookups/api/lookups-queries';
import { cn } from '@/lib/cn';

const GROWTH_RATINGS: GrowthRating[] = ['COOLING', 'STEADY', 'WARMING', 'HOT'];

type Props = {
  visible: boolean;
  initial: FeedFilters;
  onClose: () => void;
  onApply: (next: FeedFilters) => void;
};

export function FeedFilterModal({ visible, initial, onClose, onApply }: Props) {
  const categoriesQuery = useInsightCategoriesQuery();
  const categories = extractCategories(categoriesQuery.data);

  const [categoryId, setCategoryId] = useState<string | undefined>(initial.categoryId);
  const [growths, setGrowths] = useState<GrowthRating[]>(initial.growthRating ?? []);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(Boolean(initial.verified));
  const [nearMe, setNearMe] = useState<boolean>(
    typeof initial.latitude === 'number' && typeof initial.longitude === 'number',
  );
  const [locating, setLocating] = useState(false);

  // Re-seed from incoming props each time the modal opens so the user sees the
  // currently-applied filters, not last session's draft.
  useEffect(() => {
    if (!visible) return;
    setCategoryId(initial.categoryId);
    setGrowths(initial.growthRating ?? []);
    setVerifiedOnly(Boolean(initial.verified));
    setNearMe(typeof initial.latitude === 'number' && typeof initial.longitude === 'number');
  }, [visible, initial]);

  const toggleGrowth = (g: GrowthRating) => {
    setGrowths((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const apply = async () => {
    const next: FeedFilters = {
      categoryId,
      growthRating: growths.length > 0 ? growths : undefined,
      verified: verifiedOnly || undefined,
    };
    if (nearMe) {
      setLocating(true);
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.granted) {
          const pos = await Location.getCurrentPositionAsync({});
          next.latitude = pos.coords.latitude;
          next.longitude = pos.coords.longitude;
        }
      } catch {
        // Best effort — if location fails we just drop the near-me coords.
      } finally {
        setLocating(false);
      }
    }
    onApply(next);
    onClose();
  };

  const clearAll = () => {
    setCategoryId(undefined);
    setGrowths([]);
    setVerifiedOnly(false);
    setNearMe(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable onPress={onClose} className="flex-1" />
        <View className="h-[80%] rounded-t-[32px] bg-white p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-text">Filter insights</Text>
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text className="text-xs font-bold text-brand">Clear all</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              Category
            </Text>
            {categoriesQuery.isLoading ? (
              <ActivityIndicator color="#0B4A33" />
            ) : (
              <View className="mb-6 flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => setCategoryId(undefined)}
                  className={cn(
                    'rounded-full border px-4 py-2',
                    !categoryId ? 'border-brand bg-brand' : 'border-border bg-white',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      !categoryId ? 'text-white' : 'text-text opacity-70',
                    )}
                  >
                    Any
                  </Text>
                </Pressable>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    className={cn(
                      'rounded-full border px-4 py-2',
                      categoryId === c.id ? 'border-brand bg-brand' : 'border-border bg-white',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        categoryId === c.id ? 'text-white' : 'text-text opacity-70',
                      )}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              Growth signal (any of)
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {GROWTH_RATINGS.map((g) => {
                const active = growths.includes(g);
                return (
                  <Pressable
                    key={g}
                    onPress={() => toggleGrowth(g)}
                    className={cn(
                      'rounded-full border px-4 py-2',
                      active ? 'border-accent bg-accent' : 'border-border bg-white',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold uppercase',
                        active ? 'text-white' : 'text-text opacity-70',
                      )}
                    >
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mb-2 flex-row items-center justify-between rounded-2xl border border-border bg-white p-4">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-text">Verified only</Text>
                <Text className="mt-1 text-xs text-text opacity-50">
                  Insights with 3+ community attestations.
                </Text>
              </View>
              <Switch
                value={verifiedOnly}
                onValueChange={setVerifiedOnly}
                trackColor={{ false: '#E5E7EB', true: '#0B4A33' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="mb-8 flex-row items-center justify-between rounded-2xl border border-border bg-white p-4">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-text">Near me</Text>
                <Text className="mt-1 text-xs text-text opacity-50">
                  Use your current location to rank by distance.
                </Text>
              </View>
              <Switch
                value={nearMe}
                onValueChange={setNearMe}
                trackColor={{ false: '#E5E7EB', true: '#0B4A33' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          <View className="mt-4 gap-3">
            <Pressable
              onPress={apply}
              disabled={locating}
              className="h-14 items-center justify-center rounded-2xl bg-brand"
            >
              {locating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-white">Apply filters</Text>
              )}
            </Pressable>
            <Pressable
              onPress={onClose}
              className="h-14 items-center justify-center rounded-2xl border border-border bg-white"
            >
              <Text className="font-bold text-text">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Small helpers for rendering an "active filter count" pill above the list.
export const countActiveFilters = (f: FeedFilters): number => {
  let n = 0;
  if (f.categoryId) n += 1;
  if (f.growthRating && f.growthRating.length) n += 1;
  if (f.verified) n += 1;
  if (typeof f.latitude === 'number' && typeof f.longitude === 'number') n += 1;
  return n;
};

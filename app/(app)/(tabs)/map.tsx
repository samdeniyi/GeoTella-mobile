import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo, BellIcon, PinIcon, ArrowRight } from '@/components/ui/Icons';
import {
  extractInsights,
  type FeedFilters,
  type Insight,
} from '@/features/insights/api/insights-api';
import { useFeedQuery } from '@/features/insights/api/insights-queries';
import {
  countActiveFilters,
  FeedFilterModal,
} from '@/features/insights/components/FeedFilterModal';
import { reverseGeocode } from '@/features/maps/geocode';
import { PlaceSearch } from '@/features/maps/PlaceSearch';
import { cn } from '@/lib/cn';
import { useAddStore } from '@/stores/add-store';

const INITIAL_REGION: Region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

type TappedPoint = {
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
  region?: string;
  city?: string;
};

export default function MapScreen() {
  const router = useRouter();
  // Deep-link params from the insight detail "View on Map" button.
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    focusId?: string;
  }>();
  const focusLat = params.lat ? Number(params.lat) : NaN;
  const focusLng = params.lng ? Number(params.lng) : NaN;
  const hasFocus = Number.isFinite(focusLat) && Number.isFinite(focusLng);
  const focusId = params.focusId;

  const mapRef = useRef<MapView | null>(null);
  const setAddData = useAddStore((s) => s.setData);
  const resetAdd = useAddStore((s) => s.reset);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [tappedPoint, setTappedPoint] = useState<TappedPoint | null>(null);

  const [filters, setFilters] = useState<FeedFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const feed = useFeedQuery(1, 100, filters);
  const insights = useMemo(() => extractInsights(feed.data), [feed.data]);
  const insightsWithCoords = useMemo(
    () =>
      insights.filter(
        (i) =>
          typeof i.latitude === 'number' &&
          typeof i.longitude === 'number' &&
          Number.isFinite(i.latitude) &&
          Number.isFinite(i.longitude),
      ),
    [insights],
  );

  // When deep-linked with coords, focus there. Otherwise fit to all pins.
  useEffect(() => {
    if (!mapRef.current) return;
    if (hasFocus) {
      mapRef.current.animateToRegion(
        {
          latitude: focusLat,
          longitude: focusLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        600,
      );
      return;
    }
    if (insightsWithCoords.length === 0) return;
    const coords = insightsWithCoords.map((i) => ({
      latitude: i.latitude as number,
      longitude: i.longitude as number,
    }));
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 200, right: 60, bottom: 200, left: 60 },
      animated: true,
    });
  }, [insightsWithCoords, hasFocus, focusLat, focusLng]);

  // Pop the insight modal automatically when the focused pin's data has loaded.
  useEffect(() => {
    if (!focusId) return;
    const match = insights.find((i) => i.id === focusId);
    if (match) setSelectedInsight(match);
  }, [focusId, insights]);

  // Tapping a marker on iOS also fires the MapView's onPress with
  // `nativeEvent.action === 'marker-press'`. Ignore that here so we don't
  // immediately overwrite the selectedInsight modal with a tappedPoint one.
  const handleMapPress = async (e: MapPressEvent) => {
    const ne = e.nativeEvent as MapPressEvent['nativeEvent'] & { action?: string };
    if (ne.action === 'marker-press') return;
    const { latitude, longitude } = ne.coordinate;
    setSelectedInsight(null);
    setTappedPoint({ latitude, longitude });
    const r = await reverseGeocode({ latitude, longitude });
    setTappedPoint({
      latitude,
      longitude,
      address: r?.formattedAddress,
      country: r?.country,
      region: r?.region,
      city: r?.city,
    });
  };

  const openInsightModal = (i: Insight) => {
    setTappedPoint(null);
    setSelectedInsight(i);
  };

  const goContribute = (point: TappedPoint) => {
    resetAdd();
    setAddData({
      location: {
        name: point.address ?? `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`,
        address: point.address,
        coords: { lat: point.latitude, lng: point.longitude },
        country: point.country,
        region: point.region,
        city: point.city,
      },
    });
    setTappedPoint(null);
    router.push('/(app)/add');
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="z-10 px-6 pb-2">
        <View className="flex-row items-center justify-between py-2">
          <Logo />
          <Pressable onPress={() => router.push('/notifications')}>
            <BellIcon />
          </Pressable>
        </View>

        <View className="mt-4">
          <PlaceSearch
            placeholder="Search country, city, or region..."
            onPick={(p) => {
              mapRef.current?.animateToRegion(
                {
                  latitude: p.coords.latitude,
                  longitude: p.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                500,
              );
              setTappedPoint({
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
                address: p.formattedAddress,
                country: p.country,
                region: p.region,
                city: p.city,
              });
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-6 mb-2 mt-6 px-6"
          contentContainerStyle={{ gap: 12 }}
        >
          <Pressable
            onPress={() => setFilterOpen(true)}
            className={cn(
              'flex-row items-center gap-2 rounded-full border px-5 py-2',
              activeCount > 0 ? 'border-brand bg-brand' : 'border-border bg-surface-card',
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                activeCount > 0 ? 'text-white' : 'text-text opacity-70',
              )}
            >
              Filter{activeCount > 0 ? ` · ${activeCount}` : ''}
            </Text>
          </Pressable>
          {filters.categoryId ? (
            <Pressable
              onPress={() => setFilters({ ...filters, categoryId: undefined })}
              className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2"
            >
              <Text className="text-xs font-bold text-text opacity-70">Category ✕</Text>
            </Pressable>
          ) : null}
          {filters.growthRating?.length ? (
            <Pressable
              onPress={() => setFilters({ ...filters, growthRating: undefined })}
              className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2"
            >
              <Text className="text-xs font-bold text-text opacity-70">
                {filters.growthRating.join(', ')} ✕
              </Text>
            </Pressable>
          ) : null}
          {filters.verified ? (
            <Pressable
              onPress={() => setFilters({ ...filters, verified: undefined })}
              className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2"
            >
              <Text className="text-xs font-bold text-text opacity-70">Verified ✕</Text>
            </Pressable>
          ) : null}
          {typeof filters.latitude === 'number' ? (
            <Pressable
              onPress={() => setFilters({ ...filters, latitude: undefined, longitude: undefined })}
              className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2"
            >
              <Text className="text-xs font-bold text-text opacity-70">Near me ✕</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={INITIAL_REGION}
          onPress={handleMapPress}
          showsUserLocation
        >
          {insightsWithCoords.map((i) => (
            <Marker
              key={i.id}
              coordinate={{ latitude: i.latitude as number, longitude: i.longitude as number }}
              onPress={(e) => {
                // Stop propagation so the MapView's onPress doesn't fire and
                // wipe the selected insight before we set it.
                e.stopPropagation?.();
                openInsightModal(i);
              }}
              pinColor="#0B4A33"
            />
          ))}
        </MapView>

        {feed.isLoading ? (
          <View className="absolute left-0 right-0 top-4 items-center">
            <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2 shadow">
              <ActivityIndicator size="small" color="#0B4A33" />
              <Text className="text-xs font-bold text-text">Loading insights…</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Pin tapped — preview + open insight detail */}
      <Modal
        visible={!!selectedInsight}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInsight(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable onPress={() => setSelectedInsight(null)} className="flex-1" />
          <View className="rounded-t-[32px] bg-white p-6">
            {selectedInsight ? (
              <>
                <View className="mb-3 flex-row items-center gap-2">
                  <PinIcon size={14} color="#6B7280" />
                  <Text className="text-xs font-bold text-text opacity-60" numberOfLines={1}>
                    {selectedInsight.locationDisplay ||
                      [
                        selectedInsight.locationLabel,
                        selectedInsight.regionName,
                        selectedInsight.countryName,
                      ]
                        .filter(Boolean)
                        .join(' · ') ||
                      'Pinned insight'}
                  </Text>
                </View>
                <Text className="mb-2 text-2xl font-bold text-text" numberOfLines={2}>
                  {selectedInsight.title ?? 'Untitled insight'}
                </Text>
                {selectedInsight.body ? (
                  <Text
                    className="mb-6 text-sm leading-relaxed text-text opacity-70"
                    numberOfLines={3}
                  >
                    {selectedInsight.body}
                  </Text>
                ) : (
                  <View className="mb-6" />
                )}

                <View className="gap-3">
                  <Pressable
                    onPress={() => {
                      const id = selectedInsight.id;
                      setSelectedInsight(null);
                      router.push({ pathname: '/(app)/insight/[id]', params: { id } });
                    }}
                    className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand"
                  >
                    <Text className="font-bold text-white">View insight</Text>
                    <ArrowRight size={16} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedInsight(null)}
                    className="h-14 items-center justify-center rounded-2xl border border-border bg-white"
                  >
                    <Text className="font-bold text-text">Close</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Map tapped on empty area — offer to contribute here */}
      <Modal
        visible={!!tappedPoint}
        transparent
        animationType="slide"
        onRequestClose={() => setTappedPoint(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable onPress={() => setTappedPoint(null)} className="flex-1" />
          <View className="rounded-t-[32px] bg-white p-6">
            {tappedPoint ? (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Contribute here?</Text>
                <View className="mb-1 flex-row items-center gap-2">
                  <PinIcon size={14} color="#6B7280" />
                  <Text className="text-xs font-bold text-text opacity-60" numberOfLines={2}>
                    {tappedPoint.address ?? 'Resolving address…'}
                  </Text>
                </View>
                <Text className="mb-6 text-xs font-bold uppercase text-brand">
                  {tappedPoint.latitude.toFixed(5)}, {tappedPoint.longitude.toFixed(5)}
                </Text>

                <View className="gap-3">
                  <Pressable
                    onPress={() => goContribute(tappedPoint)}
                    className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand"
                  >
                    <Text className="font-bold text-white">Contribute to this point</Text>
                    <ArrowRight size={16} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => setTappedPoint(null)}
                    className="h-14 items-center justify-center rounded-2xl border border-border bg-white"
                  >
                    <Text className="font-bold text-text">Cancel</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <FeedFilterModal
        visible={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </View>
  );
}

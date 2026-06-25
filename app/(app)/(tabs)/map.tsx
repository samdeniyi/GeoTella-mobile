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
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  Circle,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Logo,
  BellIcon,
  PinIcon,
  ArrowRight,
  FireIcon,
  LockIcon,
  WarningIcon,
  TokenWalletIcon,
} from '@/components/ui/Icons';
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
import { useUnreadNotificationsCount } from '@/features/notifications/api/notifications-queries';
import { useWalletDashboardQuery } from '@/features/wallet/api/wallet-queries';
import { unwrap } from '@/features/wallet/api/wallet-api';
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
  const unreadCount = useUnreadNotificationsCount();
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

  const dashboardQuery = useWalletDashboardQuery();
  const dashboard = unwrap(dashboardQuery.data);
  const balance = dashboard?.balance ?? 0;

  // Hot zones unlock state — this feature doesn't have a dedicated API yet,
  // so we track it locally. Replace with an API call when available.
  const [hotZonesUnlocked, setHotZonesUnlocked] = useState(false);

  const [hotZonesVisible, setHotZonesVisible] = useState(false);
  const [hotZonesModalOpen, setHotZonesModalOpen] = useState(false);

  useEffect(() => {
    if (hotZonesUnlocked) {
      setHotZonesVisible(true);
    }
  }, [hotZonesUnlocked]);

  const handlePillPress = () => {
    if (!hotZonesUnlocked) {
      setHotZonesModalOpen(true);
    } else {
      setHotZonesVisible(!hotZonesVisible);
    }
  };

  const handleUnlockHotZones = () => {
    if (balance >= 15) {
      setHotZonesUnlocked(true);
      setHotZonesModalOpen(false);
      Alert.alert('Success', 'Growth Hot Zones unlocked successfully!');
    } else {
      Alert.alert('Error', 'Insufficient balance or purchase error.');
    }
  };

  const handleGoToBuy = () => {
    setHotZonesModalOpen(false);
    router.push('/wallet/buy');
  };

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
            <BellIcon hasUnread={unreadCount > 0} />
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
        {/* Floating Growth Hot Zones Pill */}
        <Pressable
          onPress={handlePillPress}
          className="absolute left-6 top-4 z-10 flex-row items-center gap-2 rounded-full border border-[#E6DFB9] bg-[#FAF7E8] px-4 py-2 shadow active:opacity-90"
        >
          <FireIcon color="#B85317" size={14} />
          <Text className="text-xs font-bold text-[#5C3E14]">Growth Hot Zones</Text>
          {!hotZonesUnlocked ? (
            <View className="flex-row items-center gap-1 rounded-full border border-[#EAD093] bg-[#FAF1CC] px-2 py-0.5">
              <LockIcon color="#B85317" size={10} />
              <Text className="text-[10px] font-extrabold text-[#B85317]">15 tk</Text>
            </View>
          ) : (
            <View
              className={cn(
                'rounded-md px-1.5 py-0.5',
                hotZonesVisible ? 'bg-[#0E5A3A]' : 'bg-gray-400',
              )}
            >
              <Text className="text-[9px] font-extrabold text-white">
                {hotZonesVisible ? 'ON' : 'OFF'}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Legend panel visible when hot zones are ON */}
        {hotZonesUnlocked && hotZonesVisible ? (
          <View className="absolute bottom-6 left-6 z-10 flex-row items-center gap-4 rounded-full border border-border bg-[#FAF9F6] px-4 py-2 shadow-md">
            <View className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full bg-[#E85A2D]" />
              <Text className="text-[10px] font-bold text-text">Hot</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full bg-[#FBBC05]" />
              <Text className="text-[10px] font-bold text-text">Warming</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full bg-[#0E5A3A]" />
              <Text className="text-[10px] font-bold text-text">Steady</Text>
            </View>
          </View>
        ) : null}

        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={INITIAL_REGION}
          onPress={handleMapPress}
          showsUserLocation
        >
          {hotZonesUnlocked && hotZonesVisible ? (
            <>
              <Circle
                center={{ latitude: 6.5244, longitude: 3.3792 }}
                radius={3500}
                fillColor="rgba(232, 90, 45, 0.22)"
                strokeColor="rgba(0, 0, 0, 0)"
              />
              <Circle
                center={{ latitude: 6.542, longitude: 3.398 }}
                radius={2500}
                fillColor="rgba(251, 188, 5, 0.22)"
                strokeColor="rgba(0, 0, 0, 0)"
              />
              <Circle
                center={{ latitude: 6.51, longitude: 3.36 }}
                radius={4000}
                fillColor="rgba(14, 90, 58, 0.22)"
                strokeColor="rgba(0, 0, 0, 0)"
              />
            </>
          ) : null}

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

      {/* Growth Hot Zones Unlock / Not Enough Tokens Modal */}
      <Modal
        visible={hotZonesModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setHotZonesModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable onPress={() => setHotZonesModalOpen(false)} className="flex-1" />
          <View className="rounded-t-[32px] border-t border-border bg-surface-card p-6">
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-border/40" />

            {balance >= 15 ? (
              <View className="items-center py-4">
                {/* Green Flame Icon container */}
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
                  <FireIcon color="#0E5A3A" size={28} />
                </View>

                {/* Title */}
                <Text className="mt-4 text-center text-2xl font-bold text-text">
                  Reveal Growth Hot Zones
                </Text>
                <Text className="mt-2 px-4 text-center text-sm leading-normal text-text opacity-70">
                  Colour-coded growth overlay across the whole map.
                </Text>

                {/* Info Card */}
                <View className="my-6 w-full flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
                  <View className="flex-row items-center gap-3">
                    <TokenWalletIcon color="#0E5A3A" size={20} />
                    <Text className="text-sm font-extrabold text-text">This unlock</Text>
                  </View>
                  <Text className="text-sm font-extrabold text-[#C14622]">-15 tokens</Text>
                </View>

                {/* Balance Transition */}
                <Text className="mb-6 text-center text-xs text-text opacity-60">
                  Balance {balance} ➔ {balance - 15} tokens
                </Text>

                {/* Confirm Button */}
                <Pressable
                  onPress={handleUnlockHotZones}
                  className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-[#0E5A3A] shadow-sm active:opacity-90"
                >
                  <TokenWalletIcon color="white" size={18} />
                  <Text className="text-base font-bold text-white">Confirm · Spend 15</Text>
                </Pressable>

                {/* Not now */}
                <Pressable
                  onPress={() => setHotZonesModalOpen(false)}
                  className="mt-5 py-2 active:opacity-60"
                >
                  <Text className="text-sm font-extrabold text-brand">Not now</Text>
                </Pressable>
              </View>
            ) : (
              <View className="items-center py-4">
                {/* Orange Warning Icon container */}
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF5F0]">
                  <WarningIcon color="#E85A2D" size={28} />
                </View>

                {/* Title */}
                <Text className="mt-4 text-center text-2xl font-bold text-text">
                  Not enough tokens
                </Text>
                <Text className="mt-2 px-4 text-center text-sm leading-normal text-text opacity-70">
                  You need 15 tokens to reveal Growth Hot Zones — top up to continue.
                </Text>

                {/* Info Card */}
                <View className="my-6 w-full flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
                  <View className="flex-row items-center gap-3">
                    <TokenWalletIcon color="#0E5A3A" size={20} />
                    <Text className="text-sm font-extrabold text-text">Your balance</Text>
                  </View>
                  <Text className="text-sm font-extrabold text-[#C14622]">{balance} tokens</Text>
                </View>

                {/* Short Indicator */}
                <Text className="mb-6 text-center text-xs font-bold text-[#C14622]">
                  Short by {15 - balance} tokens
                </Text>

                {/* Buy Button */}
                <Pressable
                  onPress={handleGoToBuy}
                  className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-[#0E5A3A] shadow-sm active:opacity-90"
                >
                  <TokenWalletIcon color="white" size={18} />
                  <Text className="text-base font-bold text-white">Buy tokens</Text>
                </Pressable>

                {/* Maybe later */}
                <Pressable
                  onPress={() => setHotZonesModalOpen(false)}
                  className="mt-5 py-2 active:opacity-60"
                >
                  <Text className="text-sm font-extrabold text-brand">Maybe later</Text>
                </Pressable>
              </View>
            )}
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

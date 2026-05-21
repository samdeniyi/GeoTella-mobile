import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { ArrowRight, PinIcon } from '@/components/ui/Icons';
import { reverseGeocode } from '@/features/maps/geocode';
import { PlaceSearch } from '@/features/maps/PlaceSearch';
import { useAddStore } from '@/stores/add-store';

type Props = {
  onNext: () => void;
  onCancel: () => void;
};

const DEFAULT_REGION: Region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function LocateStep({ onNext, onCancel }: Props) {
  const { data, setData } = useAddStore();
  const mapRef = useRef<MapView | null>(null);
  const [resolving, setResolving] = useState(false);

  // If a location was pre-seeded (from tapping the map page), focus on it.
  useEffect(() => {
    if (data.location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: data.location.coords.lat,
          longitude: data.location.coords.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    }
  }, [data.location?.coords.lat, data.location?.coords.lng]);

  const setLocation = async (lat: number, lng: number, fallbackName?: string) => {
    setResolving(true);
    const r = await reverseGeocode({ latitude: lat, longitude: lng });
    setResolving(false);
    setData({
      location: {
        name: r?.formattedAddress ?? fallbackName ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        address: r?.formattedAddress,
        coords: { lat, lng },
        country: r?.country,
        region: r?.region,
        city: r?.city,
      },
    });
  };

  const initial: Region = data.location
    ? {
        latitude: data.location.coords.lat,
        longitude: data.location.coords.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  return (
    <ScrollView
      className="flex-1 px-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="z-10 mb-4">
        <PlaceSearch
          placeholder="Search a city or address..."
          onPick={(p) => {
            mapRef.current?.animateToRegion(
              {
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              500,
            );
            setData({
              location: {
                name:
                  p.formattedAddress ||
                  `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`,
                address: p.formattedAddress,
                coords: { lat: p.coords.latitude, lng: p.coords.longitude },
                country: p.country,
                region: p.region,
                city: p.city,
              },
            });
          }}
        />
      </View>

      <View className="mb-6 h-72 overflow-hidden rounded-[32px] border border-border">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={initial}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            void setLocation(latitude, longitude);
          }}
        >
          {data.location ? (
            <Marker
              draggable
              coordinate={{
                latitude: data.location.coords.lat,
                longitude: data.location.coords.lng,
              }}
              onDragEnd={(e) =>
                void setLocation(
                  e.nativeEvent.coordinate.latitude,
                  e.nativeEvent.coordinate.longitude,
                )
              }
              pinColor="#0B4A33"
            />
          ) : null}
        </MapView>
      </View>

      <View className="mb-6 rounded-[32px] border border-border bg-white p-6">
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Selected Location
        </Text>
        {data.location ? (
          <>
            <Text className="mb-1 text-lg font-bold text-text" numberOfLines={2}>
              {data.location.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <PinIcon size={12} color="#0B4A33" />
              <Text className="text-xs font-bold uppercase text-brand">
                {data.location.coords.lat.toFixed(5)}, {data.location.coords.lng.toFixed(5)}
              </Text>
            </View>
            {resolving ? (
              <Text className="mt-2 text-[10px] text-text opacity-40">Resolving address…</Text>
            ) : null}
          </>
        ) : (
          <Text className="text-base text-text opacity-60">
            Tap the map or search to choose a point.
          </Text>
        )}
      </View>

      <View className="mb-10 gap-4">
        <Pressable
          disabled={!data.location}
          onPress={onNext}
          className={`h-16 flex-row items-center justify-center gap-2 rounded-[24px] ${
            data.location ? 'bg-brand' : 'bg-brand/40'
          }`}
        >
          <Text className="text-base font-bold text-white">Next: Describe</Text>
          <ArrowRight size={18} color="white" />
        </Pressable>
        <Pressable
          onPress={onCancel}
          className="h-16 items-center justify-center rounded-[24px] border border-border bg-surface-card"
        >
          <Text className="text-base font-bold text-text">Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

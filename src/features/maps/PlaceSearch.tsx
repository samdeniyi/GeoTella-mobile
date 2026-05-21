import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';

import { SearchIcon } from '@/components/ui/Icons';

import {
  autocompletePlaces,
  getPlaceDetails,
  type PlaceDetails,
  type PlaceSuggestion,
} from './geocode';

type Props = {
  placeholder?: string;
  onPick: (place: PlaceDetails) => void;
  className?: string;
};

// Simple Places autocomplete input. Debounced 300ms.
export function PlaceSearch({ placeholder = 'Search a city or address...', onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const session = useMemo(() => Math.random().toString(36).slice(2) + Date.now().toString(36), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const r = await autocompletePlaces(query, session);
      setResults(r);
      setLoading(false);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, session]);

  const handlePick = async (s: PlaceSuggestion) => {
    setLoading(true);
    const d = await getPlaceDetails(s.placeId);
    setLoading(false);
    if (d) {
      onPick(d);
      setQuery(s.mainText ?? s.description);
      setResults([]);
    }
  };

  const show = focused && (loading || results.length > 0);

  return (
    <View>
      <View className="flex-row items-center rounded-2xl border border-border bg-white px-4 py-3">
        <SearchIcon />
        <TextInput
          className="ml-3 flex-1 text-base text-text"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {loading ? <ActivityIndicator size="small" /> : null}
      </View>

      {show ? (
        <View className="mt-1 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {results.map((r) => (
            <Pressable
              key={r.placeId}
              onPress={() => handlePick(r)}
              className="border-b border-border/30 px-4 py-3 last:border-b-0"
            >
              <Text className="text-sm font-bold text-text" numberOfLines={1}>
                {r.mainText ?? r.description}
              </Text>
              {r.secondaryText ? (
                <Text className="text-xs text-text opacity-60" numberOfLines={1}>
                  {r.secondaryText}
                </Text>
              ) : null}
            </Pressable>
          ))}
          {!loading && results.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-xs text-text opacity-50">No results</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

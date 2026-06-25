import Constants from 'expo-constants';

const KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  (Constants.expoConfig as { extra?: { googleMapsApiKey?: string } } | undefined)?.extra
    ?.googleMapsApiKey ||
  (Constants.expoConfig as { ios?: { config?: { googleMapsApiKey?: string } } } | undefined)?.ios
    ?.config?.googleMapsApiKey ||
  '';

export type LatLng = { latitude: number; longitude: number };

export type ReverseGeocodeResult = {
  formattedAddress: string;
  city?: string;
  region?: string;
  country?: string;
};

export const reverseGeocode = async (coords: LatLng): Promise<ReverseGeocodeResult | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${KEY}`;
    const res = await fetch(url);
    const json = (await res.json()) as {
      results?: {
        formatted_address?: string;
        address_components?: { long_name: string; short_name: string; types: string[] }[];
      }[];
    };
    const first = json.results?.[0];
    if (!first) return null;
    const comps = first.address_components ?? [];
    const find = (type: string) => comps.find((c) => c.types.includes(type))?.long_name;
    return {
      formattedAddress: first.formatted_address ?? '',
      city: find('locality') ?? find('postal_town') ?? find('administrative_area_level_2'),
      region: find('administrative_area_level_1'),
      country: find('country'),
    };
  } catch {
    return null;
  }
};

export type PlaceSuggestion = {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
};

export const autocompletePlaces = async (
  input: string,
  sessionToken?: string,
): Promise<PlaceSuggestion[]> => {
  if (!input.trim()) return [];
  try {
    const params = new URLSearchParams({ input, key: KEY });
    if (sessionToken) params.append('sessiontoken', sessionToken);
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
    const res = await fetch(url);
    const json = (await res.json()) as {
      predictions?: {
        place_id: string;
        description: string;
        structured_formatting?: { main_text?: string; secondary_text?: string };
      }[];
    };
    return (json.predictions ?? []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text,
      secondaryText: p.structured_formatting?.secondary_text,
    }));
  } catch {
    return [];
  }
};

export type PlaceDetails = {
  placeId: string;
  formattedAddress: string;
  coords: LatLng;
  city?: string;
  region?: string;
  country?: string;
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: KEY,
      fields: 'geometry,formatted_address,address_components,place_id',
    });
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const res = await fetch(url);
    const json = (await res.json()) as {
      result?: {
        place_id?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: { long_name: string; types: string[] }[];
      };
    };
    const r = json.result;
    if (!r?.geometry?.location) return null;
    const comps = r.address_components ?? [];
    const find = (type: string) => comps.find((c) => c.types.includes(type))?.long_name;
    return {
      placeId: r.place_id ?? placeId,
      formattedAddress: r.formatted_address ?? '',
      coords: { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng },
      city: find('locality') ?? find('postal_town'),
      region: find('administrative_area_level_1'),
      country: find('country'),
    };
  } catch {
    return null;
  }
};

import type { FeedItem } from '@/components/features/feed/FeedCard';

import type { Insight } from './api/insights-api';

const FLAG_BY_COUNTRY: Record<string, string> = {
  nigeria: '🇳🇬',
  ghana: '🇬🇭',
  kenya: '🇰🇪',
  rwanda: '🇷🇼',
  egypt: '🇪🇬',
  southafrica: '🇿🇦',
  'south africa': '🇿🇦',
};

const formatRelative = (iso?: string): string => {
  if (!iso) return 'recently';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  const diff = Date.now() - ts;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

const flagFor = (country?: string) => {
  if (!country) return '🌍';
  const key = country.trim().toLowerCase();
  return FLAG_BY_COUNTRY[key] ?? '🌍';
};

const categoryLabel = (i: Insight): string | undefined => {
  if (i.categoryName) return i.categoryName;
  if (i.categoryCode) return i.categoryCode;
  const c = i.category;
  if (!c) return undefined;
  if (typeof c === 'string') return c;
  return c.name ?? undefined;
};

const buildLocation = (i: Insight): string => {
  if (i.locationDisplay) return i.locationDisplay;
  const parts = [
    i.locationLabel ?? i.city ?? i.locationName,
    i.regionName ?? i.region,
    i.countryName ?? i.country,
  ].filter(Boolean) as string[];
  if (parts.length) return parts.join(' · ');
  if (i.location) return i.location;
  if (typeof i.latitude === 'number' && typeof i.longitude === 'number') {
    return `${i.latitude.toFixed(3)}, ${i.longitude.toFixed(3)}`;
  }
  return 'Unknown location';
};

const buildUserName = (i: Insight): string => {
  if (i.createdByUserName) return i.createdByUserName;
  const u = i.user;
  if (u?.fullName) return u.fullName;
  const fn = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim();
  if (fn) return fn;
  return u?.emailAddress ?? i.createdByUserEmail ?? 'Contributor';
};

// Normalize an Insight record from the API into the FeedItem shape that the
// existing UI expects. Keeps the original record on the `_raw` field so callers
// can reach for fields we haven't surfaced yet (lat/lng, attestation counts).
export type NormalizedInsight = FeedItem & {
  latitude?: number;
  longitude?: number;
  growthRating?: Insight['growthRating'];
  _raw: Insight;
};

export const normalizeInsight = (i: Insight): NormalizedInsight => {
  const image = i.image ?? i.photoUrl ?? i.imageUrl ?? '';
  const userName = buildUserName(i);
  const attestations = i.attestCount ?? i.attestations;
  return {
    id: i.id,
    user: {
      name: userName,
      avatar: i.user?.avatar ?? '',
      flag: i.user?.flag ?? flagFor(i.countryName ?? i.country),
    },
    time: i.timeAgo ?? formatRelative(i.createdAt ?? i.dateStamp ?? i.updatedAt),
    image,
    location: buildLocation(i),
    title: i.title ?? '(untitled)',
    description: i.body ?? i.aiSummary ?? '',
    tags: [categoryLabel(i), i.growthRating].filter(Boolean) as string[],
    growthScore: typeof i.convictionScore === 'number' ? i.convictionScore : i.growthScore,
    verified: typeof attestations === 'number' ? attestations >= 3 : undefined,
    source:
      typeof i.source === 'string' && i.source !== 'AI'
        ? i.source
        : i.sourceCitations
          ? 'Source linked'
          : undefined,
    latitude: i.latitude,
    longitude: i.longitude,
    growthRating: i.growthRating,
    _raw: i,
  };
};

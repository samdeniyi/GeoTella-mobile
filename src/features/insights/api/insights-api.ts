import { apiRequest } from '@/lib/api/client';

export type GrowthRating = 'COOLING' | 'STEADY' | 'WARMING' | 'HOT';
export type AttestType = 'ATTEST' | 'REFUTE';
// Insight `persona` mirrors the role-store enum the backend now requires.
export type InsightPersona = 'EXPLORER' | 'GROWTH_SEEKER';

export type InsightAction = 'DETAILS' | 'PREVIEW' | 'PUBLISH' | 'TAKE_DOWN' | 'DELETE' | string;

export type InsightChecklist = {
  verifiedSourceAttached?: boolean;
  dateStampWithin90Days?: boolean;
  forwardLookingDataHasDisclaimer?: boolean;
  bodyMin100Words?: boolean;
  wordCount?: number;
  coordinatesAccurate?: boolean;
  attestCount?: number;
  refuteCount?: number;
  lastComputedAt?: string;
};

export type InsightAttestation = {
  userId: string;
  fullName?: string | null;
  type: AttestType;
  timeAgo?: string;
};

// Mirrors `/api/insights/pending-verification` items. Other endpoints we've
// inspected return the same fields, so we use this as the canonical shape.
export type Insight = {
  id: string;
  title?: string;
  body?: string;
  // Image fields vary by endpoint — keep all three until backend converges.
  image?: string;
  photoUrl?: string;
  imageUrl?: string;

  // Location: backend currently returns `locationDisplay` + region/country ids
  // and labels. Older fields kept for screens that still read them.
  locationDisplay?: string;
  regionId?: string;
  regionName?: string;
  countryId?: string;
  countryName?: string;
  locationId?: string;
  locationLabel?: string;
  // Legacy / fallback fields used by older screens before this endpoint shape.
  location?: string;
  locationName?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  categoryId?: string;
  categoryCode?: string;
  categoryName?: string;
  // Older `category` object form — kept for backward compat with feed responses.
  category?: string | { id?: string; name?: string };

  source?: string;
  status?: string;
  persona?: InsightPersona;
  growthRating?: GrowthRating;
  growthScore?: number;
  convictionScore?: number;
  sourceCitations?: string;
  aiSummary?: string;
  tags?: string[];

  // Audit / lifecycle timestamps.
  createdAt?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  createdByUserEmail?: string;
  publishedAt?: string | null;
  publishedById?: string | null;
  takenDownAt?: string | null;
  takenDownById?: string | null;
  takenDownReason?: string | null;
  restoredAt?: string | null;
  restoredById?: string | null;
  dateStamp?: string;
  updatedAt?: string;

  allowedActions?: InsightAction[];

  // Engagement counters (new naming from backend).
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  attestCount?: number;
  refuteCount?: number;
  userLiked?: boolean;
  timeAgo?: string;

  // Older flat counters kept so existing screens keep compiling. Prefer the
  // *Count fields above.
  views?: number;
  likes?: number;
  liked?: boolean;
  bookmarked?: boolean;
  attestationsNeeded?: number;

  // Detail-endpoint extras — checklist + per-user attestations array.
  checklist?: InsightChecklist;
  attestations?: InsightAttestation[] | number;

  // Sometimes returned by older feed shape.
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    emailAddress?: string;
    flag?: string;
    avatar?: string;
  } | null;

  [key: string]: unknown;
};

export type Paginated<T> = {
  data?: T[];
  items?: T[];
  results?: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  [key: string]: unknown;
};

export type FeedFilters = {
  categoryId?: string;
  growthRating?: GrowthRating[];
  verified?: boolean;
  latitude?: number;
  longitude?: number;
};

export type FeedQuery = FeedFilters & {
  page?: number;
  limit?: number;
};

const buildFeedQueryParams = (
  q: FeedQuery,
): Record<string, string | number | boolean | undefined> => {
  const params: Record<string, string | number | boolean | undefined> = {
    page: q.page ?? 1,
    limit: q.limit ?? 20,
  };
  if (q.categoryId) params.categoryId = q.categoryId;
  // growthRating is handled separately as repeated query params in getFeed.
  if (typeof q.verified === 'boolean') params.verified = q.verified;
  if (typeof q.latitude === 'number') params.latitude = q.latitude;
  if (typeof q.longitude === 'number') params.longitude = q.longitude;
  return params;
};

export const getFeed = (query: FeedQuery = {}) => {
  const params = buildFeedQueryParams(query);
  // Build URL manually so growthRating gets sent as repeated query params
  // (e.g. ?growthRating=COOLING&growthRating=HOT) which the backend expects.
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) searchParams.append(k, String(v));
  });
  if (query.growthRating && query.growthRating.length) {
    query.growthRating.forEach((g) => searchParams.append('growthRating', g));
  }
  const qs = searchParams.toString();
  const path = qs ? `/api/insights/feed?${qs}` : '/api/insights/feed';
  return apiRequest<Paginated<Insight> | Insight[]>(path, { method: 'GET' });
};

export const getInsightById = (id: string) =>
  apiRequest<Insight | { data?: Insight }>(`/api/insights/${id}`);

export const getPendingVerification = (query: FeedQuery = {}) =>
  apiRequest<Paginated<Insight> | Insight[]>('/api/insights/pending-verification', {
    method: 'GET',
    query: { page: query.page ?? 1, limit: query.limit ?? 20 },
  });

export type CreateInsightInput = {
  title: string;
  categoryId: string;
  growthRating: GrowthRating;
  body?: string;
  // Free-text place names from Google geocoding — sent to /submit-by-name.
  country?: string;
  region?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  persona?: InsightPersona;
  sourceCitations?: string;
  notesForVerifiers?: string;
  // expo-image-picker / FileSystem URI to attach. Optional.
  file?: { uri: string; name?: string; type?: string };
};

const guessImageMime = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
};

const buildInsightFormData = (
  input: CreateInsightInput,
): { fd: FormData; debug: Record<string, unknown> } => {
  const fd = new FormData();
  const debug: Record<string, unknown> = {};
  const append = (k: string, v: string | number | undefined) => {
    if (v === undefined || v === null || v === '') return;
    fd.append(k, String(v));
    debug[k] = String(v);
  };
  append('title', input.title);
  append('categoryId', input.categoryId);
  append('growthRating', input.growthRating);
  append('body', input.body);
  append('country', input.country);
  append('region', input.region);
  append('location', input.location);
  append('latitude', input.latitude);
  append('longitude', input.longitude);
  append('persona', input.persona);
  append('sourceCitations', input.sourceCitations);
  append('notesForVerifiers', input.notesForVerifiers);

  if (input.file?.uri) {
    const name = input.file.name ?? input.file.uri.split('/').pop() ?? 'photo.jpg';
    const type = input.file.type ?? guessImageMime(input.file.uri);
    // React Native's fetch accepts a `{ uri, name, type }` blob shape on FormData.
    fd.append('file', { uri: input.file.uri, name, type } as unknown as Blob);
    debug.file = { uri: input.file.uri, name, type };
  }
  return { fd, debug };
};

// We now submit by free-text names (country/region/location) instead of IDs,
// so /submit-by-name is the canonical create endpoint.
export const createInsight = (input: CreateInsightInput) => {
  const { fd, debug } = buildInsightFormData(input);
  if (__DEV__) {
    console.log(
      '[api] → POST /api/insights/submit-by-name (multipart fields)',
      JSON.stringify(debug, null, 2),
    );
  }
  return apiRequest<Insight | { data?: Insight }>('/api/insights/submit-by-name', {
    method: 'POST',
    formData: fd,
  });
};

export type ContributionsQuery = {
  page?: number;
  limit?: number;
};

export const getMyContributions = (query: ContributionsQuery = {}) =>
  apiRequest<Paginated<Insight> | Insight[]>('/api/insights/contributions', {
    method: 'GET',
    query: { page: query.page ?? 1, limit: query.limit ?? 50 },
  });

export type UpdateInsightInput = Partial<{
  title: string;
  regionId: string;
  countryId: string;
  locationId: string;
  categoryId: string;
  source: string;
  status: string;
  persona: InsightPersona;
  growthRating: GrowthRating;
  body: string;
  sourceCitations: string;
  dateStamp: string;
  latitude: number;
  longitude: number;
  aiSummary: string;
  convictionScore: number;
}>;

export const updateInsight = (id: string, input: UpdateInsightInput) =>
  apiRequest<Insight | { data?: Insight }>(`/api/insights/${id}`, {
    method: 'PATCH',
    body: input,
  });

export const attestInsight = (id: string, type: AttestType) =>
  apiRequest<unknown>(`/api/insights/${id}/attest`, {
    method: 'POST',
    body: { type },
  });

export const flagInsight = (id: string, reason: string) =>
  apiRequest<unknown>(`/api/insights/${id}/flag`, {
    method: 'POST',
    body: { reason },
  });

export const recordInsightView = (id: string) =>
  apiRequest<unknown>(`/api/insights/${id}/view`, { method: 'POST' });

export const likeInsight = (id: string) =>
  apiRequest<unknown>(`/api/insights/${id}/like`, { method: 'POST' });

export const getBookmarks = (query: FeedQuery = {}) =>
  apiRequest<Paginated<Insight> | Insight[]>('/api/insights/bookmarks', {
    method: 'GET',
    query: { page: query.page ?? 1, limit: query.limit ?? 50 },
  });

export const bookmarkInsight = (id: string) =>
  apiRequest<unknown>(`/api/insights/${id}/bookmark`, { method: 'POST' });

export const unbookmarkInsight = (id: string) =>
  apiRequest<unknown>(`/api/insights/${id}/bookmark`, { method: 'DELETE' });

// Bookmarks endpoint wraps each insight in `{ id, insightId, insight: {...} }`.
// Unwrap so callers see plain Insight rows.
const flattenBookmark = (row: unknown): Insight | null => {
  if (!row || typeof row !== 'object') return null;
  const r = row as { insight?: unknown };
  if (r.insight && typeof r.insight === 'object') return r.insight as Insight;
  return row as Insight;
};

// Normalize the various paginated wrappers into a flat array of insights.
export const extractInsights = (raw: Paginated<Insight> | Insight[] | unknown): Insight[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Insight[];
  if (typeof raw !== 'object') return [];
  const r = raw as Paginated<Insight> & { data?: unknown; bookmarks?: unknown };
  if (Array.isArray(r.data)) return r.data as Insight[];
  if (Array.isArray(r.items)) return r.items as Insight[];
  if (Array.isArray(r.results)) return r.results as Insight[];
  if (Array.isArray(r.bookmarks)) {
    return (r.bookmarks as unknown[]).map(flattenBookmark).filter((i): i is Insight => i !== null);
  }
  // Sometimes the API wraps as `{ data: { items: [...] } }`.
  if (r.data && typeof r.data === 'object') {
    const inner = r.data as Paginated<Insight> & { bookmarks?: unknown };
    if (Array.isArray(inner.items)) return inner.items as Insight[];
    if (Array.isArray(inner.data)) return inner.data as Insight[];
    if (Array.isArray(inner.results)) return inner.results as Insight[];
    if (Array.isArray(inner.bookmarks)) {
      return (inner.bookmarks as unknown[])
        .map(flattenBookmark)
        .filter((i): i is Insight => i !== null);
    }
  }
  return [];
};

export const extractInsight = (raw: Insight | { data?: Insight } | unknown): Insight | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { data?: Insight; id?: string };
  if (r.data && typeof r.data === 'object') return r.data as Insight;
  if (typeof r.id === 'string') return r as Insight;
  return null;
};

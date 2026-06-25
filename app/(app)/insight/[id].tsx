import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  FlagIcon,
  ShareIcon,
  BookmarkIcon,
  CheckIcon,
  ExpertIcon,
  HeartIcon,
  MapTabIcon,
  PinIcon,
  WhatsappIcon,
  LockIcon,
  TokenWalletIcon,
  GiftIcon,
} from '@/components/ui/Icons';
import {
  extractInsight,
  extractInsights,
  type Insight,
} from '@/features/insights/api/insights-api';
import {
  useBookmarkInsightMutation,
  useFeedQuery,
  useFlagInsightMutation,
  useInsightQuery,
  useLikeInsightMutation,
  useUnlikeInsightMutation,
  useRecordViewMutation,
  useUnbookmarkInsightMutation,
} from '@/features/insights/api/insights-queries';
import { useBookmarkOverride, useBookmarkOverrides } from '@/features/insights/bookmark-store';
import { normalizeInsight } from '@/features/insights/normalize';
import { useUserRole } from '@/stores/auth-store';
import {
  useUnlockInsightMutation,
  useWalletDashboardQuery,
} from '@/features/wallet/api/wallet-queries';
import { unwrap } from '@/features/wallet/api/wallet-api';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import {
  useCompleteDailyChallengeMutation,
  useDailyChallengesStatusQuery,
} from '@/features/daily-challenges/api/daily-challenges-queries';
import { extractChallengesStatus } from '@/features/daily-challenges/api/daily-challenges-api';

const formatResetDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

export default function InsightDetails() {
  const { id, dailyChallengeId } = useLocalSearchParams<{ id: string; dailyChallengeId?: string }>();
  const insightId = id ?? '';
  const insightQuery = useInsightQuery(insightId);
  const recordView = useRecordViewMutation();
  // Wallet data — balance for the unlock modal.
  const dashboardQuery = useWalletDashboardQuery();
  const dashboard = unwrap(dashboardQuery.data);
  const balance = dashboard?.balance ?? 0;
  const freeViews = dashboard?.freeMonthlyInsightViews;
  const hasFreeViews = freeViews ? freeViews.available > 0 : false;
  const resetDate = freeViews?.resetsAt ? formatResetDate(freeViews.resetsAt) : '1 Jun';

  // Unlock insight mutation.
  const unlockMutation = useUnlockInsightMutation();
  const likeMutation = useLikeInsightMutation();
  const unlikeMutation = useUnlikeInsightMutation();
  const bookmarkMutation = useBookmarkInsightMutation();
  const unbookmarkMutation = useUnbookmarkInsightMutation();
  const flagMutation = useFlagInsightMutation();

  const raw = useMemo(() => extractInsight(insightQuery.data), [insightQuery.data]);
  const insight = raw ? normalizeInsight(raw) : null;

  // Token-gated unlocks are a Growth Seeker concept. Explorers get full
  // insights for free, so we always treat the content as unlocked for them.
  const role = useUserRole();
  const isExplorer = role === 'EXPLORER';
  const isUnlocked =
    isExplorer ||
    raw?.feature === 'ACCESS' ||
    raw?.feature === 'FULL_ACCESS' ||
    raw?.fullAccess === true;
  const [modalDismissed, setModalDismissed] = useState(false);

  // Flag modal state.
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagSuccess, setFlagSuccess] = useState(false);

  const openFlag = () => {
    setFlagReason('');
    setFlagError(null);
    setFlagSuccess(false);
    setFlagOpen(true);
  };

  const submitFlag = async () => {
    setFlagError(null);
    if (flagReason.trim().length < 10) {
      setFlagError('Please describe the issue (at least 10 characters).');
      return;
    }
    try {
      await flagMutation.mutateAsync({ id: insightId, reason: flagReason.trim() });
      setFlagSuccess(true);
    } catch (e) {
      setFlagError(getErrorMessage(e, 'Could not flag this insight.'));
    }
  };

  // Pull a feed page for related-insight candidates. Cached by the feed tab so
  // the network cost is usually zero.
  const feedQuery = useFeedQuery(1, 50);
  const candidates = useMemo<Insight[]>(() => extractInsights(feedQuery.data), [feedQuery.data]);

  // Score each candidate against the current insight; higher = more related.
  // We treat shared category, region, country, and growth rating as signals.
  const related = useMemo(() => {
    if (!raw) return [];
    const scored = candidates
      .filter((c) => c.id !== raw.id)
      .map((c) => {
        let score = 0;
        if (raw.categoryId && c.categoryId === raw.categoryId) score += 3;
        else if (raw.categoryName && c.categoryName === raw.categoryName) score += 3;
        if (raw.regionName && c.regionName === raw.regionName) score += 2;
        if (raw.countryName && c.countryName === raw.countryName) score += 2;
        if (raw.growthRating && c.growthRating === raw.growthRating) score += 1;
        return { c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    return scored.map((x) => x.c);
  }, [raw, candidates]);

  // Fire view once we have a confirmed insight id.
  useEffect(() => {
    if (!insightId || !raw?.id) return;
    recordView.mutate(insightId);
    // recordView is stable enough; we deliberately omit it from deps to avoid loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightId, raw?.id]);

  // Handle daily challenge auto-completion for EXPLORE_INSIGHT (only when unlocked)
  const challengesQuery = useDailyChallengesStatusQuery();
  const challengeStatus = useMemo(() => extractChallengesStatus(challengesQuery.data), [challengesQuery.data]);
  const completeChallengeMutation = useCompleteDailyChallengeMutation();

  const matchingChallenge = useMemo(() => {
    if (!challengeStatus?.challenges) return null;
    return challengeStatus.challenges.find(
      (c) =>
        c.type === 'EXPLORE_INSIGHT' &&
        !c.completed &&
        (c.insightId === insightId || c.id === dailyChallengeId)
    );
  }, [challengeStatus, insightId, dailyChallengeId]);

  useEffect(() => {
    if (matchingChallenge && isUnlocked && !completeChallengeMutation.isPending && !completeChallengeMutation.isSuccess) {
      completeChallengeMutation.mutate(matchingChallenge.id);
    }
  }, [matchingChallenge, isUnlocked, completeChallengeMutation]);

  // Bookmark + like overrides — declared BEFORE any early returns so the hook
  // count is stable across the loading/error/loaded renders.
  const bookmarkOverride = useBookmarkOverride(insightId);
  const setBookmarkOverride = useBookmarkOverrides((s) => s.set);
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);

  if (insightQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#0B4A33" />
      </View>
    );
  }

  if (insightQuery.isError || !insight) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top']} className="flex-row items-center gap-2 px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
          >
            <BackIcon size={20} />
          </Pressable>
          <Text className="text-lg font-bold text-text">Insight</Text>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-text opacity-70">
            {getErrorMessage(insightQuery.error, 'Could not load this insight.')}
          </Text>
        </View>
      </View>
    );
  }

  // Bookmark state — prefer the local override so the icon flips instantly.
  const isSaved = bookmarkOverride ?? Boolean(raw?.bookmarked);
  const toggleSave = () => {
    const next = !isSaved;
    setBookmarkOverride(insightId, next);
    const mutation = next ? bookmarkMutation : unbookmarkMutation;
    mutation.mutate(insightId, {
      onError: () => setBookmarkOverride(insightId, !next),
    });
  };

  // Like state — `userLiked` is the canonical backend field; fall back to the
  // older `liked` shape and to a local override for instant feedback while the
  // mutation is in flight.
  const serverLiked = Boolean(raw?.userLiked ?? raw?.liked);
  const isLiked = likedOverride ?? serverLiked;
  const baseLikeCount = raw?.likeCount ?? raw?.likes ?? 0;
  const displayedLikeCount =
    likedOverride === null
      ? baseLikeCount
      : likedOverride === serverLiked
        ? baseLikeCount
        : likedOverride
          ? baseLikeCount + 1
          : Math.max(0, baseLikeCount - 1);
  const onLike = () => {
    if (likeMutation.isPending || unlikeMutation.isPending) return;
    const next = !isLiked;
    setLikedOverride(next);
    const mutation = next ? likeMutation : unlikeMutation;
    mutation.mutate(insightId, {
      onError: () => setLikedOverride(!next),
    });
  };

  const sourceCitation = typeof raw?.sourceCitations === 'string' ? raw.sourceCitations : '';
  const tagList = insight.tags ?? [];

  // Build a shareable text payload — uses the source citation when present,
  // falls back to the title + description.
  const buildShareMessage = () => {
    const parts: string[] = [];
    if (insight.title) parts.push(insight.title);
    if (insight.location) parts.push(`📍 ${insight.location}`);
    if (insight.description) parts.push(insight.description);
    if (sourceCitation) parts.push(sourceCitation);
    parts.push('Shared from Geotela');
    return parts.join('\n\n');
  };

  const onShare = async () => {
    try {
      await Share.share({ message: buildShareMessage(), title: insight.title });
    } catch {
      // user cancelled or share unavailable — no-op
    }
  };

  const onShareWhatsapp = async () => {
    const text = encodeURIComponent(buildShareMessage());
    const url = `whatsapp://send?text=${text}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fall back to the system share sheet if WhatsApp isn't installed.
      await onShare();
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockMutation.mutateAsync(insightId);
      Alert.alert('Unlocked', 'Insight successfully unlocked!');
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e, 'Could not unlock this insight.'));
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView
        edges={['top']}
        className="flex-row items-center justify-between border-b border-border/50 px-6 py-4"
      >
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
          >
            <BackIcon size={20} />
          </Pressable>
          <Text className="text-lg font-bold text-text">Insight</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={openFlag} hitSlop={8}>
            <FlagIcon size={18} />
          </Pressable>
          <Pressable onPress={onShare} hitSlop={8}>
            <ShareIcon size={18} />
          </Pressable>
          <Pressable onPress={toggleSave} hitSlop={8}>
            <BookmarkIcon size={18} focused={isSaved} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {insight.image ? (
          <Image
            key={insight.image}
            source={{ uri: insight.image }}
            style={{ width: '100%', height: 256 }}
            resizeMode="cover"
            accessibilityLabel={insight.title}
          />
        ) : null}

        <View className="p-6">
          <View className="mb-3 flex-row items-center gap-1.5">
            <PinIcon size={12} color="#6B7280" />
            <Text className="text-xs font-bold text-text opacity-40">{insight.location}</Text>
          </View>
          <Text className="mb-6 text-3xl font-bold leading-tight text-text">{insight.title}</Text>

          {/* User Info Row */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Text className="font-bold text-white">
                  {insight.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-bold text-text">{insight.user.name}</Text>
                  <Text>{insight.user.flag}</Text>
                </View>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  {insight.time}
                  {typeof raw?.latitude === 'number' && typeof raw?.longitude === 'number'
                    ? ` · ${raw.latitude.toFixed(4)}°, ${raw.longitude.toFixed(4)}°`
                    : ''}
                </Text>
              </View>
            </View>
          </View>

          {isUnlocked ? (
            <>
              {/* Verification Panel */}
              {(() => {
                const attestationsArr = Array.isArray(raw?.attestations) ? raw.attestations : null;
                const checklistCount = raw?.checklist?.attestCount;
                const attestationsTotal =
                  attestationsArr?.length ?? checklistCount ?? raw?.attestCount ?? null;
                if (attestationsTotal === null) return null;
                const fullyVerified = attestationsTotal >= 3;
                return (
                  <View className="mb-8 rounded-[24px] border border-border bg-white p-6">
                    <View className="mb-4 flex-row items-center gap-4">
                      <View
                        className={cn(
                          'h-12 w-12 items-center justify-center rounded-2xl',
                          fullyVerified ? 'bg-green-900' : 'bg-orange-500',
                        )}
                      >
                        <CheckIcon size={24} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-text">
                          {fullyVerified ? 'Fully Verified' : 'Awaiting verification'}
                        </Text>
                        <Text className="text-xs text-text opacity-40">
                          {attestationsTotal} attestation{attestationsTotal === 1 ? '' : 's'}
                          {typeof raw?.checklist?.refuteCount === 'number' &&
                            raw.checklist.refuteCount > 0
                            ? ` · ${raw.checklist.refuteCount} refute${raw.checklist.refuteCount === 1 ? '' : 's'}`
                            : ''}
                        </Text>
                      </View>
                    </View>
                    <View className="mb-6 h-1.5 w-full rounded-full bg-border/20">
                      <View
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, (attestationsTotal / 3) * 100)}%` }}
                      />
                    </View>

                    {attestationsArr && attestationsArr.length > 0 ? (
                      <View className="gap-4">
                        {attestationsArr.map((a, idx) => {
                          const name = a.fullName ?? 'Attester';
                          const initial = name.charAt(0).toUpperCase() || 'A';
                          const isRefute = a.type === 'REFUTE';
                          return (
                            <View
                              key={`${a.userId}-${idx}`}
                              className="flex-row items-center justify-between"
                            >
                              <View className="flex-row items-center gap-3">
                                <View
                                  className={cn(
                                    'h-8 w-8 items-center justify-center rounded-lg',
                                    isRefute ? 'bg-accent' : 'bg-brand',
                                  )}
                                >
                                  <Text className="text-[10px] font-bold text-white">
                                    {initial}
                                  </Text>
                                </View>
                                <View>
                                  <Text className="text-sm font-medium text-text">{name}</Text>
                                  <Text className="text-[10px] font-bold uppercase text-text opacity-40">
                                    {isRefute ? 'Refuted' : 'Attested'}
                                  </Text>
                                </View>
                              </View>
                              {a.timeAgo ? (
                                <Text className="text-[10px] font-bold text-text opacity-40">
                                  {a.timeAgo}
                                </Text>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                );
              })()}

              {sourceCitation ? (
                <Pressable
                  onPress={async () => {
                    const candidate = sourceCitation.trim();
                    // Prefix bare hostnames so Linking treats them as web URLs.
                    const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)
                      ? candidate
                      : `https://${candidate}`;
                    try {
                      const supported = await Linking.canOpenURL(url);
                      if (supported) {
                        await Linking.openURL(url);
                      } else {
                        Alert.alert("Can't open link", 'No app available to open this URL.');
                      }
                    } catch {
                      Alert.alert("Can't open link", 'The source link could not be opened.');
                    }
                  }}
                  className="mb-10 flex-row items-center gap-3 rounded-2xl border border-border bg-white p-4 active:opacity-70"
                >
                  <Text className="text-brand">🔗</Text>
                  <Text className="flex-1 font-bold text-brand underline" numberOfLines={1}>
                    {sourceCitation}
                  </Text>
                </Pressable>
              ) : null}

              {/* Credibility */}
              <View className="mb-10 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-text opacity-60">
                  {isLiked ? 'You liked this insight' : 'Like this insight?'}
                </Text>
                <Pressable
                  onPress={onLike}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={isLiked ? 'Unlike insight' : 'Like insight'}
                  accessibilityState={{ selected: isLiked }}
                  className={cn(
                    'h-12 min-w-[56px] flex-row items-center justify-center gap-2 rounded-xl border px-3',
                    isLiked ? 'border-accent bg-accent/10' : 'border-border bg-white',
                    (likeMutation.isPending || unlikeMutation.isPending) && 'opacity-60',
                  )}
                >
                  <HeartIcon filled={isLiked} size={20} />
                  {displayedLikeCount > 0 ? (
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        isLiked ? 'text-accent' : 'text-text opacity-60',
                      )}
                    >
                      {displayedLikeCount}
                    </Text>
                  ) : null}
                </Pressable>
              </View>

              <Pressable
                onPress={onShareWhatsapp}
                className="mb-8 h-16 flex-row items-center justify-center gap-3 rounded-[24px] border-2 border-border bg-white"
              >
                <WhatsappIcon size={24} />
                <Text className="text-base font-bold uppercase tracking-widest text-[#B85317]">
                  Share to Whatsapp
                </Text>
              </Pressable>

              {/* Stats Row */}
              <View className="mb-10 flex-row items-center gap-6 opacity-60">
                <Text className="text-sm font-bold text-text">
                  👁 {raw?.viewCount ?? raw?.views ?? 0}
                </Text>
                <Text className="text-sm font-bold text-text">
                  ❤ {raw?.likeCount ?? raw?.likes ?? 0}
                </Text>
                <Text className="text-sm font-bold text-text">
                  ✓{' '}
                  {Array.isArray(raw?.attestations)
                    ? raw.attestations.length
                    : (raw?.attestCount ?? raw?.checklist?.attestCount ?? 0)}{' '}
                  attestations
                </Text>
              </View>

              {tagList.length > 0 ? (
                <View className="mb-8 flex-row flex-wrap gap-2">
                  {tagList.map((t) => (
                    <View key={t} className="rounded-xl border border-border bg-surface px-4 py-2">
                      <Text className="text-xs font-bold text-text opacity-70">{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Body */}
              {insight.description ? (
                <>
                  <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                    The Story
                  </Text>
                  <Text className="mb-10 text-lg leading-relaxed text-text opacity-80">
                    {insight.description}
                  </Text>
                </>
              ) : null}

              {raw?.aiSummary ? (
                <View className="mb-10 rounded-2xl border border-border bg-white p-6">
                  <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                    AI Summary
                  </Text>
                  <Text className="text-sm leading-relaxed text-text opacity-80">
                    {raw.aiSummary}
                  </Text>
                </View>
              ) : null}

              {/* Related Insights */}
              {related.length > 0 ? (
                <>
                  <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                    Related Insights
                  </Text>
                  <View className="mb-10 gap-4">
                    {related.map((r) => {
                      const normalized = normalizeInsight(r);
                      return (
                        <Pressable
                          key={r.id}
                          onPress={() =>
                            router.push({
                              pathname: '/(app)/insight/[id]',
                              params: { id: r.id },
                            })
                          }
                          className="flex-row overflow-hidden rounded-[24px] border border-border bg-white"
                        >
                          {normalized.image ? (
                            <Image
                              source={{ uri: normalized.image }}
                              style={{ width: 96, height: 96 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-24 w-24 items-center justify-center bg-border/10">
                              <PinIcon size={20} color="#6B7280" />
                            </View>
                          )}
                          <View className="flex-1 p-4">
                            <View className="mb-1 flex-row items-center gap-1">
                              <PinIcon size={10} color="#6B7280" />
                              <Text
                                className="text-[10px] font-bold text-text opacity-40"
                                numberOfLines={1}
                              >
                                {normalized.location}
                              </Text>
                            </View>
                            <Text className="mb-2 font-bold text-text" numberOfLines={2}>
                              {normalized.title}
                            </Text>
                            <Text className="text-[10px] font-bold uppercase text-text opacity-40">
                              {normalized.user.name} · {normalized.time}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              {/* Final Actions */}
              <View className="mb-20 gap-4">
                <Pressable className="h-16 flex-row items-center justify-center gap-3 rounded-[24px] bg-brand">
                  <Text className="text-base font-bold text-white">Connect Advisor</Text>
                  <ExpertIcon size={20} />
                </Pressable>
                {typeof raw?.latitude === 'number' && typeof raw?.longitude === 'number' ? (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/(tabs)/map',
                        params: {
                          lat: String(raw.latitude),
                          lng: String(raw.longitude),
                          focusId: raw.id,
                        },
                      })
                    }
                    className="h-16 flex-row items-center justify-center gap-3 rounded-[24px] border border-border bg-surface-card"
                  >
                    <Text className="text-base font-bold text-text">View on Map</Text>
                    <MapTabIcon focused={false} color="#0D1B1E" />
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : (
            <View className="mb-20 items-center rounded-[32px] border border-[#E6DFB9] bg-[#FAF7E8] p-8">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-[#EAD093] bg-[#FAF1CC]">
                <LockIcon color="#B85317" size={28} />
              </View>
              <Text className="text-center text-2xl font-extrabold text-[#111827]">
                Full insight locked
              </Text>
              <Text className="mb-6 mt-2 px-4 text-center text-sm leading-relaxed text-[#4B5563]">
                {hasFreeViews
                  ? `You have ${freeViews?.available} of ${freeViews?.limit} free insight views available this month.`
                  : `You've used your ${freeViews?.limit ?? 3} free insight views this month.`}
              </Text>
              <View className="mb-8 w-full gap-3.5 px-2">
                {['Full data & metrics', 'Source citations', 'Growth narrative & story'].map(
                  (text, idx) => (
                    <View key={idx} className="flex-row items-center gap-3">
                      <CheckIcon color="#0E5A3A" size={16} />
                      <Text className="text-sm font-bold text-[#111827]">{text}</Text>
                    </View>
                  ),
                )}
              </View>
              <Pressable
                onPress={() => setModalDismissed(false)}
                className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-[#0E5A3A] shadow-sm active:opacity-90"
              >
                {hasFreeViews ? (
                  <GiftIcon color="white" size={18} />
                ) : (
                  <TokenWalletIcon color="white" size={18} />
                )}
                <Text className="text-base font-bold text-white">
                  {hasFreeViews ? 'Unlock with free view' : 'Unlock for 5 tokens'}
                </Text>
              </Pressable>
              <Text className="mt-4 text-center text-xs text-[#6B7280]">
                {freeViews
                  ? `${freeViews.used} of ${freeViews.limit} free views used · Resets ${resetDate}`
                  : `3 of 3 free views used · Resets ${resetDate}`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Flag insight modal */}
      <Modal
        visible={flagOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFlagOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/40"
        >
          <Pressable onPress={() => setFlagOpen(false)} className="flex-1" />
          <View className="rounded-t-[32px] bg-white p-6">
            {flagSuccess ? (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Thanks for flagging</Text>
                <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                  Our moderators will review this insight. You can keep browsing.
                </Text>
                <Pressable
                  onPress={() => setFlagOpen(false)}
                  className="h-14 items-center justify-center rounded-2xl bg-brand"
                >
                  <Text className="font-bold text-white">Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Flag this insight</Text>
                <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                  Let us know what's wrong. Moderators read every flag.
                </Text>

                <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  Reason
                </Text>
                <TextInput
                  className="mb-4 h-28 rounded-2xl border border-border bg-white p-4 text-text"
                  value={flagReason}
                  onChangeText={setFlagReason}
                  placeholder="e.g. Contains inaccurate data"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                />

                {flagError ? (
                  <Text className="mb-4 text-center text-sm font-medium text-danger">
                    {flagError}
                  </Text>
                ) : null}

                <View className="mb-6 gap-3">
                  <Pressable
                    onPress={submitFlag}
                    disabled={flagMutation.isPending}
                    className="h-14 items-center justify-center rounded-2xl bg-danger"
                  >
                    {flagMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="font-bold text-white">Submit flag</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setFlagOpen(false)}
                    className="h-14 items-center justify-center rounded-2xl border border-border bg-white"
                  >
                    <Text className="font-bold text-text">Cancel</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Unlock full insight bottom sheet modal */}
      <Modal
        visible={!isUnlocked && !modalDismissed}
        transparent
        animationType="slide"
        onRequestClose={() => setModalDismissed(true)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable onPress={() => setModalDismissed(true)} className="flex-1" />
          <View className="rounded-t-[32px] border-t border-border bg-surface-card p-6">
            <View className="items-center py-4">
              {/* Lock Icon */}
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DCF5EA]">
                <LockIcon color="#0E5A3A" size={28} />
              </View>

              {/* Title */}
              <Text className="mt-4 text-center text-2xl font-bold text-text">
                Unlock full insight
              </Text>
              <Text className="mt-2 px-4 text-center text-sm leading-normal text-text opacity-70">
                Full data, source citations & growth narrative.
              </Text>

              {/* Unlock Info Card */}
              <View className="my-6 w-full flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
                <View className="flex-row items-center gap-3">
                  {hasFreeViews ? (
                    <GiftIcon color="#0E5A3A" size={20} />
                  ) : (
                    <TokenWalletIcon color="#0E5A3A" size={20} />
                  )}
                  <Text className="text-sm font-extrabold text-text">This unlock</Text>
                </View>
                <Text
                  className={cn(
                    'text-sm font-extrabold',
                    hasFreeViews ? 'text-brand' : 'text-[#C14622]'
                  )}
                >
                  {hasFreeViews ? 'Free View' : '-5 tokens'}
                </Text>
              </View>

              {/* Balance Transition */}
              {hasFreeViews ? (
                <Text className="mb-6 text-center text-xs text-text opacity-60">
                  Free views remaining: {freeViews?.available} ➔ {(freeViews?.available ?? 1) - 1}
                </Text>
              ) : balance >= 5 ? (
                <Text className="mb-6 text-center text-xs text-text opacity-60">
                  Balance {balance} ➔ {balance - 5} tokens
                </Text>
              ) : (
                <Text className="mb-6 text-center text-xs font-bold text-danger">
                  Insufficient tokens (Current: {balance} tokens)
                </Text>
              )}

              {/* Action Button */}
              {hasFreeViews ? (
                <Pressable
                  onPress={handleUnlock}
                  disabled={unlockMutation.isPending}
                  className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
                >
                  {unlockMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <GiftIcon color="white" size={18} />
                      <Text className="text-base font-bold text-white">Confirm · Use Free View</Text>
                    </>
                  )}
                </Pressable>
              ) : balance >= 5 ? (
                <Pressable
                  onPress={handleUnlock}
                  disabled={unlockMutation.isPending}
                  className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
                >
                  {unlockMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <TokenWalletIcon color="white" size={18} />
                      <Text className="text-base font-bold text-white">Confirm · Spend 5</Text>
                    </>
                  )}
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setModalDismissed(true);
                    router.push('/wallet/buy');
                  }}
                  className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-[#FF812D] shadow-sm active:opacity-90"
                >
                  <Text className="text-base font-bold text-white">Get Tokens</Text>
                </Pressable>
              )}

              {/* Not now */}
              <Pressable
                onPress={() => setModalDismissed(true)}
                className="mt-5 py-2 active:opacity-60"
              >
                <Text className="text-sm font-extrabold text-brand">Not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

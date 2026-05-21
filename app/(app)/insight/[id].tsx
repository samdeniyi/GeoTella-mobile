import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackIcon,
  FlagIcon,
  ShareIcon,
  BookmarkIcon,
  CheckIcon,
  ExpertIcon,
  MapTabIcon,
  PinIcon,
  WhatsappIcon,
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
  useRecordViewMutation,
  useUnbookmarkInsightMutation,
} from '@/features/insights/api/insights-queries';
import { normalizeInsight } from '@/features/insights/normalize';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';

export default function InsightDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insightId = id ?? '';
  const insightQuery = useInsightQuery(insightId);
  const recordView = useRecordViewMutation();
  const likeMutation = useLikeInsightMutation();
  const bookmarkMutation = useBookmarkInsightMutation();
  const unbookmarkMutation = useUnbookmarkInsightMutation();
  const flagMutation = useFlagInsightMutation();

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

  const raw = useMemo(() => extractInsight(insightQuery.data), [insightQuery.data]);
  const insight = raw ? normalizeInsight(raw) : null;

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

  const isSaved = Boolean(raw?.bookmarked);
  const toggleSave = () => {
    if (isSaved) unbookmarkMutation.mutate(insightId);
    else bookmarkMutation.mutate(insightId);
  };
  const onLike = () => likeMutation.mutate(insightId);

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
                              <Text className="text-[10px] font-bold text-white">{initial}</Text>
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
            <View className="mb-10 flex-row items-center gap-3 rounded-2xl border border-border bg-white p-4">
              <Text className="text-brand">🔗</Text>
              <Text className="flex-1 font-bold text-brand" numberOfLines={1}>
                {sourceCitation}
              </Text>
            </View>
          ) : null}

          {/* Credibility */}
          <View className="mb-10 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-text opacity-60">
              Is this insight credible?
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={onLike}
                className="h-12 w-12 items-center justify-center rounded-xl border border-border bg-white"
              >
                <Text>👍</Text>
              </Pressable>
              <View className="h-12 w-12 items-center justify-center rounded-xl border border-border bg-white">
                <Text>👎</Text>
              </View>
            </View>
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
              <Text className="text-sm leading-relaxed text-text opacity-80">{raw.aiSummary}</Text>
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
        </View>
      </ScrollView>

      {/* Flag insight modal */}
      <Modal
        visible={flagOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFlagOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
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
        </View>
      </Modal>
    </View>
  );
}

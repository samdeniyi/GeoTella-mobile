import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import {
  ArrowRight,
  CheckIcon,
  Logo,
  SettingsIcon,
  ContributionsMenuIcon,
  NotificationsMenuIcon,
  PrivacyMenuIcon,
  SupportMenuIcon,
  SignOutMenuIcon,
  StarIcon,
  PinBadgeIcon,
  LayersIcon,
  TokenWalletIcon,
} from '@/components/ui/Icons';
import { extractNotifications } from '@/features/notifications/api/notifications-api';
import { useNotificationsQuery } from '@/features/notifications/api/notifications-queries';
import { extractProfile } from '@/features/profile/api/profile-api';
import {
  useProfileQuery,
  useUploadProfilePhotoMutation,
} from '@/features/profile/api/profile-queries';
import {
  unwrap,
  type AchievementsResponse,
  type BadgesResponse,
} from '@/features/users/api/users-api';
import { useMyAchievementsQuery, useMyBadgesQuery } from '@/features/users/api/users-queries';
import { cn } from '@/lib/cn';
import { useAuthStore, useUser, useUserRole } from '@/stores/auth-store';
import { useWalletDashboardQuery } from '@/features/wallet/api/wallet-queries';
import { unwrap as unwrapWallet } from '@/features/wallet/api/wallet-api';


const initials = (name?: string) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'GT';

const getFlagEmoji = (city?: string) => {
  if (!city) return '🇳🇬';
  const c = city.toLowerCase();
  if (c.includes('accra') || c.includes('ghana')) return '🇬🇭';
  if (c.includes('nairobi') || c.includes('kenya')) return '🇰🇪';
  if (c.includes('kigali') || c.includes('rwanda')) return '🇷🇼';
  return '🇳🇬';
};

const getBadgeIcon = (name: string, color: string) => {
  const n = name.toUpperCase();
  if (n.includes('EARLY BIRD')) {
    return <StarIcon color={color} size={28} />;
  }
  if (n.includes('LAGOS EXPERT')) {
    return <PinBadgeIcon color={color} size={28} />;
  }
  if (n.includes('DATA MAVEN')) {
    return <LayersIcon color={color} size={28} />;
  }
  return <StarIcon color={color} size={28} />;
};

export default function ProfileScreen() {
  const role = useUserRole();
  const user = useUser();
  const setRole = useAuthStore((s) => s.setRole);
  const signOut = useAuthStore((s) => s.signOut);
  const isExplorer = role === 'EXPLORER';

  const profileQuery = useProfileQuery();
  const uploadPhoto = useUploadProfilePhotoMutation();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);




  const pickProfilePhoto = async () => {
    setPhotoError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPhotoError('Permission to access your photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset) return;
    const rawName = asset.fileName ?? asset.uri.split('/').pop() ?? 'avatar';
    const lower = rawName.toLowerCase();
    const isPng = asset.mimeType === 'image/png' || lower.endsWith('.png');
    const type = isPng ? 'image/png' : 'image/jpeg';
    const ext = isPng ? 'png' : 'jpg';
    const stem = rawName.replace(/\.[^.]+$/, '');
    try {
      await uploadPhoto.mutateAsync({ uri: asset.uri, name: `${stem}.${ext}`, type });
    } catch {
      setPhotoError('Could not upload photo. Please try again.');
    }
  };

  const achievementsQuery = useMyAchievementsQuery();
  const badgesQuery = useMyBadgesQuery();
  const notifQuery = useNotificationsQuery();

  const profile = extractProfile(profileQuery.data);
  const achievements = unwrap<AchievementsResponse>(achievementsQuery.data);
  const badgesPayload = unwrap<BadgesResponse>(badgesQuery.data);
  const badges = badgesPayload?.badges ?? [];

  const firstName = profile?.firstName ?? user?.fullName?.split(' ')?.[0] ?? '';
  const lastName = profile?.lastName ?? '';
  const displayName =
    profile?.bio?.displayName ||
    `${firstName} ${lastName}`.trim() ||
    user?.fullName ||
    user?.email ||
    'Geotela User';
  const email = profile?.email ?? user?.email;
  const baseCity = profile?.bio?.baseCity ?? undefined;
  const organisation = profile?.bio?.organisation ?? undefined;
  const profilePhotoUrl = profile?.bio?.profilePhotoUrl ?? undefined;
  const username = profile?.username
    ? profile.username.includes('@')
      ? `@${profile.username.split('@')[0]}`
      : `@${profile.username}`
    : email
      ? `@${email.split('@')[0]}`
      : '';

  const currentLevel = achievements?.currentLevel;
  const nextLevel = achievements?.nextLevel;
  const progress = achievements?.progress;

  const insightsCount = isExplorer
    ? (achievements?.submissionCount ?? profile?.contributionCount ?? 0)
    : (profile?.contributionCount ?? 0);
  const verifiesCount = isExplorer
    ? (achievements?.verifiedInsightCount ?? profile?.verifiedInsightCount ?? 0)
    : (profile?.verifiedInsightCount ?? 0);

  const previewBadges = badges.slice(0, 3);

  const unreadCount = React.useMemo(() => {
    const allNotifs = extractNotifications(notifQuery.data);
    return allNotifs.filter((n) => n.isRead === false || n.read === false).length;
  }, [notifQuery.data]);

  // Tokens are a Growth Seeker concept — Explorers don't pay for insights, so
  // the wallet UI is hidden for them.
  const walletDashboard = useWalletDashboardQuery();
  const balance = unwrapWallet(walletDashboard.data)?.balance ?? 0;
  const showTokens = !isExplorer;

  const menuItems = [
    ...(showTokens
      ? [
          {
            id: 'token_wallet',
            label: 'Token Wallet',
            icon: TokenWalletIcon,
            value: `${balance} tokens`,
          },
        ]
      : []),
    { id: 'contributions', label: 'My Contributions', icon: ContributionsMenuIcon },
    { id: 'notifications', label: 'Notifications', icon: NotificationsMenuIcon },
    { id: 'privacy', label: 'Data & privacy', icon: PrivacyMenuIcon },
    { id: 'support', label: 'Support & About', icon: SupportMenuIcon },
    {
      id: 'signout',
      label: 'Sign out',
      icon: SignOutMenuIcon,
      color: 'text-accent',
      isSignOut: true,
    },
  ];

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-6 py-2">
        <Logo />
        <View className="flex-row items-center gap-3">
          {showTokens ? (
            <Pressable
              onPress={() => router.push('/wallet')}
              className="flex-row items-center gap-1.5 rounded-full border border-brand/20 bg-[#DCF5EA]/60 px-3.5 py-1.5"
            >
              <View className="h-5 w-5 items-center justify-center rounded-full bg-brand">
                <TokenWalletIcon color="white" size={11} />
              </View>
              <Text className="text-sm font-bold text-brand">{balance}</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => router.push('/settings')}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
          >
            <SettingsIcon size={20} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {profileQuery.isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : null}

        <View className="items-center py-10">
          <View className="relative">
            {profilePhotoUrl ? (
              <Image
                source={{ uri: profilePhotoUrl }}
                style={{ width: 112, height: 112, borderRadius: 56 }}
              />
            ) : (
              <View
                className={cn(
                  'h-28 w-28 items-center justify-center rounded-full shadow-lg',
                  isExplorer ? 'bg-accent' : 'bg-brand',
                )}
              >
                <Text className="text-5xl font-bold text-white opacity-90">
                  {initials(displayName)}
                </Text>
              </View>
            )}
            <Pressable
              onPress={pickProfilePhoto}
              disabled={uploadPhoto.isPending}
              className="absolute bottom-1 right-1 h-10 w-10 items-center justify-center rounded-full border-4 border-surface bg-[#0E5A3A]"
            >
              {uploadPhoto.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View className="h-5 w-5 items-center justify-center">
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2.5" />
                  </Svg>
                </View>
              )}
            </Pressable>
          </View>

          {photoError ? (
            <Text className="mt-3 text-center text-xs font-medium text-danger">{photoError}</Text>
          ) : null}

          <View className="mt-6 flex-row items-center gap-2">
            <Text className="text-3xl font-extrabold text-text">{displayName}</Text>
            {profile?.emailVerifiedAt ? (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-brand">
                <CheckIcon size={14} color="white" />
              </View>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-sm font-bold text-text opacity-50">
              {getFlagEmoji(baseCity)} {username}
              {baseCity ? ` · ${baseCity}` : ''}
              {!baseCity && organisation ? ` · ${organisation}` : ''}
            </Text>
          </View>

          <View
            className={cn(
              'mt-6 flex-row items-center gap-2 rounded-full px-6 py-3',
              isExplorer ? 'bg-[#FBE2D6]' : 'bg-[#DCF5EA]',
            )}
          >
            <Text className={cn('text-xs', isExplorer ? 'text-accent' : 'text-brand')}>
              {isExplorer ? '🎯' : '📈'}
            </Text>
            <Text
              className={cn(
                'text-xs font-bold tracking-tight',
                isExplorer ? 'text-accent' : 'text-brand',
              )}
            >
              {isExplorer ? 'Intelligent Explorer' : 'Growth & Investment Seeker'}
            </Text>
          </View>
        </View>

        {/* Explorer level card */}
        {isExplorer && currentLevel ? (
          <View className="mx-6 mb-8 rounded-[32px] border-2 border-accent bg-surface-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  LEVEL {currentLevel.number}
                </Text>
                <Text className="text-xl font-bold text-text">{currentLevel.name}</Text>
              </View>
              {progress ? (
                <View className="flex-row items-center gap-1.5 rounded-xl bg-[#FBE2D6] px-3 py-1.5">
                  <Text className="text-xs">🔥</Text>
                  <Text className="text-sm font-bold text-accent">{progress.current}</Text>
                </View>
              ) : null}
            </View>
            {progress ? (
              <View className="mb-2 h-3 w-full rounded-full bg-border/20">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${progress.percent}%` }}
                />
              </View>
            ) : null}
            {progress && nextLevel ? (
              <Text className="text-right text-[10px] font-bold uppercase text-text opacity-40">
                {progress.current}/{progress.required} {progress.unit.toUpperCase()} TO LEVEL{' '}
                {nextLevel.number} · {nextLevel.name.toUpperCase()}
              </Text>
            ) : achievements?.isMaxLevel ? (
              <Text className="text-right text-[10px] font-bold uppercase text-text opacity-40">
                MAX LEVEL REACHED
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Unified Stats Card */}
        <View className="mx-6 mb-6 mt-2 flex-row items-center rounded-[40px] border border-border bg-surface-card py-8">
          <View className="flex-1 items-center justify-center">
            <Text className="mb-1 text-3xl font-extrabold text-text">{insightsCount}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              {isExplorer ? 'STORIES' : 'INSIGHTS'}
            </Text>
          </View>
          <View className="h-12 w-[1px] bg-border" />
          <View className="flex-1 items-center justify-center">
            <Text className="mb-1 text-3xl font-extrabold text-text">{verifiesCount}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              VERIFIES
            </Text>
          </View>
          {!isExplorer ? (
            <>
              <View className="h-12 w-[1px] bg-border" />
              <View className="flex-1 items-center justify-center">
                <Text className="mb-1 text-3xl font-extrabold text-brand">
                  {(profile?.trustScore as number | undefined) ?? 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  TRUST SCORE
                </Text>
              </View>
            </>
          ) : null}
        </View>



        {/* Network / Focus cards — backend doesn't expose these yet, leave commented for now.
        {!isExplorer && (
          <View className="mb-8 flex-row gap-3 px-6">
            <View className="flex-1 rounded-[32px] bg-[#F2EAD1] p-6">
              <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                NETWORK
              </Text>
              <Text className="text-lg font-bold text-text">— Connections</Text>
            </View>
            <View className="flex-1 rounded-[32px] bg-[#F2EAD1] p-6">
              <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                FOCUS
              </Text>
              <Text className="text-lg font-bold text-text">{profile?.bio?.focusSectors?.[0] ?? '—'}</Text>
            </View>
          </View>
        )}
        */}

        {/* Collection — explorers only for now. Growth seekers don't use
            professional credentials yet. */}
        {isExplorer && previewBadges.length > 0 ? (
          <View className="mb-10 px-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                COLLECTION
              </Text>
              <Pressable onPress={() => router.push('/achievements')}>
                <Text className="text-xs font-bold text-brand">View all</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              {previewBadges.map((b) => (
                <View
                  key={b.type}
                  className={cn(
                    'h-32 flex-1 items-center justify-center rounded-[32px] border-2 p-3',
                    b.earned
                      ? 'border-accent bg-[#FFF5F0]'
                      : 'border-border/50 bg-[#E5DFD3]/20 opacity-60',
                  )}
                >
                  <View className="mb-2">
                    {getBadgeIcon(b.name, b.earned ? '#0D1B1E' : '#6B7280')}
                  </View>
                  <Text
                    className="text-center text-[10px] font-bold uppercase leading-tight text-text"
                    numberOfLines={2}
                  >
                    {b.name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Audit trail / Journal — backend doesn't expose this yet, leave commented.
        <View className="mb-10 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              {isExplorer ? 'JOURNAL' : 'AUDIT TRAIL'}
            </Text>
            <Text className="text-xs font-bold text-brand">Export report</Text>
          </View>
          <View className="gap-6 rounded-[32px] border border-border bg-white p-6">
            <Text className="text-xs text-text opacity-40">Recent activity will appear here.</Text>
          </View>
        </View>
        */}

        <Pressable
          onPress={() => setRole(isExplorer ? 'GROWTH_SEEKER' : 'EXPLORER')}
          className="mx-6 mb-10 h-20 flex-row items-center justify-between rounded-[32px] border border-emerald-100 bg-emerald-50 px-6"
        >
          <View className="flex-row items-center gap-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Text>🔄</Text>
            </View>
            <View>
              <Text className="font-bold text-text">Switch Experience</Text>
              <Text className="text-xs text-text opacity-40">
                Switch to {isExplorer ? 'Growth & Investment Seeker' : 'Intelligent Explorer'}
              </Text>
            </View>
          </View>
          <ArrowRight size={20} color="#0B4A33" />
        </Pressable>

        <View className="mb-20 px-6">
          <Text className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
            PREFERENCES & ACCOUNT
          </Text>
          <View className="gap-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.id}
                  disabled={item.id === 'signout' && signingOut}
                  onPress={async () => {
                    if (item.id === 'token_wallet') router.push('/wallet');
                    if (item.id === 'contributions') router.push('/contributions');
                    if (item.id === 'notifications') router.push('/notifications');
                    if (item.id === 'privacy') router.push('/privacy');
                    if (item.id === 'support') router.push('/support');
                    if (item.id === 'signout') {
                      setSigningOut(true);
                      try {
                        await signOut();
                        router.replace('/(auth)/login');
                      } finally {
                        setSigningOut(false);
                      }
                    }
                  }}
                  className={cn(
                    'flex-row items-center justify-between border-b border-border/30 py-5',
                    item.id === 'signout' && signingOut ? 'opacity-60' : '',
                  )}
                >
                  <View className="flex-row items-center gap-4">
                    <View
                      className={cn(
                        'h-12 w-12 items-center justify-center rounded-2xl border',
                        item.isSignOut
                          ? 'border-[#F8DCCB] bg-[#FFF5F0]'
                          : 'border-border bg-[#F3EAD8]/50',
                      )}
                    >
                      {item.id === 'signout' && signingOut ? (
                        <ActivityIndicator color="#E85A2D" />
                      ) : (
                        <IconComponent color={item.isSignOut ? '#E85A2D' : '#0E5A3A'} size={22} />
                      )}
                    </View>
                    <Text className={cn('text-base font-bold', item.color || 'text-text')}>
                      {item.id === 'signout' && signingOut ? 'Signing out…' : item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    {item.value ? (
                      <Text className="mr-1 text-sm font-bold text-brand">{item.value}</Text>
                    ) : null}
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <View
                        className={cn(
                          'h-6 min-w-[24px] items-center justify-center rounded-full px-2',
                          isExplorer ? 'bg-accent' : 'bg-brand',
                        )}
                      >
                        <Text className="text-xs font-bold text-white">{unreadCount}</Text>
                      </View>
                    )}
                    <ArrowRight size={16} color="#0D1B1E" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>


    </View>
  );
}

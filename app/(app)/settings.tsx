import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowRight, BackIcon, EyeIcon } from '@/components/ui/Icons';
import { OTPInput } from '@/components/ui/OTPInput';
import {
  useChangePasswordMutation,
  useRequestChangePasswordOtpMutation,
} from '@/features/auth/api/auth-queries';
import {
  unwrapSettings,
  type NotificationPrefs,
  type PrivacyPrefs,
} from '@/features/settings/api/settings-api';
import {
  useDeleteAccountMutation,
  useUpdateNotificationPrefsMutation,
  useUpdatePrivacyPrefsMutation,
  useUpdateUserInfoMutation,
  useUserSettingsQuery,
} from '@/features/settings/api/settings-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useAuthStore, useUserRole } from '@/stores/auth-store';

type LinkItem = {
  kind: 'link';
  label: string;
  subLabel?: string;
  href?: Href;
  onPress?: () => void;
};
type ToggleItem = {
  kind: 'toggle';
  label: string;
  subLabel?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (v: boolean) => void;
};
type TextItem = { kind: 'text'; label: string; subLabel: string };
type Item = LinkItem | ToggleItem | TextItem;
type Section = { title: string; items: Item[] };

type ChangePasswordStep = 'request' | 'verify' | 'done';

export default function SettingsScreen() {
  const router = useRouter();
  const role = useUserRole();
  const signOut = useAuthStore((s) => s.signOut);
  const isExplorer = role === 'EXPLORER';
  const accentColor = isExplorer ? '#E85A2D' : '#0E5A3A';

  const settingsQuery = useUserSettingsQuery();
  const settings = unwrapSettings(settingsQuery.data);

  const updateUserInfo = useUpdateUserInfoMutation();
  const updateNotifs = useUpdateNotificationPrefsMutation();
  const updatePrivacy = useUpdatePrivacyPrefsMutation();
  const deleteAccount = useDeleteAccountMutation();
  const requestChangeOtp = useRequestChangePasswordOtpMutation();
  const changePassword = useChangePasswordMutation();

  const appVersion = useMemo(
    () =>
      (Constants.expoConfig?.version as string | undefined) ??
      (Constants.manifest2?.extra?.expoClient?.version as string | undefined) ??
      '1.0.0',
    [],
  );

  // Local copies so toggles feel instant and survive the round-trip.
  const [notifs, setNotifs] = useState<NotificationPrefs>({
    emailNotificationsEnabled: false,
    pushNotificationsEnabled: true,
  });
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    locationPrivacyMode: 'PRECISE',
    shareUsageData: false,
  });

  useEffect(() => {
    if (settings?.notifications) setNotifs(settings.notifications);
    if (settings?.privacy) setPrivacy(settings.privacy);
  }, [settings?.notifications, settings?.privacy]);

  // Edit profile modal state.
  const [editOpen, setEditOpen] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = () => {
    const u = settings?.user as Record<string, unknown> | undefined;
    setEditFirst(((u?.firstName as string | undefined) ?? '') as string);
    setEditLast(((u?.lastName as string | undefined) ?? '') as string);
    setEditPhone(((u?.phoneNumber as string | undefined) ?? '') as string);
    setEditError(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditError(null);
    try {
      await updateUserInfo.mutateAsync({
        firstName: editFirst.trim() || undefined,
        lastName: editLast.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
      });
      setEditOpen(false);
    } catch (e) {
      setEditError(getErrorMessage(e, 'Could not save your changes.'));
    }
  };

  // Change password modal state.
  const [pwOpen, setPwOpen] = useState(false);
  const [pwStep, setPwStep] = useState<ChangePasswordStep>('request');
  const [pwOtp, setPwOtp] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwShow, setPwShow] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const openChangePassword = () => {
    setPwStep('request');
    setPwOtp('');
    setPwNew('');
    setPwConfirm('');
    setPwShow(false);
    setPwError(null);
    setPwOpen(true);
  };

  const requestOtp = async () => {
    setPwError(null);
    try {
      await requestChangeOtp.mutateAsync();
      setPwStep('verify');
    } catch (e) {
      setPwError(getErrorMessage(e, 'Could not send code. Please try again.'));
    }
  };

  const submitNewPassword = async () => {
    setPwError(null);
    if (pwOtp.length < 4) {
      setPwError('Enter the code we sent to your email.');
      return;
    }
    if (pwNew.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      await changePassword.mutateAsync({ password: pwNew, otp: pwOtp });
      setPwStep('done');
    } catch (e) {
      setPwError(getErrorMessage(e, 'Could not change password. Please try again.'));
    }
  };

  // Sign the user out after a successful password change so they re-authenticate
  // with the new credentials. Triggered from the "Done" button on the success step.
  const finishChangePassword = async () => {
    setPwOpen(false);
    await signOut();
    router.replace('/(auth)/login');
  };

  // Delete account modal state.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    setDeleteError(null);
    if (deletePhrase !== 'DELETE') {
      setDeleteError('Type DELETE to confirm.');
      return;
    }
    try {
      await deleteAccount.mutateAsync('DELETE');
      await signOut();
      router.replace('/(auth)/login');
    } catch (e) {
      setDeleteError(getErrorMessage(e, 'Could not delete account.'));
    }
  };

  const toggleEmail = (v: boolean) => {
    setNotifs((p) => ({ ...p, emailNotificationsEnabled: v }));
    updateNotifs.mutate(
      { emailNotificationsEnabled: v },
      { onError: () => setNotifs((p) => ({ ...p, emailNotificationsEnabled: !v })) },
    );
  };

  const togglePush = (v: boolean) => {
    setNotifs((p) => ({ ...p, pushNotificationsEnabled: v }));
    updateNotifs.mutate(
      { pushNotificationsEnabled: v },
      { onError: () => setNotifs((p) => ({ ...p, pushNotificationsEnabled: !v })) },
    );
  };

  const toggleUsage = (v: boolean) => {
    setPrivacy((p) => ({ ...p, shareUsageData: v }));
    updatePrivacy.mutate(
      { shareUsageData: v },
      { onError: () => setPrivacy((p) => ({ ...p, shareUsageData: !v })) },
    );
  };

  const sections: Section[] = [
    {
      title: 'Account Management',
      items: [
        { kind: 'link', label: 'Edit Profile', onPress: openEdit },
        { kind: 'link', label: 'Change Password', onPress: openChangePassword },
      ],
    },
    {
      title: 'Notification Preferences',
      items: [
        {
          kind: 'toggle',
          label: 'Push Notifications',
          subLabel: 'Receive alerts on your device',
          value: notifs.pushNotificationsEnabled,
          onValueChange: togglePush,
        },
        {
          kind: 'toggle',
          label: 'Email Notifications',
          subLabel: 'Weekly summaries and major updates',
          value: notifs.emailNotificationsEnabled,
          onValueChange: toggleEmail,
        },
      ],
    },
    {
      title: 'Data Privacy & Security',
      items: [
        { kind: 'link', label: 'Privacy Policy', onPress: () => router.push('/privacy') },
        {
          kind: 'toggle',
          label: 'Share Usage Data',
          subLabel: 'Help us improve GeoTela',
          value: privacy.shareUsageData,
          onValueChange: toggleUsage,
        },
      ],
    },
    {
      title: 'Support & Info',
      items: [
        { kind: 'link', label: 'Help Center', onPress: () => router.push('/support') },
        { kind: 'text', label: 'About GeoTela', subLabel: `v${appVersion}` },
      ],
    },
  ];
  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="flex-row items-center gap-6 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-2xl font-bold text-text">Settings</Text>
      </SafeAreaView>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {settingsQuery.isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator color={accentColor} />
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.title} className="mt-8">
            <Text className="mb-4 text-lg font-bold text-text">{section.title}</Text>
            <View className="overflow-hidden rounded-[24px] border border-border bg-surface-card">
              {section.items.map((item, itemIdx) => {
                const rowClass = cn(
                  'flex-row items-center justify-between px-6 py-5',
                  itemIdx !== section.items.length - 1 && 'border-b border-border/50',
                );
                const labelBlock = (
                  <View className="mr-4 flex-1">
                    <Text className="text-base font-bold text-text">{item.label}</Text>
                    {item.subLabel && (
                      <Text className="mt-0.5 text-xs text-text opacity-40">{item.subLabel}</Text>
                    )}
                  </View>
                );

                if (item.kind === 'link') {
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => {
                        if (item.onPress) item.onPress();
                        else if (item.href) router.push(item.href);
                      }}
                      className={rowClass}
                    >
                      {labelBlock}
                      <ArrowRight size={16} color="#0D1B1E" />
                    </Pressable>
                  );
                }

                return (
                  <View key={item.label} className={rowClass}>
                    {labelBlock}
                    {item.kind === 'toggle' ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        disabled={item.disabled}
                        trackColor={{ false: '#DCD9CE', true: accentColor }}
                        ios_backgroundColor="#DCD9CE"
                        thumbColor="#FFFFFF"
                      />
                    ) : (
                      <Text className="text-sm text-text opacity-40">{item.subLabel}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <Pressable
          onPress={() => setDeleteOpen(true)}
          className="mb-20 mt-12 h-16 items-center justify-center rounded-2xl border border-border bg-surface-card"
        >
          <Text className="text-base font-bold text-danger">Delete Account</Text>
        </Pressable>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditOpen(false)}
      >
        <Pressable onPress={() => setEditOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable
            onPress={() => {
              /* keep open */
            }}
            className="rounded-t-[32px] bg-surface-card p-6"
          >
            <Text className="mb-6 text-2xl font-bold text-text">Edit profile</Text>

            <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              First name
            </Text>
            <TextInput
              className="mb-4 rounded-2xl border border-border bg-surface-input p-4 text-text"
              value={editFirst}
              onChangeText={setEditFirst}
              placeholder="John"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              Last name
            </Text>
            <TextInput
              className="mb-4 rounded-2xl border border-border bg-surface-input p-4 text-text"
              value={editLast}
              onChangeText={setEditLast}
              placeholder="Doe"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              Phone number
            </Text>
            <TextInput
              className="mb-6 rounded-2xl border border-border bg-surface-input p-4 text-text"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#9CA3AF"
            />

            {editError ? (
              <Text className="mb-4 text-center text-sm font-medium text-danger">{editError}</Text>
            ) : null}

            <View className="mb-6 gap-3">
              <Pressable
                onPress={saveEdit}
                disabled={updateUserInfo.isPending}
                className={cn(
                  'h-14 items-center justify-center rounded-2xl',
                  isExplorer ? 'bg-accent' : 'bg-brand',
                )}
              >
                {updateUserInfo.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-bold text-white">Save changes</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setEditOpen(false)}
                className="h-14 items-center justify-center rounded-2xl border border-border bg-surface-card"
              >
                <Text className="font-bold text-text">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Change password modal */}
      <Modal
        visible={pwOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPwOpen(false)}
      >
        <Pressable onPress={() => setPwOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable
            onPress={() => {
              /* keep open */
            }}
            className="rounded-t-[32px] bg-surface-card p-6"
          >
            {pwStep === 'request' ? (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Change password</Text>
                <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                  We'll send a 6-digit code to your email. Enter it on the next screen with your new
                  password.
                </Text>

                {pwError ? (
                  <Text className="mb-4 text-center text-sm font-medium text-danger">
                    {pwError}
                  </Text>
                ) : null}

                <View className="mb-6 gap-3">
                  <Pressable
                    onPress={requestOtp}
                    disabled={requestChangeOtp.isPending}
                    className={cn(
                      'h-14 items-center justify-center rounded-2xl',
                      isExplorer ? 'bg-accent' : 'bg-brand',
                    )}
                  >
                    {requestChangeOtp.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="font-bold text-white">Send code</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setPwOpen(false)}
                    className="h-14 items-center justify-center rounded-2xl border border-border bg-surface-card"
                  >
                    <Text className="font-bold text-text">Cancel</Text>
                  </Pressable>
                </View>
              </>
            ) : pwStep === 'verify' ? (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Enter code & new password</Text>
                <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                  Enter the code we sent to your email and choose a new password.
                </Text>

                <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  Verification code
                </Text>
                <View className="mb-6">
                  <OTPInput value={pwOtp} onChange={setPwOtp} error={false} />
                </View>

                <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  New password
                </Text>
                <View className="mb-4 flex-row items-center rounded-2xl border border-border bg-surface-input px-4">
                  <TextInput
                    className="flex-1 py-4 text-text"
                    value={pwNew}
                    onChangeText={setPwNew}
                    secureTextEntry={!pwShow}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setPwShow(!pwShow)} hitSlop={8}>
                    <EyeIcon color={pwShow ? accentColor : '#6B7280'} />
                  </Pressable>
                </View>

                <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
                  Confirm password
                </Text>
                <TextInput
                  className="mb-6 rounded-2xl border border-border bg-surface-input p-4 text-text"
                  value={pwConfirm}
                  onChangeText={setPwConfirm}
                  secureTextEntry={!pwShow}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />

                {pwError ? (
                  <Text className="mb-4 text-center text-sm font-medium text-danger">
                    {pwError}
                  </Text>
                ) : null}

                <View className="mb-6 gap-3">
                  <Pressable
                    onPress={submitNewPassword}
                    disabled={changePassword.isPending}
                    className={cn(
                      'h-14 items-center justify-center rounded-2xl',
                      isExplorer ? 'bg-accent' : 'bg-brand',
                    )}
                  >
                    {changePassword.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="font-bold text-white">Update password</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={requestOtp}
                    disabled={requestChangeOtp.isPending}
                    className="h-14 items-center justify-center rounded-2xl border border-border bg-surface-card"
                  >
                    <Text className="font-bold text-text">
                      {requestChangeOtp.isPending ? 'Resending…' : 'Resend code'}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text className="mb-2 text-2xl font-bold text-text">Password updated</Text>
                <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
                  Your password has been changed. You'll be signed out so you can log back in with
                  the new password.
                </Text>
                <Pressable
                  onPress={finishChangePassword}
                  className={cn(
                    'mb-6 h-14 items-center justify-center rounded-2xl',
                    isExplorer ? 'bg-accent' : 'bg-brand',
                  )}
                >
                  <Text className="font-bold text-white">Sign in again</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete account modal */}
      <Modal
        visible={deleteOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteOpen(false)}
      >
        <Pressable onPress={() => setDeleteOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable
            onPress={() => {
              /* keep open */
            }}
            className="rounded-t-[32px] bg-surface-card p-6"
          >
            <Text className="mb-2 text-2xl font-bold text-danger">Delete your account?</Text>
            <Text className="mb-6 text-sm leading-relaxed text-text opacity-70">
              This will permanently delete your account, contributions, and personal data. This
              action cannot be undone. Type <Text className="font-bold text-danger">DELETE</Text>{' '}
              below to confirm.
            </Text>

            <TextInput
              className="mb-4 rounded-2xl border border-border bg-surface-input p-4 text-text"
              value={deletePhrase}
              onChangeText={setDeletePhrase}
              autoCapitalize="characters"
              placeholder="Type DELETE"
              placeholderTextColor="#9CA3AF"
            />

            {deleteError ? (
              <Text className="mb-4 text-center text-sm font-medium text-danger">
                {deleteError}
              </Text>
            ) : null}

            <View className="mb-6 gap-3">
              <Pressable
                onPress={confirmDelete}
                disabled={deleteAccount.isPending}
                className="h-14 items-center justify-center rounded-2xl bg-danger"
              >
                {deleteAccount.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-bold text-white">Delete account</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setDeleteOpen(false)}
                className="h-14 items-center justify-center rounded-2xl border border-border bg-surface-card"
              >
                <Text className="font-bold text-text">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

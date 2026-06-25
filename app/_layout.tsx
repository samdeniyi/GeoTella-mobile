import '../global.css';

import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden */
});

const rawStripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const isSecretStripeKey = rawStripeKey.startsWith('sk_');

if (isSecretStripeKey) {
  console.error(
    'CRITICAL WARNING: You have configured a Stripe SECRET key (starting with "sk_") in your client-side environment (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY). This is a severe security risk and causes the Stripe SDK to crash the app on launch. Please replace it with your Stripe PUBLISHABLE key (starting with "pk_").'
  );
}

const STRIPE_PUBLISHABLE_KEY = isSecretStripeKey
  ? 'pk_test_please_use_publishable_key_instead_of_secret_key'
  : rawStripeKey;

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;
    void SplashScreen.hideAsync();
  }, [status]);

  // Ask for location permission once at launch so the map/feed have it ready
  // by the time the user opens them. Only prompts if the OS hasn't already
  // recorded a decision (granted or denied), so we don't pester users.
  useEffect(() => {
    void (async () => {
      try {
        const existing = await Location.getForegroundPermissionsAsync();
        if (existing.status === 'undetermined' || existing.canAskAgain) {
          if (existing.status !== 'granted') {
            await Location.requestForegroundPermissionsAsync();
          }
        }
      } catch {
        // ignore — permission can still be requested later from the feature.
      }
    })();
  }, []);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    const isSignupOnboarding =
      segments.join('/').includes('signup/select-role') ||
      segments.join('/').includes('signup/details');

    if (status === 'authenticated' && inAuthGroup && !isSignupOnboarding) {
      router.replace('/(app)/(tabs)/map');
    } else if (status === 'unauthenticated' && inAppGroup) {
      router.replace('/(auth)/onboarding');
    }
  }, [status, segments, router]);

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </QueryClientProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/auth-store';

export default function Index() {
  const status = useAuthStore((s) => s.status);
  if (status === 'authenticated') return <Redirect href="/(app)/(tabs)/map" />;
  return <Redirect href="/(auth)/onboarding" />;
}

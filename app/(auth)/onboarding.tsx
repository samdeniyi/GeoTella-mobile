import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Logo, ArrowRight } from '@/components/ui/Icons';

export default function Onboarding() {
  return (
    <Screen className="px-6 py-10" scroll>
      <View className="py-10">
        <Logo />
      </View>

      <View className="mb-12 flex-row items-center gap-2">
        <View
          className="h-3 w-3 rounded-full bg-success"
          style={{
            shadowColor: '#16A34A',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          }}
        />
        <Text className="text-xs font-bold uppercase tracking-widest text-brand opacity-80">
          Live Location Intelligence
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-[52px] font-bold leading-[56px] text-text">
          Global Growth, <Text className="text-accent">Mapped.</Text>
        </Text>
      </View>

      <Text className="mb-12 text-lg leading-relaxed text-text opacity-70">
        The intelligence platform for discovering and verifying high-growth locations around the
        world.
      </Text>

      {/* Stats Card */}
      <View className="mb-12 flex-row items-center justify-between rounded-3xl border border-border bg-surface-card p-6 py-8">
        <View className="flex-1 items-center border-r border-border px-2">
          <Text className="text-3xl font-bold text-text">50+</Text>
          <Text className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-50">
            Countries
          </Text>
        </View>
        <View className="flex-1 items-center border-r border-border px-2">
          <Text className="text-3xl font-bold text-text">1,284</Text>
          <Text className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-50">
            Insights
          </Text>
        </View>
        <View className="flex-1 items-center px-2">
          <Text className="text-3xl font-bold text-text">562</Text>
          <Text className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text opacity-50">
            Mappers
          </Text>
        </View>
      </View>

      <View className="gap-4 pb-10">
        <Link href="/(auth)/signup" asChild>
          <Button label="Get Started Free" rightIcon={<ArrowRight size={20} />} />
        </Link>
        <Link href="/(auth)/login" asChild>
          <Button label="I already have an account" variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}

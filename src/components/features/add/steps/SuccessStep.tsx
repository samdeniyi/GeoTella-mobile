import { View, Text, Pressable } from 'react-native';

import { ArrowRight, CheckIcon } from '@/components/ui/Icons';

type Props = {
  onDone: () => void;
  onViewContributions?: () => void;
};

const STATS = [
  { label: 'Verifiers', value: '3' },
  { label: 'Est. Review', value: '48h' },
  { label: 'XP Earned', value: '+12' },
];

export function SuccessStep({ onDone, onViewContributions }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="mb-10 h-32 w-32 items-center justify-center rounded-full bg-green-500 shadow-2xl shadow-green-500/40">
        <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/20">
          <CheckIcon size={40} color="white" />
        </View>
      </View>

      <Text className="mb-4 text-center text-4xl font-bold text-text">Submitted for review.</Text>

      <Text className="mb-12 text-center text-lg leading-relaxed text-text opacity-40">
        Your insight will be reviewed by <Text className="font-bold text-brand">3 verifiers</Text>{' '}
        near London. Typical review time: 48 hours.
      </Text>

      <View className="mb-12 flex-row gap-4">
        {STATS.map((s) => (
          <View
            key={s.label}
            className="flex-1 items-center justify-center rounded-3xl border border-border bg-white p-6"
          >
            <Text className="mb-1 text-2xl font-bold text-brand">{s.value}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onDone}
        className="mb-8 h-16 w-full flex-row items-center justify-center gap-3 rounded-[24px] bg-brand"
      >
        <Text className="text-base font-bold text-white">Back to Map</Text>
        <ArrowRight size={20} color="white" />
      </Pressable>

      <Pressable onPress={onViewContributions} disabled={!onViewContributions}>
        <Text className="text-sm font-bold text-text opacity-60">View my contributions →</Text>
      </Pressable>
    </View>
  );
}

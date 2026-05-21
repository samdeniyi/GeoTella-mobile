import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { BackIcon } from './Icons';

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      className={cn(
        'active:bg-surface-DEFAULT h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-card',
        className,
      )}
    >
      <BackIcon size={20} />
    </Pressable>
  );
}

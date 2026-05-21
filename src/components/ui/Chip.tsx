import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

import { CheckIcon } from './Icons';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
  variant?: 'primary' | 'accent';
};

export function Chip({ label, selected, onPress, className, variant = 'primary' }: ChipProps) {
  const activeBg = variant === 'primary' ? 'bg-[#DCF5EA]' : 'bg-[#FBE2D6]';
  const activeBorder = variant === 'primary' ? 'border-brand' : 'border-[#D9430F]';
  const activeText = variant === 'primary' ? 'text-brand' : 'text-accent';

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center rounded-full border border-border px-5 py-3',
        selected ? `${activeBg} ${activeBorder}` : 'bg-surface-card',
        className,
      )}
    >
      {selected && (
        <View className="mr-2">
          <CheckIcon size={14} color={variant === 'primary' ? '#0B4A33' : '#E85A2D'} />
        </View>
      )}
      <Text className={cn('text-sm font-semibold', selected ? activeText : 'opacity-70')}>
        {label}
      </Text>
    </Pressable>
  );
}

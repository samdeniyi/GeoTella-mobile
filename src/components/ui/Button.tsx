import React from 'react';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  labelClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-brand active:bg-brand-dark',
  secondary: 'bg-surface-card active:bg-surface-DEFAULT border border-border',
  outline: 'bg-transparent border border-border active:bg-surface-DEFAULT',
  ghost: 'bg-transparent active:bg-surface-DEFAULT',
  danger: 'bg-danger active:opacity-80',
};

const labelByVariant: Record<Variant, string> = {
  primary: 'text-text-light',
  secondary: 'text-text',
  outline: 'text-text',
  ghost: 'text-brand',
  danger: 'text-white',
};

const sizeContainer: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
  xl: 'h-16 px-8',
};

const sizeLabel: Record<Size, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-bold',
  xl: 'text-xl font-bold',
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled,
  className,
  labelClassName,
  leftIcon,
  rightIcon,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center rounded-2xl',
        containerByVariant[variant],
        sizeContainer[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#0B4A33'}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          <Text className={cn(labelByVariant[variant], sizeLabel[size], labelClassName)}>
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

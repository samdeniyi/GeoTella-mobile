import { forwardRef, ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/cn';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  rightElement?: ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, containerClassName, className, rightElement, ...rest },
  ref,
) {
  return (
    <View className={cn('w-full', containerClassName)}>
      {label ? (
        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-text opacity-70">
          {label}
        </Text>
      ) : null}
      <View className="relative justify-center">
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className={cn(
            'h-14 rounded-2xl border bg-surface-input px-4 text-base text-text',
            error ? 'border-danger' : 'border-border focus:border-brand',
            className,
          )}
          {...rest}
        />
        {rightElement && (
          <View className="absolute right-4 items-center justify-center">{rightElement}</View>
        )}
      </View>
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-text-muted">{hint}</Text>
      ) : null}
    </View>
  );
});

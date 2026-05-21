import { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';

type OTPInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  error?: boolean;
};

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  error = false,
}: OTPInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, length);
    onChange(digits);
  };

  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  const focusedIndex = Math.min(value.length, length - 1);

  return (
    <Pressable className="w-full" onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        maxLength={length}
        // Render the native input invisibly — styled cells below mirror its value.
        className="absolute h-px w-px opacity-0"
      />
      <View className="flex-row justify-between">
        {cells.map((digit, idx) => (
          <View
            key={idx}
            className={cn(
              'h-16 w-14 items-center justify-center rounded-2xl border bg-surface-input',
              error
                ? 'border-danger'
                : idx === focusedIndex
                  ? 'border-brand'
                  : digit
                    ? 'border-brand opacity-100'
                    : 'border-border',
            )}
          >
            <Text className="text-2xl font-bold text-text">{digit}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

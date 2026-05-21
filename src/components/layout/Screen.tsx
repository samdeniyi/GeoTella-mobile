import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: readonly Edge[];
  keyboardAvoiding?: boolean;
};

export function Screen({
  children,
  scroll = false,
  className,
  edges = ['top', 'bottom', 'left', 'right'],
  keyboardAvoiding = false,
}: ScreenProps) {
  const inner = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={cn('px-5 pb-8', className)}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1 px-5', className)}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface">
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

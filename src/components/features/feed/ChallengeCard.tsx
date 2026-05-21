import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { ArrowRight } from '@/components/ui/Icons';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

type ChallengeCardProps = {
  role: UserRole | null;
  onPress?: () => void;
};

export function ChallengeCard({ role, onPress }: ChallengeCardProps) {
  const isExplorer = role === 'EXPLORER';

  return (
    <View
      className={cn(
        'relative mb-6 overflow-hidden rounded-[32px] border-2 p-6',
        isExplorer ? 'border-accent bg-white' : 'border-brand bg-brand',
      )}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View
          className={cn(
            'flex-row items-center gap-2 rounded-full px-3 py-1',
            isExplorer ? 'bg-accent/10' : 'bg-accent',
          )}
        >
          <Text className={cn('text-[10px] font-bold', isExplorer ? 'text-accent' : 'text-white')}>
            {isExplorer ? '⚡ Daily Quest' : '☆ Daily Challenge'}
          </Text>
        </View>
        <Text
          className={cn(
            'text-xs font-bold',
            isExplorer ? 'text-text opacity-40' : 'text-white opacity-60',
          )}
        >
          2/5 today
        </Text>
      </View>

      <Text
        className={cn(
          'mb-6 text-2xl font-bold leading-tight',
          isExplorer ? 'text-text' : 'text-white',
        )}
      >
        {isExplorer
          ? 'Discover 3 new hidden gems in Lagos Island'
          : 'Attest to a community data point'}
      </Text>

      {/* Progress Bar */}
      <View
        className={cn(
          'mb-8 h-2.5 w-full rounded-full',
          isExplorer ? 'bg-border/20' : 'bg-white/10',
        )}
      >
        <View
          className={cn('h-full rounded-full', isExplorer ? 'bg-accent' : 'bg-brand-accent')}
          style={{ width: '40%', backgroundColor: isExplorer ? '#E85A2D' : '#10B981' }}
        />
      </View>

      <Pressable
        onPress={onPress}
        className={cn(
          'flex-row items-center justify-center gap-2 rounded-2xl py-4',
          isExplorer ? 'bg-accent' : 'border border-white/20 bg-white/10',
        )}
      >
        <Text className="text-base font-bold text-white">
          {isExplorer ? 'EXPLORE NOW' : 'Start verifying'}
        </Text>
        <ArrowRight size={18} color="white" />
      </Pressable>
    </View>
  );
}

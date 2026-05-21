import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { ArrowRight } from './Icons';

export type WalkthroughStep = {
  title: string;
  description: string;
  target?: { x: number; y: number };
  position: 'top' | 'bottom';
  align: 'left' | 'center' | 'right';
};

type WalkthroughTooltipProps = {
  step: WalkthroughStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  className?: string;
};

export function WalkthroughTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  className,
}: WalkthroughTooltipProps) {
  return (
    <View
      className={cn(
        'w-[75%] rounded-[32px] border-2 border-brand bg-white p-6 shadow-2xl',
        className,
      )}
    >
      {/* Tail */}
      <View
        className={cn(
          'absolute h-6 w-6 rotate-45 border-2 border-brand bg-white',
          step.position === 'top' ? '-top-3' : '-bottom-3',
          step.align === 'left' ? 'left-10' : step.align === 'right' ? 'right-10' : 'left-[45%]',
          step.position === 'top' ? 'border-b-0 border-r-0' : 'border-l-0 border-t-0',
        )}
      />

      <Text className="text-2xl font-bold leading-tight text-text">{step.title}</Text>

      <Text className="mt-3 text-base leading-relaxed text-text opacity-70">
        {step.description}
      </Text>

      <View className="mt-8 flex-row items-center justify-between">
        {/* Progress Dots */}
        <View className="flex-row items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              className={cn(
                'h-1.5 rounded-full bg-border',
                i === currentStep ? 'w-6 bg-[#D9430F]' : 'w-1.5',
              )}
            />
          ))}
        </View>

        <View className="flex-row items-center gap-6">
          <Pressable onPress={onSkip}>
            <Text className="text-base font-bold text-text opacity-40">Skip</Text>
          </Pressable>
          <Pressable
            onPress={onNext}
            className="flex-row items-center gap-2 rounded-2xl bg-brand px-6 py-3"
          >
            <Text className="text-base font-bold text-white">
              {currentStep === totalSteps - 1 ? 'Got it' : 'Next'}
            </Text>
            <ArrowRight size={16} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

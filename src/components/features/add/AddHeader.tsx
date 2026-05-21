import { View, Text, Pressable } from 'react-native';

import { CheckIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/cn';

export type SubmitStep = 'locate' | 'describe' | 'evidence' | 'review';
export type AddTab = 'submit' | 'verify';

type AddHeaderProps = {
  step: SubmitStep;
  tab: AddTab;
  onTabChange: (tab: AddTab) => void;
  onClose: () => void;
  pendingCount?: number;
};

const STEPS: { key: SubmitStep; label: string; num: number }[] = [
  { key: 'locate', label: 'Locate', num: 1 },
  { key: 'describe', label: 'Describe', num: 2 },
  { key: 'evidence', label: 'Evidence', num: 3 },
];

export function AddHeader({ step, tab, onTabChange, onClose, pendingCount = 0 }: AddHeaderProps) {
  // 'review' is part of the submit flow but follows 'evidence' visually.
  const currentIndex =
    step === 'review' ? STEPS.length - 1 : STEPS.findIndex((s) => s.key === step);

  return (
    <View className="bg-surface pt-4">
      {/* Title Bar */}
      <View className="mb-6 flex-row items-center justify-between px-6">
        <Text className="text-3xl font-bold text-text">Contribute</Text>
        <Pressable
          onPress={onClose}
          className="h-10 w-10 items-center justify-center rounded-full bg-border/20"
        >
          <Text className="text-xl opacity-40">✕</Text>
        </Pressable>
      </View>

      {/* Main Tabs */}
      <View className="mb-6 flex-row border-b border-border">
        <Pressable
          onPress={() => onTabChange('submit')}
          className={cn(
            'flex-1 items-center pb-4',
            tab === 'submit' ? 'border-b-4 border-brand' : '',
          )}
        >
          <Text
            className={cn('font-bold', tab === 'submit' ? 'text-brand' : 'text-text opacity-40')}
          >
            Submit
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabChange('verify')}
          className={cn(
            'flex-1 flex-row items-center justify-center gap-2 pb-4',
            tab === 'verify' ? 'border-b-4 border-brand' : '',
          )}
        >
          <Text
            className={cn('font-bold', tab === 'verify' ? 'text-brand' : 'text-text opacity-40')}
          >
            Verify
          </Text>
          {pendingCount > 0 ? (
            <View
              className={cn(
                'rounded-full px-2 py-0.5',
                tab === 'verify' ? 'bg-brand' : 'bg-accent',
              )}
            >
              <Text className="text-[10px] font-bold text-white">{pendingCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Progress Steps — submit flow only */}
      {tab === 'submit' && (
        <View className="mb-6 flex-row gap-3 px-6">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;

            return (
              <View
                key={s.key}
                className={cn(
                  'flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3',
                  isActive
                    ? 'border-brand bg-brand'
                    : isCompleted
                      ? 'border-brand/20 bg-white'
                      : 'border-border bg-white',
                )}
              >
                <View
                  className={cn(
                    'h-5 w-5 items-center justify-center rounded-full',
                    isActive ? 'bg-accent' : isCompleted ? 'bg-brand' : 'bg-border/20',
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon size={12} color="white" />
                  ) : (
                    <Text
                      className={cn(
                        'text-[10px] font-bold',
                        isActive ? 'text-white' : 'text-text opacity-40',
                      )}
                    >
                      {s.num}
                    </Text>
                  )}
                </View>
                <Text
                  className={cn(
                    'text-xs font-bold',
                    isActive ? 'text-white' : 'text-text opacity-40',
                  )}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

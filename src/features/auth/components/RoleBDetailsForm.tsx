import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Props = {
  initial?: { businessName?: string; category?: string };
  onSubmit: (values: { businessName: string; category: string }) => void | Promise<void>;
  submitting?: boolean;
};

// Placeholder fields — replace with real questions for Type B.
export function RoleBDetailsForm({ initial, onSubmit, submitting }: Props) {
  const [businessName, setBusinessName] = useState(initial?.businessName ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');

  const canSubmit = businessName.trim().length > 1 && category.trim().length > 1;

  return (
    <View className="gap-4">
      <Input label="Business name" value={businessName} onChangeText={setBusinessName} />
      <Input label="Category" value={category} onChangeText={setCategory} />
      <Button
        label="Finish"
        onPress={() => onSubmit({ businessName: businessName.trim(), category: category.trim() })}
        loading={submitting}
        disabled={!canSubmit}
      />
    </View>
  );
}

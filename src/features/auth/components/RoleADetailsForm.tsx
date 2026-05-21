import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Props = {
  initial?: { fullName?: string; city?: string };
  onSubmit: (values: { fullName: string; city: string }) => void | Promise<void>;
  submitting?: boolean;
};

// Placeholder fields — replace with real questions for Type A.
export function RoleADetailsForm({ initial, onSubmit, submitting }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [city, setCity] = useState(initial?.city ?? '');

  const canSubmit = fullName.trim().length > 1 && city.trim().length > 1;

  return (
    <View className="gap-4">
      <Input label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
      <Input label="City" value={city} onChangeText={setCity} />
      <Button
        label="Finish"
        onPress={() => onSubmit({ fullName: fullName.trim(), city: city.trim() })}
        loading={submitting}
        disabled={!canSubmit}
      />
    </View>
  );
}

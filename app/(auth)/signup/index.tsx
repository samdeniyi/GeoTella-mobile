import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Text, View, Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, EyeIcon, GoogleIcon, ArrowRight, CheckIcon } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useRegisterMutation } from '@/features/auth/api/auth-queries';
import { signupSchema, type SignupInput } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/api/error-message';
import { cn } from '@/lib/cn';
import { useSignupStore } from '@/stores/signup-store';

const toIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

// 18+ minimum: the latest acceptable DOB is exactly 18 years before today.
const MAX_DOB = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
})();
const MIN_DOB = new Date(1900, 0, 1);

const isAtLeast18 = (isoDate: string): boolean => {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return dob.getTime() <= cutoff.getTime();
};

function PasswordRule({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className={ok ? 'text-xs font-bold text-brand' : 'text-xs text-text opacity-40'}>
        {ok ? '✓' : '○'}
      </Text>
      <Text className={ok ? 'text-xs font-medium text-brand' : 'text-xs text-text opacity-60'}>
        {label}
      </Text>
    </View>
  );
}

export default function SignupCreateAccount() {
  const router = useRouter();
  const setBasic = useSignupStore((s) => s.setBasic);
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', dateOfBirth: '', password: '' },
  });

  const password = watch('password');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    // Clamp to the 4-bar display so the indicator caps at "Excellent".
    return Math.min(4, strength);
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Excellent'];
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#0B4A33'];

  const onSubmit = async (values: SignupInput) => {
    if (!agree) return;
    setServerError(null);

    if (!isAtLeast18(values.dateOfBirth)) {
      setServerError('You must be at least 18 years old to sign up.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        password: values.password,
      });
      setBasic(values);
      router.push('/(auth)/signup/verify-otp');
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not create your account. Please try again.'));
    }
  };

  return (
    <Screen scroll keyboardAvoiding className="pb-10 pt-6">
      <BackButton className="mb-8" />

      <Text className="text-4xl font-bold leading-tight text-text">
        Create your Geotela account.
      </Text>
      <Text className="mt-3 text-lg text-text opacity-70">
        Join a community of mappers tracking the world’s growth.
      </Text>

      <View className="mt-8 gap-4">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Enter email address"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, value } }) => {
            const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
              if (Platform.OS !== 'ios') setShowDatePicker(false);
              if (event.type === 'set' && selected) {
                onChange(toIsoDate(selected));
              }
            };
            const parsed = value ? new Date(value) : null;
            const initialDate =
              parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(2000, 0, 1);
            return (
              <View>
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-text opacity-70">
                  Date of Birth
                </Text>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <View
                    className={cn(
                      'h-14 flex-row items-center justify-between rounded-2xl border bg-surface-input px-4',
                      errors.dateOfBirth ? 'border-danger' : 'border-border',
                    )}
                  >
                    <Text className={cn('text-base', value ? 'text-text' : 'text-text opacity-40')}>
                      {value ? formatDisplayDate(value) : 'dd/mm/yyyy'}
                    </Text>
                    <CalendarIcon />
                  </View>
                </Pressable>
                {errors.dateOfBirth ? (
                  <Text className="mt-1 text-xs text-danger">{errors.dateOfBirth.message}</Text>
                ) : null}
                {showDatePicker ? (
                  <DateTimePicker
                    value={initialDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={MAX_DOB}
                    minimumDate={MIN_DOB}
                    onChange={onPickerChange}
                  />
                ) : null}
                {showDatePicker && Platform.OS === 'ios' ? (
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    className="mt-2 self-end rounded-full bg-brand px-4 py-2"
                  >
                    <Text className="text-sm font-bold text-white">Done</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Input
                label="Password"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
                rightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <EyeIcon color={showPassword ? '#0B4A33' : '#6B7280'} />
                  </Pressable>
                }
              />
              {value.length > 0 && (
                <View className="mt-3">
                  <View className="flex-row gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor: i <= strength ? strengthColors[strength] : '#E5E7EB',
                        }}
                      />
                    ))}
                  </View>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold uppercase tracking-tighter text-text opacity-50">
                      {strengthLabels[strength]} · {value.length} chars
                    </Text>
                  </View>
                </View>
              )}
              <View className="mt-3 gap-1">
                <PasswordRule label="At least 8 characters" ok={value.length >= 8} />
                <PasswordRule label="One lowercase letter" ok={/[a-z]/.test(value)} />
                <PasswordRule label="One uppercase letter" ok={/[A-Z]/.test(value)} />
                <PasswordRule label="One number" ok={/[0-9]/.test(value)} />
                <PasswordRule label="One special character" ok={/[^A-Za-z0-9]/.test(value)} />
              </View>
            </View>
          )}
        />
      </View>

      <View className="mt-8 flex-row items-center gap-3">
        <Pressable
          onPress={() => setAgree(!agree)}
          className={`h-6 w-6 items-center justify-center rounded-md border ${agree ? 'border-brand bg-brand' : 'border-border bg-white'}`}
        >
          {agree && <CheckIcon size={14} />}
        </Pressable>
        <Text className="flex-1 text-sm text-[#364859]">
          I agree to the <Text className="font-bold text-brand">Terms</Text> and{' '}
          <Link href="/(auth)/privacy-policy" asChild>
            <Text className="font-bold text-brand underline">Privacy Policy</Text>
          </Link>
          .
        </Text>
      </View>

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-10">
        <Button
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={registerMutation.isPending}
          disabled={!agree}
          rightIcon={<ArrowRight size={20} />}
        />
      </View>

      <View className="my-8 flex-row items-center gap-4">
        <View className="h-[1px] flex-1 bg-border" />
        <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Or continue with
        </Text>
        <View className="h-[1px] flex-1 bg-border" />
      </View>

      <Button
        label="Continue with Google"
        variant="secondary"
        leftIcon={<GoogleIcon size={20} />}
        onPress={() => { }}
      />
    </Screen>
  );
}

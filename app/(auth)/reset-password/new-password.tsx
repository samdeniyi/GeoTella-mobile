import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { EyeIcon, ArrowRight } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useResetPasswordMutation } from '@/features/auth/api/auth-queries';
import { newPasswordSchema, type NewPasswordInput } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/api/error-message';

export default function NewPassword() {
  const router = useRouter();
  const { otp } = useLocalSearchParams<{ email?: string; otp?: string }>();
  const resetPassword = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Excellent'];
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#0B4A33'];

  const onSubmit = async (values: NewPasswordInput) => {
    setServerError(null);
    if (!otp) {
      setServerError('Missing verification code. Please restart the reset flow.');
      return;
    }
    try {
      await resetPassword.mutateAsync({ password: values.password, otp });
      router.replace('/(auth)/login');
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not reset password. Please try again.'));
    }
  };

  return (
    <Screen scroll keyboardAvoiding className="pb-10 pt-6">
      <BackButton className="mb-8" />

      <Text className="text-4xl font-bold leading-tight text-text">Create new password</Text>
      <Text className="mt-3 text-lg leading-relaxed text-text opacity-70">
        Your new password must be different from previous used passwords.
      </Text>

      <View className="mt-10 gap-8">
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
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Enter password"
              secureTextEntry={!showConfirmPassword}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              rightElement={
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <EyeIcon color={showConfirmPassword ? '#0B4A33' : '#6B7280'} />
                </Pressable>
              }
            />
          )}
        />
      </View>

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-12">
        <Button
          label="Reset password"
          onPress={handleSubmit(onSubmit)}
          loading={resetPassword.isPending}
          rightIcon={<ArrowRight size={20} />}
        />
      </View>
    </Screen>
  );
}

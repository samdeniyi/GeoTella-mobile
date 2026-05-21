import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useForgotPasswordMutation } from '@/features/auth/api/auth-queries';
import { requestResetSchema, type RequestResetInput } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/api/error-message';

export default function RequestReset() {
  const router = useRouter();
  const forgotPassword = useForgotPasswordMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: RequestResetInput) => {
    setServerError(null);
    try {
      await forgotPassword.mutateAsync({ email: values.email });
      router.push({
        pathname: '/(auth)/reset-password/verify-otp',
        params: { email: values.email },
      });
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not send reset code. Please try again.'));
    }
  };

  return (
    <Screen scroll keyboardAvoiding className="pb-10 pt-6">
      <BackButton className="mb-8" />

      <Text className="text-4xl font-bold leading-tight text-text">Reset password</Text>
      <Text className="mt-3 text-lg leading-relaxed text-text opacity-70">
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      <View className="mt-10 gap-6">
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
      </View>

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-10">
        <Button
          label="Send reset code"
          onPress={handleSubmit(onSubmit)}
          loading={forgotPassword.isPending}
          rightIcon={<ArrowRight size={20} />}
        />
      </View>

      <View className="mt-10 flex-row items-center justify-center gap-2">
        <Text className="text-base text-[#364859] opacity-50">Don't have an account?</Text>
        <Link href="/(auth)/signup" asChild>
          <Pressable className="flex-row items-center gap-1">
            <Text className="text-base font-bold text-brand">Sign up</Text>
            <ArrowRight size={16} color="#0B4A33" />
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

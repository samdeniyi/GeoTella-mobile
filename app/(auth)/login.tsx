import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { EyeIcon, GoogleIcon, ArrowRight } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useLoginMutation } from '@/features/auth/api/auth-queries';
import { extractAuthPayload } from '@/features/auth/api/extract-auth';
import { toUserRole } from '@/features/auth/api/persona-mapping';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/auth-schemas';
import { getWhoAmI, unwrap, type WhoAmI } from '@/features/users/api/users-api';
import { getErrorMessage } from '@/lib/api/error-message';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

export default function Login() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      const response = await loginMutation.mutateAsync(values);
      const payload = extractAuthPayload(response);
      if (!payload?.token) {
        setServerError('Login succeeded but no token was returned. Check the response shape.');
        return;
      }
      const initialRole: UserRole = toUserRole(payload.user?.role) ?? 'GROWTH_SEEKER';
      const baseUser = payload.user ?? {
        id: 'unknown',
        email: values.email,
        role: initialRole,
        createdAt: new Date().toISOString(),
      };
      await signIn({
        token: payload.token,
        refreshToken: payload.refreshToken,
        user: { ...baseUser, role: initialRole },
      });
      try {
        const raw = await getWhoAmI();
        const me = unwrap<WhoAmI>(raw);
        const refreshedRole = toUserRole(me?.role) ?? toUserRole(me?.persona);
        if (refreshedRole) useAuthStore.getState().setRole(refreshedRole);
      } catch {
      }

      if (payload.isOnboardingComplete === false) {
        router.replace('/(auth)/signup/select-role');
      } else {
        router.replace('/(app)/(tabs)/map');
      }
    } catch (e) {
      setServerError(getErrorMessage(e, 'Could not log in. Please try again.'));
    }
  };

  return (
    <Screen scroll keyboardAvoiding className="pb-10 pt-6">
      <BackButton className="mb-8" />

      <Text className="text-4xl font-bold leading-tight text-text">Welcome back.</Text>
      <Text className="mt-3 text-lg text-text opacity-70">
        Join 562 mappers exploring cities and tracking the world's growth
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

        <View>
          <View className="absolute right-0 top-0 z-10">
            <Link href="/(auth)/reset-password" asChild>
              <Pressable>
                <Text className="text-xs font-bold tracking-wider text-brand">Forgot?</Text>
              </Pressable>
            </Link>
          </View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
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
            )}
          />
        </View>
      </View>

      {/* <Pressable onPress={() => setAgree(!agree)} className="mt-8 flex-row items-center gap-3">
        <View
          className={`h-6 w-6 items-center justify-center rounded-md border ${agree ? 'border-brand bg-brand' : 'border-border bg-white'}`}
        >
          {agree && <CheckIcon size={14} />}
        </View>
        <Text className="text-sm text-[#364859]">
          I agree to the <Text className="font-bold text-brand">Terms</Text> and{' '}
          <Text className="font-bold text-brand">Privacy Policy</Text>.
        </Text>
      </Pressable> */}

      {serverError ? (
        <Text className="mt-6 text-center text-sm font-medium text-danger">{serverError}</Text>
      ) : null}

      <View className="mt-10">
        <Button
          label="Log in"
          onPress={handleSubmit(onSubmit)}
          loading={loginMutation.isPending}
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

      <View className="mt-10 flex-row items-center justify-center gap-2">
        <Text className="text-base font-bold text-text opacity-50">Don't have an account?</Text>
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

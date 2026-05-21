import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { EmailIcon, ArrowRight } from '@/components/ui/Icons';
import { OTPInput } from '@/components/ui/OTPInput';
import {
  useResendRegistrationOtpMutation,
  useVerifyRegistrationMutation,
} from '@/features/auth/api/auth-queries';
import { getErrorMessage } from '@/lib/api/error-message';
import { useSignupStore } from '@/stores/signup-store';

const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return 'your email';
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) return email;
  return `${name.substring(0, 2)}****@${domain}`;
};

export default function VerifyOtp() {
  const router = useRouter();
  const email = useSignupStore((s) => s.email);
  const setOtpVerified = useSignupStore((s) => s.setOtpVerified);

  const verifyMutation = useVerifyRegistrationMutation();
  const resendMutation = useResendRegistrationOtpMutation();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onVerify = async () => {
    setError(null);
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    try {
      await verifyMutation.mutateAsync({ email, otp: code });

      setOtpVerified(true);
      router.push('/(auth)/login');
    } catch (e) {
      setError(getErrorMessage(e, 'Invalid code, please try again.'));
    }
  };

  const onResend = async () => {
    try {
      await resendMutation.mutateAsync(email);
    } catch {
      // Surface silently in the same banner if the backend rejects it.
    }
  };

  return (
    <Screen scroll keyboardAvoiding className="pb-10 pt-6">
      <BackButton className="mb-10" />

      <View className="mb-10 items-center">
        <EmailIcon size={40} />
      </View>

      <View className="items-center">
        <Text className="text-center text-4xl font-bold leading-tight text-text">
          Check your inbox.
        </Text>
        <Text className="mt-4 px-6 text-center text-lg leading-relaxed text-text opacity-70">
          We sent a 6-digit confirmation code to{' '}
          <Text className="font-bold text-brand">{maskEmail(email)}</Text>
        </Text>
      </View>

      <View className="mt-12">
        <OTPInput value={code} onChange={setCode} error={!!error} />
        {error ? (
          <Text className="mt-4 text-center text-sm font-medium text-danger">{error}</Text>
        ) : (
          <View className="mt-6 flex-row justify-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className={`h-1 w-8 rounded-full ${i <= code.length ? 'bg-brand' : 'bg-border'}`}
              />
            ))}
          </View>
        )}
      </View>

      <View className="mt-12">
        <Button
          label="Confirm email"
          onPress={onVerify}
          loading={verifyMutation.isPending}
          disabled={code.length !== 6}
          rightIcon={<ArrowRight size={20} />}
        />
      </View>

      <View className="mt-10 items-center">
        <Text className="text-base text-text opacity-70">
          Didn't get it?{' '}
          <Text
            className="font-bold text-brand underline decoration-brand"
            onPress={resendMutation.isPending ? undefined : onResend}
          >
            {resendMutation.isPending ? 'Sending...' : 'Resend code'}
          </Text>
        </Text>

        <Pressable onPress={() => router.back()} className="mt-12 flex-row items-center gap-2">
          <Text className="text-base text-[#364859] opacity-70">Wrong email?</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-bold text-brand">Go back</Text>
            <ArrowRight size={16} color="#0B4A33" />
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

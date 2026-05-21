import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, Logo } from '@/components/ui/Icons';
import { unwrapFaq } from '@/features/settings/api/settings-api';
import { useFaqQuery } from '@/features/settings/api/settings-queries';
import { getErrorMessage } from '@/lib/api/error-message';

const FALLBACK_FAQS = [
  {
    title: 'How is trust score calculated?',
    description:
      'Your trust score is based on the accuracy of your contributions and successful verifications by other members.',
  },
  {
    title: 'What is a Growth Seeker?',
    description:
      'Growth Seekers are professional investors and analysts looking for ground-truth data in emerging markets.',
  },
  {
    title: 'How do I earn rewards?',
    description:
      'Explorers earn XP and trust tokens by submitting high-quality, verified geo-stories.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const faqQuery = useFaqQuery();
  const faqs = useMemo(() => {
    const apiFaqs = unwrapFaq(faqQuery.data).map((f) => ({
      title: f.question ?? f.title ?? '',
      description: f.answer ?? f.description ?? '',
    }));
    return apiFaqs.length > 0 ? apiFaqs : FALLBACK_FAQS;
  }, [faqQuery.data]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="flex-row items-center gap-6 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-2xl font-bold text-text">Support & About</Text>
      </SafeAreaView>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center py-10">
          <Logo width={140} />
          <Text className="mt-4 text-[10px] font-bold uppercase tracking-[4px] text-text opacity-40">
            VERSION 2.4.0
          </Text>
        </View>

        <Text className="mb-6 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          HELP & FAQ
        </Text>

        {faqQuery.isLoading ? (
          <View className="mb-10 items-center py-6">
            <ActivityIndicator color="#0B4A33" />
          </View>
        ) : faqQuery.isError ? (
          <View className="mb-10">
            <Text className="text-center text-sm text-text opacity-60">
              {getErrorMessage(faqQuery.error, 'Could not load FAQs.')}
            </Text>
          </View>
        ) : (
          <View className="mb-10 gap-4">
            {faqs.map((faq, idx) => (
              <View key={idx} className="rounded-[32px] border border-border bg-white p-8">
                <Text className="mb-4 text-lg font-bold text-text">{faq.title}</Text>
                <Text className="text-base leading-relaxed text-text opacity-70">
                  {faq.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text className="mb-6 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          CONTACT US
        </Text>
        <View className="mb-20 gap-4">
          <Pressable className="h-20 items-center justify-center rounded-[24px] border border-border bg-white">
            <Text className="text-base font-bold text-text">Chat with Support</Text>
          </Pressable>
          <Pressable className="h-20 items-center justify-center rounded-[24px] border border-border bg-white">
            <Text className="text-base font-bold text-text">Email Help Desk</Text>
          </Pressable>
        </View>

        <Text className="mb-10 text-center text-xs text-text opacity-40">
          © 2026 GeoTela Intelligence Platform.
        </Text>
      </ScrollView>
    </View>
  );
}

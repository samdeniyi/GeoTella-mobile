import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, MailIcon, LockIcon, PaperPlaneIcon } from '@/components/ui/Icons';
import { useUser } from '@/stores/auth-store';

const CATEGORIES = [
  'Tokens & billing',
  'Technical issues',
  'Content verification',
  'General feedback',
  'Other inquiry',
];

export default function ContactSupportScreen() {
  const user = useUser();
  const userEmail = user?.email ?? 'adaeze.okoro@gmail.com';

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Tokens & billing');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message description.');
      return;
    }

    Alert.alert(
      'Message Sent',
      "Thanks! We've received your support request and will reply to your email shortly.",
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <SafeAreaView edges={['top']} className="flex-row items-center gap-4 bg-surface px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card"
        >
          <BackIcon size={20} />
        </Pressable>
        <Text className="text-xl font-extrabold text-text">Contact Support</Text>
      </SafeAreaView>

      <View className="h-[1px] w-full bg-border/40" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="gap-6 py-6">
          <Text className="text-sm leading-relaxed text-text opacity-70">
            Tell us what's happening and we'll get back to you by email.
          </Text>

          {/* Email row (readonly) */}
          <View className="gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              YOUR EMAIL
            </Text>
            <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-card/50 px-4 py-3.5 opacity-80">
              <View className="flex-1 flex-row items-center gap-3">
                <MailIcon color="#6B7280" size={18} />
                <Text
                  className="text-sm font-semibold leading-normal text-text opacity-60"
                  numberOfLines={1}
                >
                  {userEmail}
                </Text>
              </View>
              <LockIcon color="#6B7280" size={16} />
            </View>
            <Text className="text-xs text-text opacity-40">We'll reply to this address.</Text>
          </View>

          {/* Subject field */}
          <View className="gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              SUBJECT
            </Text>
            <TextInput
              className="rounded-2xl border border-border bg-surface-card px-4 py-3.5 text-sm font-medium text-text"
              value={subject}
              onChangeText={setSubject}
              placeholder="Briefly, what's it about?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category dropdown */}
          <View className="gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              CATEGORY
            </Text>
            <Pressable
              onPress={() => setCategoryOpen(true)}
              className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-card px-4 py-3.5 active:bg-border/10"
            >
              <Text className="text-sm font-semibold leading-normal text-text">{category}</Text>
              <Text className="text-xs text-text opacity-60">▼</Text>
            </Pressable>
          </View>

          {/* Message field */}
          <View className="gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              MESSAGE
            </Text>
            <TextInput
              className="h-32 rounded-2xl border border-border bg-surface-card p-4 text-sm font-medium text-text"
              value={message}
              onChangeText={setMessage}
              placeholder="Describe the issue or question..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Send Message button */}
          <Pressable
            onPress={handleSend}
            className="mb-10 mt-2 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand shadow-sm active:opacity-90"
          >
            <PaperPlaneIcon color="white" size={18} />
            <Text className="text-base font-bold text-white">Send message</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Custom dropdown modal */}
      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          onPress={() => setCategoryOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <View className="w-full overflow-hidden rounded-3xl border border-border bg-white">
            <View className="border-b border-border/30 bg-surface px-6 py-4">
              <Text className="text-base font-bold text-text">Select Category</Text>
            </View>
            <ScrollView style={{ maxHeight: 250 }}>
              {CATEGORIES.map((item, idx) => {
                const isSelected = item === category;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategory(item);
                      setCategoryOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-6 py-4 ${
                      idx !== CATEGORIES.length - 1 ? 'border-b border-border/20' : ''
                    } ${isSelected ? 'bg-brand/5' : 'active:bg-border/10'}`}
                  >
                    <Text
                      className={`text-sm ${isSelected ? 'font-bold text-brand' : 'text-text'}`}
                    >
                      {item}
                    </Text>
                    {isSelected ? <Text className="text-xs text-brand">✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

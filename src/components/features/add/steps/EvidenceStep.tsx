import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ArrowRight } from '@/components/ui/Icons';
import { useAddStore } from '@/stores/add-store';

type Props = {
  onNext: () => void;
  onCancel: () => void;
};

export function EvidenceStep({ onNext, onCancel }: Props) {
  const { data, setData } = useAddStore();

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset) return;
    // Normalize the file name + mime so the backend's allow-list (image/jpeg,
    // image/png, application/pdf) accepts it. iOS often hands us HEIC, which
    // the server rejects with "Only Image and Pdf files are allowed!".
    const rawName = asset.fileName ?? asset.uri.split('/').pop() ?? 'photo';
    const rawMime = asset.mimeType ?? '';
    const lower = rawName.toLowerCase();
    const isPng = rawMime === 'image/png' || lower.endsWith('.png');
    const isPdf = rawMime === 'application/pdf' || lower.endsWith('.pdf');
    const mime = isPdf ? 'application/pdf' : isPng ? 'image/png' : 'image/jpeg';
    const ext = isPdf ? 'pdf' : isPng ? 'png' : 'jpg';
    // Strip any existing extension and append the normalized one.
    const stem = rawName.replace(/\.[^.]+$/, '');
    const name = `${stem}.${ext}`;
    setData({ photo: { uri: asset.uri, name, type: mime } });
  };

  const removePhoto = () => setData({ photo: undefined });

  const strength = [
    Boolean(data.photo),
    Boolean(data.sourceLink && data.sourceLink.trim()),
    Boolean(data.verifierNotes && data.verifierNotes.trim()),
  ].filter(Boolean).length;
  const strengthLabel =
    strength === 3 ? 'Strong' : strength === 2 ? 'Good' : strength === 1 ? 'Fair' : 'Weak';

  return (
    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
      <Pressable
        onPress={pickPhoto}
        className="mb-8 items-center justify-center rounded-[32px] border-2 border-dashed border-border bg-white p-10"
      >
        {data.photo ? (
          <View className="w-full">
            <Image
              source={{ uri: data.photo.uri }}
              style={{ width: '100%', height: 200, borderRadius: 24 }}
              resizeMode="cover"
            />
            <Pressable
              onPress={removePhoto}
              className="mt-3 self-center rounded-full bg-border/30 px-4 py-1"
            >
              <Text className="text-xs font-bold text-text">Remove photo</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-border/10">
              <Text className="text-2xl text-brand">↑</Text>
            </View>
            <Text className="mb-1 text-lg font-bold text-text">Add a photo</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
              JPG or PNG · max 8 MB · optional
            </Text>
          </>
        )}
      </Pressable>

      <View className="mb-8">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Source Link (Optional)
        </Text>
        <TextInput
          className="rounded-2xl border border-border bg-white p-5 text-text"
          placeholder="https://..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="url"
          value={data.sourceLink}
          onChangeText={(t) => setData({ sourceLink: t })}
        />
      </View>

      <View className="mb-8">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
          Notes for Verifiers (Optional)
        </Text>
        <TextInput
          className="h-32 rounded-2xl border border-border bg-white p-5 text-text"
          placeholder="Any context that helps verifiers confirm your insight..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          value={data.verifierNotes}
          onChangeText={(t) => setData({ verifierNotes: t })}
        />
      </View>

      <View className="mb-10 rounded-[32px] border border-border bg-white p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-text opacity-40">
            Evidence Strength
          </Text>
          <Text className="text-[10px] font-bold uppercase text-accent">{strengthLabel}</Text>
        </View>
        <View className="mb-4 flex-row gap-2">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className={`h-2 flex-1 rounded-full ${i < strength ? 'bg-accent' : 'bg-border/20'}`}
            />
          ))}
        </View>
        <Text className="text-[10px] text-text opacity-40">
          Add a photo, source, or notes to strengthen your submission.
        </Text>
      </View>

      <View className="mb-10 gap-4">
        <Pressable
          onPress={onNext}
          className="h-16 flex-row items-center justify-center gap-2 rounded-[24px] bg-brand"
        >
          <Text className="text-base font-bold text-white">Review</Text>
          <ArrowRight size={18} color="white" />
        </Pressable>
        <Pressable
          onPress={onCancel}
          className="h-16 items-center justify-center rounded-[24px] border border-border bg-surface-card"
        >
          <Text className="text-base font-bold text-text">Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

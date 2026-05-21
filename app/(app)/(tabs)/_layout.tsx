import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MapTabIcon, FeedTabIcon, SavedTabIcon, UserTabIcon } from '@/components/ui/Icons';

type TabIconComponent = React.ComponentType<{ focused: boolean; color: string }>;

type TabIconProps = { focused: boolean; label: string; Icon: TabIconComponent };

function TabIcon({ focused, label, Icon }: TabIconProps) {
  return (
    <View className="w-16 items-center justify-center">
      {focused && <View className="absolute -top-6 h-1 w-10 rounded-full bg-brand" />}
      <Icon focused={focused} color={focused ? '#0B4A33' : '#6B7280'} />
      <Text
        numberOfLines={1}
        className="mt-1 text-xs font-bold"
        style={{ color: focused ? '#0B4A33' : '#6B7280' }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 90,
          backgroundColor: '#F4F1E9',
          borderTopWidth: 0,
          paddingBottom: 20,
          paddingTop: 20,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Map" Icon={MapTabIcon} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Feed" Icon={FeedTabIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-button"
        options={{
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/(app)/add')}
              className="-top-5 flex-1 items-center justify-center"
            >
              <View className="h-16 w-16 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/40">
                <Text className="text-3xl font-bold text-white">+</Text>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Saved" Icon={SavedTabIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="You" Icon={UserTabIcon} />,
        }}
      />
    </Tabs>
  );
}

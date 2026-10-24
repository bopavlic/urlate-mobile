import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnreadCount } from '@/features/activity/queries';
import { useColors } from '@/theme/appearance';
import { LateButton } from '@/ui/LateButton';
import { TabIcon } from '@/ui/TabIcon';

const TAB_BAR_HEIGHT = 60;

export default function TabsLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const unread = useUnreadCount();
  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.ink,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarStyle: {
            backgroundColor: colors.paper,
            borderTopColor: colors.line,
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: 6,
          },
          // Room for the floating "+ Late" card above the tab bar.
          sceneStyle: { paddingBottom: 72 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => <TabIcon name="activity" color={color} />,
            tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.onAccent },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
          }}
        />
      </Tabs>
      {/* One tap from anywhere: the card floats above the middle of the tab bar. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 items-center"
        style={{ bottom: TAB_BAR_HEIGHT + insets.bottom + 12 }}
      >
        <LateButton />
      </View>
    </View>
  );
}

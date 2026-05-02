import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import type { TabParamList } from '@/types/navigation';

import HomeScreen from '@/screens/HomeScreen';
import TodoListScreen from '@/screens/TodoListScreen';
import CalendarScreen from '@/screens/CalendarScreen';
import ProgressScreen from '@/screens/ProgressScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Todos: { active: 'checkbox', inactive: 'checkbox-outline' },
  Calendar: { active: 'calendar', inactive: 'calendar-outline' },
  Progress: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'ホーム' }} />
      <Tab.Screen name="Todos" component={TodoListScreen} options={{ tabBarLabel: 'Todo' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'カレンダー' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: '進捗' }} />
    </Tab.Navigator>
  );
}

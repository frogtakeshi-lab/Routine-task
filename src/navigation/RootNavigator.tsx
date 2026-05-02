import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import type { RootStackParamList } from '@/types/navigation';

import TabNavigator from './TabNavigator';
import RoutineListScreen from '@/screens/RoutineListScreen';
import RoutineFormScreen from '@/screens/RoutineFormScreen';
import TodoFormScreen from '@/screens/TodoFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="RoutineList"
        component={RoutineListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoutineForm"
        component={RoutineFormScreen}
        options={{
          title: 'ルーティン',
          presentation: 'modal',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="TodoForm"
        component={TodoFormScreen}
        options={{
          title: 'Todo',
          presentation: 'modal',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

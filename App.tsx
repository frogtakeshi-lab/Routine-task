import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { useAppInit } from '@/hooks/useAppInit';
import RootNavigator from '@/navigation/RootNavigator';

function AppContent() {
  useAppInit();
  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

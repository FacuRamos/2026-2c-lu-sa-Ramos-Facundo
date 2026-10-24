import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext.js';
import { NotificationProvider } from './src/context/NotificationContext.js';
import { RootNavigator } from './src/navigation/RootNavigator.js';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NotificationProvider>
          <StatusBar style="dark" backgroundColor="#F4F2EE" />
          <RootNavigator />
        </NotificationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

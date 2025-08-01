import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="RegisterEmpresaScreen" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import '../../global.css';

import { DefaultTheme, Redirect, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';

SplashScreen.preventAutoHideAsync();

const PUBLIC_SEGMENTS = ['welcome', 'login', 'otp', 'pin-login', 'register'];

function AuthGuard() {
  const { accessToken, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) return null;

  const currentSegment = segments[0] as string | undefined;
  const isPublic = !currentSegment || PUBLIC_SEGMENTS.includes(currentSegment);

  if (!accessToken && !isPublic) {
    return <Redirect href="/welcome" />;
  }

  if (accessToken && isPublic) {
    return <Redirect href="/(tabs)" />;
  }

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <AnimatedSplashOverlay />
          <AuthGuard />

          <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="otp" options={{ headerShown: false }} />
            <Stack.Screen name="pin-login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="set-pin" options={{ headerShown: false, title: 'Set PIN' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="expenses" options={{ headerShown: false }} />
            <Stack.Screen name="expenses/new" options={{ headerShown: false }} />
            <Stack.Screen name="inventory" options={{ headerShown: false }} />
            <Stack.Screen name="inventory/new" options={{ headerShown: false }} />
            <Stack.Screen name="inventory/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="inventory/edit/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="products/new" options={{ headerShown: false }} />
            <Stack.Screen name="products/index" options={{ headerShown: false }} />
            <Stack.Screen name="loan/apply" options={{ headerShown: false }} />
            <Stack.Screen name="loan/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="loan/[id]/pay" options={{ headerShown: false }} />
            <Stack.Screen name="loan/[id]/success" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

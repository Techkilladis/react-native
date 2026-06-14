import '@/global.css';
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useSegments, useRouter } from "expo-router";
import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-semibold': require('@/assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-medium': require('@/assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-light': require('@/assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-extrabold': require('@/assets/fonts/PlusJakartaSans-ExtraBold.ttf')
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}


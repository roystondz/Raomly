import "../../global.css";
import { LogBox } from "react-native"; LogBox.ignoreAllLogs(); // TEMP-SHOT

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.",
  );
}

// Keep the splash up until Clerk has restored the session from the token cache,
// so signed-in guests don't see onboarding flash on a cold start.
SplashScreen.preventAutoHideAsync();

// Headers are hidden by default; screens that need one opt in.
// Signed out: onboarding + (auth). Signed in: (app). Flipping the session
// redirects automatically, so screens never navigate after auth changes.
// redirectTo matters: onboarding owns "/", so without it a signed-in guest
// (cold start or right after sign in) lands on "/" with nothing to show.
function RootStack() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) SplashScreen.hide();
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn} redirectTo="/home">
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn} redirectTo="/">
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Screen name="design-system" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootStack />
    </ClerkProvider>
  );
}

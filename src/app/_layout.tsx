import "../../global.css";

import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

import { posthog } from "@/config/posthog";

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
function PostHogIdentity() {
  const posthog = usePostHog();
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      if (identifiedUserId.current === user.id) return;

      const email = user.primaryEmailAddress?.emailAddress;
      posthog.identify(user.id, {
        $set: {
          ...(email ? { email } : {}),
          ...(user.firstName ? { first_name: user.firstName } : {}),
          ...(user.lastName ? { last_name: user.lastName } : {}),
        },
      });
      identifiedUserId.current = user.id;
      return;
    }

    if (identifiedUserId.current) {
      posthog.reset();
      identifiedUserId.current = null;
    }
  }, [isLoaded, posthog, user]);

  return null;
}

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
  const content = <RootStack />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <PostHogIdentity />
          {content}
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}

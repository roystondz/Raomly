import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";
import { usePostHog } from "posthog-react-native";

import type { SocialProvider } from "@/components/auth/social-buttons";

// Google uses Clerk's browser SSO. Apple isn't enabled in Clerk yet.
// SSO still returns setActive (it doesn't use finalize()); cancelling resolves
// with no session and is not an error.
export function useSocialSignIn() {
  const posthog = usePostHog();
  const { startSSOFlow } = useSSO();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(provider: SocialProvider) {
    setError(null);
    if (provider === "apple") {
      Alert.alert("Coming soon", "Sign in with Apple is coming soon.");
      return;
    }
    setLoadingProvider(provider);
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({ strategy: "oauth_google" });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        posthog?.capture("social_sign_in_completed", { sign_in_method: "google" });
        return; // The route guard takes over; this screen unmounts.
      }
      if (signUp?.status === "missing_requirements") {
        setError("We couldn't finish signing up with Google. Sign up with your email instead.");
      }
    } catch {
      setError("Google sign in didn't work. Please try again.");
    }
    setLoadingProvider(null);
  }

  return { start, loadingProvider, error };
}

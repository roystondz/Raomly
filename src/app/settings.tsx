import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { SheetGrabber } from "@/components/ui/sheet-grabber";
import { Text } from "@/components/ui/text";
import { useAndroidBottomInset } from "@/hooks/use-android-bottom-inset";

// Opened from the Profile gear. Holds Sign out, which the design has no row for.
export default function SettingsSheet() {
  const router = useRouter();
  const posthog = usePostHog();
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  const bottomInset = useAndroidBottomInset();

  async function handleSignOut() {
    posthog.capture("user_signed_out");
    // The route guard returns to onboarding once the session ends.
    await signOut();
  }

  return (
    <View className="gap-5 bg-surface px-5 pt-8" style={{ paddingBottom: 16 + bottomInset }}>
      <SheetGrabber />
      <View className="gap-1">
        <Text variant="title-sm" accessibilityRole="header">
          Settings
        </Text>
        {email ? (
          <>
            <Text tone="muted">Signed in as</Text>
            {/* Long addresses shorten in the middle instead of wrapping mid-word. */}
            <Text numberOfLines={1} ellipsizeMode="middle">
              {email}
            </Text>
          </>
        ) : null}
      </View>
      <Button variant="secondary" title="Sign out" onPress={handleSignOut} />
      {__DEV__ ? (
        <Button
          size="sm"
          variant="secondary"
          title="Open design system"
          className="self-center"
          onPress={() => router.push("/design-system")}
        />
      ) : null}
    </View>
  );
}

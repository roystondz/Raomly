import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { usePostHog } from "posthog-react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// PLACEHOLDER: the real profile comes with its own design.
export default function ProfileScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;

  async function handleSignOut() {
    posthog?.capture("user_signed_out");
    await signOut();
  }

  return (
    <View className="flex-1 justify-center gap-6 bg-surface px-6">
      <View className="items-center gap-3">
        <View className="size-21 overflow-hidden rounded-full bg-primary-50">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ flex: 1 }} contentFit="cover" accessibilityIgnoresInvertColors />
          ) : null}
        </View>
        <View className="items-center gap-1">
          <Text variant="title" accessibilityRole="header">
            {user?.fullName || email}
          </Text>
          {user?.fullName ? <Text tone="muted">{email}</Text> : null}
        </View>
      </View>
      <View className="gap-3">
        {/* The route guard returns to onboarding once the session ends. */}
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
    </View>
  );
}

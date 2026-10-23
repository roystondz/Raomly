import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";

export type AuthScreenProps = {
  title: string;
  body: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

// Shared layout for sign up, verify email and sign in (from the sign-up design).
export function AuthScreen({ title, body, footer, children }: AuthScreenProps) {
  const router = useRouter();
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="grow px-6 pt-safe pb-safe-offset-2"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      <View className="h-11 flex-row items-center justify-between">
        <IconButton
          variant="outline"
          icon={ChevronLeft}
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        />
        <Logo height={30} />
      </View>
      <Text variant="hero" accessibilityRole="header" className="mt-8">
        {title}
      </Text>
      <Text tone="muted" className="mt-3">
        {body}
      </Text>
      <View className="mt-6">{children}</View>
      <View className="mt-auto flex-row flex-wrap items-center justify-center gap-1.5 pt-8">{footer}</View>
    </ScrollView>
  );
}

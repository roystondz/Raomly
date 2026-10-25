import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStay } from "@/hooks/use-stay";
import type { Policy, StayDetails } from "@/sanity/queries";
import { colors } from "@/theme";

type Content = (data: { stay: StayDetails; policies: Policy[] }) => ReactNode;

// Shared frame for the stay's sheets. Opened from the details screen the stay is
// already cached; opened cold (a link) it loads, with the same error handling.
export function StaySheet({ children, scroll = true }: { children: Content; scroll?: boolean }) {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stay, policies, loading, error, retry } = useStay(slug);
  const insets = useSafeAreaInsets();

  const body = stay ? (
    children({ stay, policies })
  ) : error ? (
    <View className="gap-3">
      <Alert tone="error" message="Couldn't load this stay. Check your connection and try again." />
      <Button size="sm" variant="secondary" title="Try again" className="self-start" onPress={retry} />
    </View>
  ) : loading ? (
    <ActivityIndicator color={colors.muted} className="py-10" />
  ) : null;

  if (!scroll) {
    // Sized to its content; the sheet adds the home-indicator space below it.
    return <View className="gap-5 bg-surface px-5 pb-4 pt-8">{body}</View>;
  }
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="gap-6 px-5 pt-8"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {body}
    </ScrollView>
  );
}

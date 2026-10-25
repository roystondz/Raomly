import { Fragment } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PolicyText } from "@/components/stay/policy-text";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePolicies } from "@/hooks/use-policies";
import { colors } from "@/theme";

// Every Roamly policy, word for word from Sanity. Opened from Profile.
export default function PoliciesSheet() {
  const insets = useSafeAreaInsets();
  const { policies, loading, error, retry } = usePolicies();

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="gap-5 px-5 pt-8"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text variant="title-sm" accessibilityRole="header">
        Roamly policies
      </Text>
      {error ? (
        <View className="gap-3">
          <Alert tone="error" message="Couldn't load policies. Check your connection and try again." />
          <Button size="sm" variant="secondary" title="Try again" className="self-start" onPress={retry} />
        </View>
      ) : loading ? (
        <ActivityIndicator color={colors.muted} className="py-10" />
      ) : policies && policies.length === 0 ? (
        <Text tone="muted">No policies are published yet.</Text>
      ) : (
        policies?.map((policy, i) => (
          <Fragment key={policy.id}>
            {i > 0 ? <View className="h-px bg-line" /> : null}
            <PolicyText policy={policy} />
          </Fragment>
        ))
      )}
    </ScrollView>
  );
}

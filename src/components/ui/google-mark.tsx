import { View } from "react-native";

import { Text } from "./text";

// PLACEHOLDER: the Google "G" is a brand asset and must not be recreated.
// Replace with an expo-image of assets/images/google-g.png once provided.
export function GoogleMark() {
  return (
    <View className="size-6 items-center justify-center rounded-full border border-dashed border-muted">
      <Text variant="footnote-medium" tone="muted">
        G
      </Text>
    </View>
  );
}

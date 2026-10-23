import { View } from "react-native";

import { Text } from "@/components/ui/text";

export function OrDivider() {
  return (
    <View className="my-5 flex-row items-center gap-4">
      <View className="h-px flex-1 bg-line" />
      <Text variant="caption" tone="muted">
        or
      </Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

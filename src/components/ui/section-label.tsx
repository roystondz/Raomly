import { View } from "react-native";

import { cn } from "@/utils/cn";

import { Text } from "./text";

// Editorial section heading: small uppercase label over a hairline. Replaces
// the filled grey panels that used to group content.
export function SectionLabel({ label, className }: { label: string; className?: string }) {
  return (
    <View className={cn("gap-2", className)}>
      <Text variant="eyebrow" tone="muted" accessibilityRole="header">
        {label}
      </Text>
      <View className="h-px bg-line" />
    </View>
  );
}

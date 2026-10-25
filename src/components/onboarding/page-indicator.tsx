import { View } from "react-native";

import { cn } from "@/utils/cn";

export function PageIndicator({ count, index }: { count: number; index: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`Slide ${index + 1} of ${count}`}
      className="flex-row gap-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className={cn("h-1 w-8 rounded-full", i === index ? "bg-accent-400" : "bg-line")} />
      ))}
    </View>
  );
}

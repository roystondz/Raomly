import { CalendarDays } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

// PLACEHOLDER: trips arrive with booking.
export default function TripsScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-surface px-8">
      {/* Editorial empty state: a hairline-framed mark, a serif title. */}
      <View className="size-20 items-center justify-center rounded-lg border border-line">
        <Icon icon={CalendarDays} size={30} color="accent-600" />
      </View>
      <Text variant="title" accessibilityRole="header">
        No trips yet
      </Text>
      <Text tone="muted" className="text-center">
        Stays you book will show up here.
      </Text>
    </View>
  );
}

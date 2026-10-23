import { CalendarDays } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

// PLACEHOLDER: trips arrive with booking.
export default function TripsScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-surface px-8">
      <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon icon={CalendarDays} size={28} />
      </View>
      <Text variant="title-sm" accessibilityRole="header">
        No trips yet
      </Text>
      <Text tone="muted" className="text-center">
        Stays you book will show up here.
      </Text>
    </View>
  );
}

import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { StayDetails } from "@/sanity/queries";
import { minimumStayTotal } from "@/stay/format";

// Fixed price bar. Booking isn't built yet; onBook shows a coming-soon message.
export function BookingBar({ stay, onBook }: { stay: StayDetails; onBook: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: insets.bottom + 8 }}
      className="absolute inset-x-0 bottom-0 flex-row items-center border-t border-line bg-surface px-5 pt-4"
    >
      <View>
        <View className="flex-row items-baseline gap-1">
          <Text variant="title">${stay.pricePerNight}</Text>
          <Text variant="body">/ night</Text>
        </View>
        <Text variant="body" tone="subtle">
          {minimumStayTotal(stay)}
        </Text>
      </View>
      <Button size="lg" title="Book this stay" onPress={onBook} className="ml-4 flex-1" />
    </View>
  );
}

import { Star } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { SectionLabel } from "@/components/ui/section-label";
import { Text } from "@/components/ui/text";
import type { StayDetails } from "@/sanity/queries";
import { amenityRow } from "@/stay/format";

// Editorial header: a serif title, one line of facts, then "What's here" as a
// two-column list.
export function StaySummary({ stay }: { stay: StayDetails }) {
  const amenities = amenityRow(stay, 6);
  return (
    <View>
      <Text variant="title-lg" accessibilityRole="header">
        {stay.title}
      </Text>

      <View
        accessible
        accessibilityLabel={`Rated ${stay.rating.toFixed(1)} from ${stay.reviewCount} reviews, ${stay.location}`}
        className="mt-3 flex-row items-center gap-1.5"
      >
        <Icon icon={Star} size={16} color="primary" fill="primary" />
        <Text variant="caption">{stay.rating.toFixed(1)}</Text>
        <Text variant="caption-regular" tone="muted" numberOfLines={1} className="flex-1">
          · {stay.reviewCount} reviews · {stay.location}
        </Text>
      </View>

      {amenities.length > 0 ? (
        <View className="mt-7">
          <SectionLabel label="What's here" />
          <View className="mt-4 flex-row flex-wrap gap-y-3.5">
            {amenities.map((amenity) => (
              <View key={amenity.label} className="w-1/2 flex-row items-center gap-3 pr-2">
                <Icon icon={amenity.icon} size={22} color="accent-600" />
                <Text variant="body" numberOfLines={1} className="flex-1">
                  {amenity.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

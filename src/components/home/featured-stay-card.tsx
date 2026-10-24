import { Image } from "expo-image";
import { ChevronRight, MapPin, Star } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { sanityImage } from "@/sanity/image";
import type { HomeStay } from "@/sanity/queries";
import { colors } from "@/theme";

// Matches h-67 and the screen's px-5 gutters, for sizing the CDN image.
const CARD_HEIGHT = 268;
const SCREEN_GUTTERS = 40;

// Darkens the lower part of the photo so on-ink text reads on any image.
const bottomScrim = { backgroundImage: `linear-gradient(to bottom, transparent 35%, ${colors.scrim})` };

// Large photo card from the home design. Not pressable yet: there is no stay
// detail screen, so the chevron is decorative.
export function FeaturedStayCard({ stay }: { stay: Pick<HomeStay, "title" | "location" | "rating" | "imageUrl" | "imageAlt"> }) {
  const { width } = useWindowDimensions();
  return (
    <View
      accessible
      accessibilityLabel={`${stay.title}, ${stay.location}, rated ${stay.rating.toFixed(1)}`}
      className="h-67 overflow-hidden rounded-2xl corner-squircle bg-surface-muted"
    >
      <Image
        source={{ uri: sanityImage(stay.imageUrl, width - SCREEN_GUTTERS, CARD_HEIGHT) }}
        alt={stay.imageAlt}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <View style={[StyleSheet.absoluteFill, bottomScrim]} />

      <View className="absolute right-4 top-4 h-11 flex-row items-center gap-1.5 rounded-full bg-surface px-4">
        <Icon icon={Star} size={20} fill="ink" />
        <Text variant="headline">{stay.rating.toFixed(1)}</Text>
      </View>

      <View className="absolute bottom-5 left-5 right-24 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Icon icon={MapPin} size={18} color="on-ink" />
          <Text variant="caption" tone="on-ink" numberOfLines={1}>
            {stay.location}
          </Text>
        </View>
        <Text variant="title" tone="on-ink" numberOfLines={2}>
          {stay.title}
        </Text>
      </View>

      <View className="absolute bottom-4 right-4 size-15 items-center justify-center rounded-full bg-surface">
        <Icon icon={ChevronRight} size={26} />
      </View>
    </View>
  );
}

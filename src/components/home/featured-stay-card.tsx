import { Image } from "expo-image";
import { MapPin, Star } from "lucide-react-native";
import { useWindowDimensions, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Text } from "@/components/ui/text";
import { sanityImage } from "@/sanity/image";
import type { HomeStay } from "@/sanity/queries";

// The screen's px-5 gutters, for sizing the photo and its CDN image.
const SCREEN_GUTTERS = 40;
// Editorial 4:3 photo.
const PHOTO_RATIO = 3 / 4;

// Editorial stay entry: the photo on top, the words below it (never over it),
// closed by a hairline.
export function FeaturedStayCard({
  stay,
  onPress,
}: {
  stay: Pick<HomeStay, "title" | "location" | "rating" | "imageUrl" | "imageAlt">;
  onPress?: () => void;
}) {
  const { width } = useWindowDimensions();
  const photoWidth = width - SCREEN_GUTTERS;
  const photoHeight = Math.round(photoWidth * PHOTO_RATIO);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${stay.title}, ${stay.location}, rated ${stay.rating.toFixed(1)}`}
      onPress={onPress}
      className="border-b border-line pb-5"
    >
      <View style={{ height: photoHeight }} className="overflow-hidden rounded-lg bg-surface-muted">
        <Image
          source={{ uri: sanityImage(stay.imageUrl, photoWidth, photoHeight) }}
          alt={stay.imageAlt}
          style={{ flex: 1 }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View className="mt-3 flex-row items-start gap-3">
        <Text variant="title-sm" numberOfLines={2} className="flex-1">
          {stay.title}
        </Text>
        <View className="flex-row items-center gap-1 pt-1">
          <Icon icon={Star} size={16} color="primary" fill="primary" />
          <Text variant="caption">{stay.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View className="mt-1 flex-row items-center gap-1.5">
        <Icon icon={MapPin} size={16} color="muted" />
        <Text variant="caption-regular" tone="muted" numberOfLines={1}>
          {stay.location}
        </Text>
      </View>
    </PressableScale>
  );
}

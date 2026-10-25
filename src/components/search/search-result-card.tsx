import { Image } from "expo-image";
import { Heart, Star } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { sanityImage } from "@/sanity/image";
import { amenityMeta, petsMeta } from "@/search/amenities";
import type { SearchStay } from "@/search/build-query";
import type { Amenity } from "@/search/types";

// Square editorial thumbnail (size-24), also the size requested from the image CDN.
const THUMB = 96;
const MAX_FEATURES = 2;

type Props = {
  stay: SearchStay;
  // Amenities the query asked for come first, so the row shows why it matched.
  highlight: Amenity[];
  saved: boolean;
  onToggleSave: () => void;
  onPress?: () => void;
};

// Compact editorial result: thumbnail, serif title, facts as text, closed by a hairline.
export function SearchResultCard({
  stay,
  highlight,
  saved,
  onToggleSave,
  onPress,
}: Props) {
  const asked = stay.amenities.filter((a) => highlight.includes(a));
  const others = stay.amenities.filter((a) => !highlight.includes(a));
  const features = [
    ...asked.map((a) => amenityMeta[a].label),
    ...(stay.petsAllowed ? [petsMeta.label] : []),
    ...others.map((a) => amenityMeta[a].label),
  ].slice(0, MAX_FEATURES);

  return (
    // The heart is a sibling of the card, not a child: iOS hides the children of
    // an accessible element from VoiceOver, which made it unreachable. It sits
    // over the title row's right end, which the title leaves room for.
    <View className="border-b border-line">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${stay.title}, ${stay.location}, \$${stay.pricePerNight} a night`}
        onPress={onPress}
        className="flex-row gap-4 py-4 active:opacity-70"
      >
        <View className="size-24 overflow-hidden rounded-md bg-surface-muted">
          <Image
            source={{ uri: sanityImage(stay.imageUrl, THUMB, THUMB) }}
            accessibilityLabel={stay.imageAlt}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="title-xs" numberOfLines={2} className="pr-9">
            {stay.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Icon icon={Star} size={14} color="primary" fill="primary" />
            <Text variant="caption-regular">{stay.rating.toFixed(1)}</Text>
            <Text variant="caption-regular" tone="muted" numberOfLines={1} className="flex-1">
              ({stay.reviewCount}) · {stay.location}
            </Text>
          </View>
          {features.length > 0 ? (
            <Text variant="caption-regular" tone="muted" numberOfLines={1}>
              {features.join(" · ")}
            </Text>
          ) : null}
          <View className="mt-0.5 flex-row items-baseline gap-1">
            <Text variant="headline">${stay.pricePerNight}</Text>
            <Text variant="caption-regular" tone="muted">
              night
            </Text>
          </View>
        </View>
      </Pressable>
      <IconButton
        variant="plain"
        icon={Heart}
        fill={saved ? "ink" : undefined}
        accessibilityLabel={saved ? "Remove from saved" : "Save stay"}
        accessibilityState={{ selected: saved }}
        onPress={onToggleSave}
        className="absolute -right-2 top-2.5"
      />
    </View>
  );
}

// Same layout as a result while a search loads.
export function SearchResultSkeleton() {
  return (
    <View
      className="flex-row gap-4 border-b border-line py-4"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="size-24 rounded-md bg-surface-muted" />
      <View className="flex-1 gap-2.5 py-1">
        <View className="h-5 w-4/5 rounded-sm bg-surface-muted" />
        <View className="h-4 w-1/2 rounded-sm bg-surface-muted" />
        <View className="h-4 w-1/3 rounded-sm bg-surface-muted" />
      </View>
    </View>
  );
}

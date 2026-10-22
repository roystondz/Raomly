import { Image } from "expo-image";
import { Heart, MapPin, Star, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

export type ListingCardStay = {
  title: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: { label: string; icon: LucideIcon }[];
};

export type ListingCardProps = {
  stay: ListingCardStay;
  saved?: boolean;
  onToggleSave?: () => void;
  onPress?: () => void;
  className?: string;
};

export function ListingCard({ stay, saved = false, onToggleSave, onPress, className }: ListingCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "flex-row gap-3 rounded-xl corner-squircle bg-surface p-2 shadow-card active:opacity-90",
        className,
      )}
    >
      <View className="min-h-39 w-36 self-stretch overflow-hidden rounded-lg corner-squircle bg-surface-muted">
        <Image source={{ uri: stay.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <IconButton
          variant="overlay"
          icon={Heart}
          fill={saved ? "ink" : undefined}
          accessibilityLabel={saved ? "Remove from saved" : "Save stay"}
          accessibilityState={{ selected: saved }}
          onPress={onToggleSave}
          className="absolute right-2 top-2"
        />
      </View>
      <View className="flex-1 gap-1.5 py-1 pr-1">
        <Text variant="title-sm" numberOfLines={2}>
          {stay.title}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon icon={MapPin} size={16} color="subtle" />
          <Text variant="caption" tone="muted" numberOfLines={1} className="flex-1">
            {stay.location}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Icon icon={Star} size={16} color="primary" fill="primary" />
          <Text variant="caption">{stay.rating.toFixed(1)}</Text>
          <Text variant="caption" tone="muted">
            ({stay.reviewCount})
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {stay.amenities.map((amenity) => (
            <View key={amenity.label} className="h-7 flex-row items-center gap-1 rounded-full bg-surface-muted px-2.5">
              <Icon icon={amenity.icon} size={14} />
              <Text variant="footnote-medium">
                {amenity.label}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text variant="title-sm">${stay.pricePerNight}</Text>
          <Text variant="body" tone="subtle">
            / night
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

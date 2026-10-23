import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";

import { CurvedSheet } from "./curved-sheet";
import { LocationChip } from "./location-chip";
import { PageIndicator } from "./page-indicator";
import type { OnboardingSlide as Slide } from "./slides";

export type OnboardingSlideProps = {
  slide: Slide;
  index: number;
  count: number;
  width: number;
  // Height of the fixed button block drawn over the bottom of every slide.
  footerHeight: number;
};

export function OnboardingSlide({ slide, index, count, width, footerHeight }: OnboardingSlideProps) {
  return (
    <View style={{ width }} className="h-full justify-end">
      <Image
        source={{ uri: slide.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
        accessibilityIgnoresInvertColors
      />
      <LocationChip location={slide.location} className="-mb-1 ml-6" />
      <CurvedSheet>
        <View className="gap-2 px-8" style={{ paddingBottom: footerHeight }}>
          <PageIndicator count={count} index={index} />
          <Text variant="hero" accessibilityRole="header" className="mt-4">
            {slide.title}
          </Text>
          <Text tone="muted" className="mb-4">
            {slide.body}
          </Text>
        </View>
      </CurvedSheet>
    </View>
  );
}

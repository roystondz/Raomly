import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui/text";
import { sanityImage } from "@/sanity/image";
import { colors } from "@/theme";

// Full-bleed photos; the content starts below them.
export const HERO_HEIGHT = 336;

// Darkens the top of the photo so the white buttons and light status bar read on any image.
const topScrim = { backgroundImage: `linear-gradient(to bottom, ${colors.scrim}, transparent 40%)` };

type Photo = { url: string; alt: string };

// Full-width photos, one page per swipe, with a "1 / 3" counter.
export function PhotoPager({ photos }: { photos: Photo[] }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <View style={{ height: HERO_HEIGHT }} className="bg-surface-muted">
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(photo) => photo.url}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <Image
            source={{ uri: sanityImage(item.url, width, HERO_HEIGHT) }}
            accessibilityLabel={item.alt}
            style={{ width, height: HERO_HEIGHT }}
            contentFit="cover"
            transition={200}
          />
        )}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, topScrim]} />
      {photos.length > 1 ? (
        <View
          pointerEvents="none"
          className="absolute bottom-4 right-4 h-8 justify-center rounded-sm bg-ink/80 px-3"
          accessibilityLabel={`Photo ${index + 1} of ${photos.length}`}
        >
          <Text variant="caption" tone="on-ink">
            {index + 1} / {photos.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

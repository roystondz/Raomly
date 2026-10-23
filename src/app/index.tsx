import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";

import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";
import { SkipButton } from "@/components/onboarding/skip-button";
import { slides } from "@/components/onboarding/slides";
import { Button } from "@/components/ui/button";
import { GoogleMark } from "@/components/ui/google-mark";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const tone = slides[index].tone;

  return (
    <View className="flex-1 bg-ink">
      <StatusBar style={tone === "dark" ? "light" : "dark"} />
      <FlatList
        data={slides}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => (
          <OnboardingSlide slide={item} index={i} count={slides.length} width={width} footerHeight={footerHeight} />
        )}
      />

      <View className="absolute inset-x-0 top-safe h-11 flex-row items-center justify-between px-6">
        <Logo height={54} color={tone === "dark" ? "on-ink" : "ink"} />
        <SkipButton onPress={() => router.push("/sign-in")} />
      </View>

      <View
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        className="absolute inset-x-0 bottom-0 gap-3 px-6 pb-5"
      >
        <Button title="Get started" trailing={<Icon icon={ArrowRight} />} onPress={() => router.push("/sign-up")} />
        <Button
          variant="secondary"
          title="Continue with Google"
          leading={<GoogleMark />}
          onPress={() => router.push("/sign-in")}
        />
      </View>
    </View>
  );
}

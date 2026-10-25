import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, FileText, Heart, MessageSquareMore, SearchX, Share as ShareIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert as NativeAlert, ScrollView, Share, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookingBar } from "@/components/stay/booking-bar";
import { HostRow } from "@/components/stay/host-row";
import { HERO_HEIGHT, PhotoPager } from "@/components/stay/photo-pager";
import { StaySummary } from "@/components/stay/stay-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { PolicyCard } from "@/components/ui/policy-card";
import { SectionLabel } from "@/components/ui/section-label";
import { Text } from "@/components/ui/text";
import { stayAnalytics, staySource } from "@/config/stay-analytics";
import { toggleSavedStay, useSavedStays } from "@/hooks/use-saved-stays";
import { useStay } from "@/hooks/use-stay";

// Clears the fixed booking bar (≈ 97pt with the home indicator).
const BAR_CLEARANCE = 128;

export default function StayDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug, from } = useLocalSearchParams<{ slug: string; from?: string }>();
  const source = staySource(from);
  const { stay, loading, error, notFound, retry } = useStay(slug);
  const saved = useSavedStays();

  // stay_opened once per visit, when the stay has loaded; failures once per failure.
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (stay && reported.current !== stay.id) {
      reported.current = stay.id;
      stayAnalytics.opened(stay, source);
    }
  }, [stay, source]);
  useEffect(() => {
    if (error) stayAnalytics.openFailed(source, error.name);
    if (notFound) stayAnalytics.openFailed(source, "not_found");
  }, [error, notFound, source]);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const overlayTop = { top: insets.top + 4 };
  // Once the photos scroll away, a solid bar sits behind the buttons so they
  // never float over the title. ≈ button height (56) + 12.
  const headerHeight = insets.top + 68;
  const [solidHeader, setSolidHeader] = useState(false);
  // White over photos and the grey loading hero; grey on the plain error and not-found screens.
  const backButton = (
    <View className="absolute left-5" style={overlayTop}>
      <IconButton
        variant={error || notFound ? "filled" : "overlay-lg"}
        icon={ChevronLeft}
        accessibilityLabel="Back"
        onPress={back}
      />
    </View>
  );

  if (!stay) {
    return (
      <View className="flex-1 bg-surface">
        <StatusBar style="dark" />
        {notFound || error ? (
          <View style={{ paddingTop: insets.top + 88 }} className="flex-1 items-center gap-3 px-5">
            {notFound ? (
              <>
                <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
                  <Icon icon={SearchX} size={28} />
                </View>
                <Text variant="title-sm" accessibilityRole="header">
                  {"This stay isn't available"}
                </Text>
                <Button size="sm" variant="secondary" title="Back to stays" onPress={back} />
              </>
            ) : (
              <View className="w-full gap-3">
                <Alert tone="error" message="Couldn't load this stay. Check your connection and try again." />
                <Button size="sm" variant="secondary" title="Try again" className="self-start" onPress={retry} />
              </View>
            )}
          </View>
        ) : loading ? (
          <StaySkeleton />
        ) : null}
        {backButton}
      </View>
    );
  }

  const isSaved = saved.has(stay.id);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style={solidHeader ? "dark" : "light"} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: BAR_CLEARANCE + insets.bottom }}
        contentInsetAdjustmentBehavior="never"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const solid = e.nativeEvent.contentOffset.y > HERO_HEIGHT - headerHeight;
          if (solid !== solidHeader) setSolidHeader(solid);
        }}
      >
        <PhotoPager photos={stay.photos} />

        {/* Editorial: the words start below the photos, never over them. */}
        <View className="px-5 pt-6">
          <StaySummary stay={stay} />

          <View className="mt-8">
            <SectionLabel label="Good to know" />
            <PolicyCard
              size="lg"
              icon={MessageSquareMore}
              title="Ask about policies"
              description="Cancellation, house rules, pets, check-in and more."
              onPress={() => router.push({ pathname: "/stay/[slug]/ask", params: { slug: stay.slug } })}
            />
            <PolicyCard
              size="lg"
              icon={FileText}
              title={stay.cancellation.title}
              description={stay.cancellation.summary}
              onPress={() => router.push({ pathname: "/stay/[slug]/cancellation", params: { slug: stay.slug } })}
            />
          </View>

          <View className="mt-8">
            <SectionLabel label="Your host" />
            <HostRow
              host={stay.host}
              onPress={() => router.push({ pathname: "/stay/[slug]/host", params: { slug: stay.slug } })}
            />
          </View>
        </View>
      </ScrollView>

      {solidHeader ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={{ height: headerHeight }}
          className="absolute inset-x-0 top-0 border-b border-line bg-surface"
        />
      ) : null}
      {backButton}
      <View className="absolute right-5 flex-row gap-3" style={overlayTop}>
        <IconButton
          variant="overlay-lg"
          icon={ShareIcon}
          accessibilityLabel="Share stay"
          onPress={() => Share.share({ message: `${stay.title} in ${stay.location}, on Roamly` })}
        />
        <IconButton
          variant="overlay-lg"
          icon={Heart}
          fill={isSaved ? "ink" : undefined}
          accessibilityLabel={isSaved ? "Remove from saved" : "Save stay"}
          accessibilityState={{ selected: isSaved }}
          onPress={() => toggleSavedStay(stay.id, "stay_details")}
        />
      </View>

      <BookingBar
        stay={stay}
        onBook={() => {
          stayAnalytics.bookTapped(stay);
          NativeAlert.alert("Coming soon", "Booking isn't available yet. Save this stay to come back to it.");
        }}
      />
    </View>
  );
}

function StaySkeleton() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ height: HERO_HEIGHT }} className="bg-surface-muted" />
      <View className="gap-3 px-5 pt-6">
        <View className="h-8 w-4/5 rounded-sm bg-surface-muted" />
        <View className="h-8 w-1/2 rounded-sm bg-surface-muted" />
        <View className="h-5 w-2/5 rounded-sm bg-surface-muted" />
        <View className="mt-6 h-20 rounded-xl bg-surface-muted" />
        <View className="h-20 rounded-xl bg-surface-muted" />
      </View>
    </View>
  );
}

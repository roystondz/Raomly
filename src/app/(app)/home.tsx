import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowUpRight, Building2, House, Sparkles, TreePalm, TreePine, Waves } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, ScrollView, TextInput, View } from "react-native";
import { usePostHog } from "posthog-react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

import { FeaturedStayCard } from "@/components/home/featured-stay-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Text } from "@/components/ui/text";
import type { StayType } from "@/search/types";
import { useHomeStays } from "@/hooks/use-home-stays";
import { colors } from "@/theme";

const EXAMPLE_QUERY = "quiet pet friendly cabin with hot tub";

const CATEGORIES: { label: string; type: StayType | null; icon: typeof House; plural: string }[] = [
  { label: "All Stays", type: null, icon: House, plural: "stays" },
  { label: "Cabins", type: "cabin", icon: TreePine, plural: "cabin stays" },
  { label: "Beach", type: "beach", icon: Waves, plural: "beach stays" },
  { label: "City", type: "city", icon: Building2, plural: "city stays" },
  { label: "Villas", type: "villa", icon: TreePalm, plural: "villa stays" },
];

// Filtering explains itself: removed cards fade, new ones fade in, the rest
// slide into place. Reduce Motion keeps the fades and drops the movement.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const CARD_ENTER = FadeIn.duration(200).easing(EASE_OUT).reduceMotion(ReduceMotion.Never);
const CARD_EXIT = FadeOut.duration(150).easing(EASE_OUT).reduceMotion(ReduceMotion.Never);
const CARD_LAYOUT = LinearTransition.duration(250).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

export default function HomeScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StayType | null>(null);
  // Featured stays lead the list; the query already orders them.
  const { stays, loading, error, refreshing, refresh, retry } = useHomeStays();

  const firstName = user?.firstName || user?.fullName?.split(" ")[0];
  const visibleStays = stays && category ? stays.filter((stay) => stay.type === category) : stays;
  const plural = CATEGORIES.find((c) => c.type === category)?.plural ?? "stays";

  const submit = () => {
    const q = query.trim() || EXAMPLE_QUERY;
    posthog?.capture("stay_search_submitted", {
      search_source: "home",
      query_length: q.length,
    });
    router.navigate({ pathname: "/search", params: { q } });
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-5 pb-8 pt-2"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.muted} />}
    >
      <View className="flex-row items-start justify-between">
        <View className="pt-6">
          <Logo height={40} />
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.navigate("/profile")}
          className="size-21 overflow-hidden rounded-full bg-primary-50"
        >
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ flex: 1 }} contentFit="cover" accessibilityIgnoresInvertColors />
          ) : null}
        </PressableScale>
      </View>

      <Text variant="title-sm" tone="muted" className="mt-1">
        {firstName ? `Hey, ${firstName} 👋` : "Hey there 👋"}
      </Text>

      <Text variant="display" accessibilityRole="header" className="mt-1">
        Find your next stay
      </Text>

      {/* Editorial input: an underlined line, not a filled pill. */}
      <View className="mt-6 h-15 flex-row items-center gap-3 border-b-2 border-ink">
        <Icon icon={Sparkles} size={22} color="accent-600" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          placeholder={EXAMPLE_QUERY}
          placeholderTextColor={colors.muted}
          accessibilityLabel="Describe your stay"
          returnKeyType="search"
          submitBehavior="blurAndSubmit"
          className="flex-1 font-sans-medium text-input-sm text-ink"
        />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Search stays"
          onPress={submit}
          hitSlop={4}
          className="size-11 items-center justify-center rounded-full bg-ink"
        >
          <Icon icon={ArrowUpRight} size={22} color="on-ink" />
        </PressableScale>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2.5">
        {CATEGORIES.map((c) => (
          <Chip
            key={c.label}
            size="compact"
            icon={c.icon}
            label={c.label}
            selected={category === c.type}
            onPress={() => {
              setCategory(c.type);
              posthog?.capture("stay_category_filtered", { category: c.type ?? "all" });
            }}
          />
        ))}
      </View>

      {loading ? (
        <View className="mt-6 gap-5" accessibilityLabel="Loading stays">
          <View className="h-64 rounded-lg bg-surface-muted" />
          <View className="h-6 w-3/5 rounded-sm bg-surface-muted" />
          <View className="h-64 rounded-lg bg-surface-muted" />
        </View>
      ) : error && !stays ? (
        <View className="mt-10 items-center gap-3">
          <Text tone="muted" className="text-center">
            Couldn&apos;t load stays. Check your connection and try again.
          </Text>
          <Button size="sm" variant="secondary" title="Try again" onPress={retry} />
        </View>
      ) : visibleStays?.length === 0 ? (
        <Text tone="muted" className="mt-10 text-center">
          No {plural} yet
        </Text>
      ) : (
        /* No entrance on first render: home is seen too often to animate in. */
        <LayoutAnimationConfig skipEntering>
          <View className="mt-6 gap-5">
            {visibleStays?.map((stay) => (
              <Animated.View key={stay.id} entering={CARD_ENTER} exiting={CARD_EXIT} layout={CARD_LAYOUT}>
                <FeaturedStayCard
                  stay={stay}
                  onPress={() => router.push({ pathname: "/stay/[slug]", params: { slug: stay.slug, from: "home" } })}
                />
              </Animated.View>
            ))}
          </View>
        </LayoutAnimationConfig>
      )}
    </ScrollView>
  );
}

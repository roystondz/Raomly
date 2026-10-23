import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowUpRight, Building2, House, Search, Sparkles, TreePalm, TreePine, Waves } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

import { FeaturedStayCard } from "@/components/home/featured-stay-card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Text } from "@/components/ui/text";
import { stays, type StayType } from "@/data/stays";
import { colors } from "@/theme";

const EXAMPLE_QUERY = "quiet pet friendly cabin with hot tub";

const CATEGORIES: { label: string; type: StayType | null; icon: typeof House }[] = [
  { label: "All Stays", type: null, icon: House },
  { label: "Cabins", type: "cabin", icon: TreePine },
  { label: "Beach", type: "beach", icon: Waves },
  { label: "City", type: "city", icon: Building2 },
  { label: "Villas", type: "villa", icon: TreePalm },
];

// Filtering explains itself: removed cards fade, new ones fade in, the rest
// slide into place. Reduce Motion keeps the fades and drops the movement.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const CARD_ENTER = FadeIn.duration(200).easing(EASE_OUT).reduceMotion(ReduceMotion.Never);
const CARD_EXIT = FadeOut.duration(150).easing(EASE_OUT).reduceMotion(ReduceMotion.Never);
const CARD_LAYOUT = LinearTransition.duration(250).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

// Featured stays lead the "All" list.
const ORDERED_STAYS = [...stays].sort((a, b) => Number(b.featured) - Number(a.featured));

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StayType | null>(null);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0];
  const visibleStays = category ? ORDERED_STAYS.filter((stay) => stay.type === category) : ORDERED_STAYS;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  require("react").useEffect(() => { setTimeout(() => router.navigate({ pathname: "/search", params: { q: "quiet pet friendly cabin with a hot tub under $300" } }), 1500); }, []); // TEMP-SHOT
  const submit = () => {
    const q = query.trim() || EXAMPLE_QUERY;
    router.navigate({ pathname: "/search", params: { q } });
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-5 pb-8 pt-2"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
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

      <View className="mt-1 flex-row items-center gap-4">
        <Text variant="display" accessibilityRole="header" className="flex-1">
          Find your next stay
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Open search"
          onPress={() => router.navigate("/search")}
          className="h-21 w-15 items-center justify-center rounded-full bg-surface-muted"
        >
          <Icon icon={Search} size={28} />
        </PressableScale>
      </View>

      <View className="mt-6 h-15 flex-row items-center gap-2.5 rounded-full bg-lavender pl-4 pr-1.5">
        <Icon icon={Sparkles} size={22} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          placeholder={EXAMPLE_QUERY}
          placeholderTextColor={colors.ink}
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
          className="size-12 items-center justify-center rounded-full bg-surface"
        >
          <Icon icon={ArrowUpRight} size={24} />
        </PressableScale>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2.5">
        {CATEGORIES.map((c) => (
          <Chip
            key={c.label}
            size="compact"
            tone="primary"
            appearance="muted"
            icon={c.icon}
            label={c.label}
            selected={category === c.type}
            onPress={() => setCategory(c.type)}
          />
        ))}
      </View>

      {/* No entrance on first render: home is seen too often to animate in. */}
      <LayoutAnimationConfig skipEntering>
        <View className="mt-6 gap-5">
          {visibleStays.map((stay) => (
            <Animated.View key={stay.id} entering={CARD_ENTER} exiting={CARD_EXIT} layout={CARD_LAYOUT}>
              <FeaturedStayCard stay={stay} />
            </Animated.View>
          ))}
        </View>
      </LayoutAnimationConfig>
    </ScrollView>
  );
}

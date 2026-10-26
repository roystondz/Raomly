import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDown, ChevronLeft, Search, SearchX, Sparkles, X } from "lucide-react-native";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActionSheetIOS,
  Alert as NativeAlert,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type TextInputInstance,
} from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";

import { SearchResultCard, SearchResultSkeleton } from "@/components/search/search-result-card";
import { searchAnalytics } from "@/config/search-analytics";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { toggleSavedStay, useSavedStays } from "@/hooks/use-saved-stays";
import { useStaySearch } from "@/hooks/use-stay-search";
import { useTabTopInset } from "@/hooks/use-tab-top-inset";
import type { SearchStay } from "@/search/build-query";
import { isChipSelected, toggleChip } from "@/search/chips";
import { hasExactFilters } from "@/search/parse-query";
import { HOME_COUNTRY } from "@/search/places";
import type { Amenity } from "@/search/types";
import { colors } from "@/theme";

const EXAMPLES = [
  "quiet pet friendly cabin with a hot tub under $300",
  "beach house for 6 under $400",
  "city loft with a workspace",
];

const SORTS = {
  best: "Best match",
  "price-asc": "Lowest price",
  "price-desc": "Highest price",
  rating: "Top rated",
} as const;
type SortKey = keyof typeof SORTS;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

function sortStays(stays: SearchStay[], sort: SortKey) {
  if (sort === "best") return stays;
  const sorted = [...stays];
  if (sort === "price-asc") sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sort === "price-desc") sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
  if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  return sorted;
}

export default function SearchScreen() {
  const router = useRouter();
  const topInset = useTabTopInset();
  const posthog = usePostHog();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const search = useStaySearch();
  const input = useRef<TextInputInstance>(null);
  const [draft, setDraft] = useState(q ?? "");
  const [sort, setSort] = useState<SortKey>("best");
  const saved = useSavedStays();
  // Bumped per submitted sentence: only those results replay their entrance.
  // Chip and sort changes just reflow.
  const [submitId, setSubmitId] = useState(0);
  const [animate, setAnimate] = useState(true);
  // Soft-only results stay hidden until the guest asks for them (see closestOnly).
  const [showClosest, setShowClosest] = useState(false);

  const [lastQ, setLastQ] = useState(q);

  const resetForNewSentence = (text: string) => {
    setDraft(text);
    setSort("best");
    setShowClosest(false);
    setSubmitId((id) => id + 1);
    setAnimate(true);
  };

  const submit = (text: string, source: "search_bar" | "suggested_query") => {
    resetForNewSentence(text);
    if (text.trim()) {
      posthog.capture("stay_search_submitted", { search_source: source, query_length: text.trim().length });
    }
    search.search(text, source);
  };

  // Empties the field and drops the results and every filter chip with it,
  // then leaves the cursor in the field for the next sentence.
  const clear = () => {
    setDraft("");
    setSort("best");
    setShowClosest(false);
    search.search("", "search_bar");
    input.current?.focus();
  };

  // A sentence from Home arrives as ?q= (Home already sent stay_search_submitted).
  // Local state follows it during render; the request starts in the effect.
  if (q !== lastQ) {
    setLastQ(q);
    if (q) resetForNewSentence(q);
  }
  const { search: runSearch } = search;
  useEffect(() => {
    if (q) runSearch(q, "home");
  }, [q, runSearch]);

  const stays = useMemo(() => (search.stays ? sortStays(search.stays, sort) : null), [search.stays, sort]);
  const highlight: Amenity[] = search.parsed?.amenities ?? [];
  // Embeddings always return the nearest stays, even for words nothing relates
  // to ("igloo on the moon" scores like "secluded"). So when only soft words are
  // left, nothing is shown as a result: the guest sees a no-match screen and
  // can opt in to the closest stays, which are then labelled as such.
  const closestOnly = search.parsed ? !hasExactFilters(search.parsed) : false;
  const hideClosest = closestOnly && !showClosest && !!stays && stays.length > 0;

  const openSort = () => {
    const keys = Object.keys(SORTS) as SortKey[];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: "Sort by", options: [...keys.map((k) => SORTS[k]), "Cancel"], cancelButtonIndex: keys.length },
        (index) => {
          if (index < keys.length) setSort(keys[index]);
        },
      );
      return;
    }
    // Android alerts hold at most 3 buttons, so list the other three choices.
    NativeAlert.alert(
      "Sort by",
      undefined,
      keys.filter((k) => k !== sort).map((k) => ({ text: SORTS[k], onPress: () => setSort(k) })),
      { cancelable: true },
    );
  };

  const hasQuery = search.text.length > 0;
  const firstLoad = search.loading && !stays;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="pb-8"
      contentContainerStyle={{ paddingTop: 8 + topInset }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {/* Header: back and an underlined search field. No filter icon until a filter plan. */}
      <View className="flex-row items-center gap-2 px-4">
        <IconButton
          variant="plain"
          icon={ChevronLeft}
          accessibilityLabel="Back to home"
          onPress={() => router.navigate("/home")}
        />
        <View className="h-13 flex-1 flex-row items-center gap-3 border-b-2 border-ink">
          <Icon icon={Search} size={22} color="accent-600" />
          <TextInput
            ref={input}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => submit(draft, "search_bar")}
            placeholder="Describe your stay"
            placeholderTextColor={colors.muted}
            selectionColor={colors["accent-600"]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Describe your stay"
            className="h-full flex-1 font-sans-medium text-input text-ink"
          />
          {draft ? (
            <IconButton variant="plain" icon={X} color="muted" accessibilityLabel="Clear search" onPress={clear} />
          ) : null}
        </View>
      </View>

      {!hasQuery ? (
        <EmptyQuery onPick={(example) => submit(example, "suggested_query")} />
      ) : (
        <>
          {search.chips.length > 0 && search.parsed ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 grow-0"
              contentContainerClassName="gap-2.5 px-4"
              keyboardShouldPersistTaps="handled"
            >
              {search.chips.map((chip) => (
                <Chip
                  key={chip.key}
                  size="xs"
                  label={chip.label}
                  selected={isChipSelected(search.parsed!, chip)}
                  onPress={() => {
                    setAnimate(false);
                    setShowClosest(false);
                    search.applyFilters(toggleChip(search.parsed!, chip));
                  }}
                />
              ))}
            </ScrollView>
          ) : null}

          <View className="mt-4 flex-row items-center justify-between px-4">
            <Text variant="eyebrow" tone="muted" accessibilityLiveRegion="polite">
              {firstLoad
                ? "Searching…"
                : stays && stays.length > 0 && !hideClosest
                  ? closestOnly
                    ? "Closest matches"
                    : stays.length === 1
                      ? "1 stay"
                      : `${stays.length} stays`
                  : ""}
            </Text>
            {stays && stays.length > 1 && !hideClosest ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${SORTS[sort]}`}
                onPress={openSort}
                hitSlop={8}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Text variant="caption-regular" tone="muted">
                  Sort by
                </Text>
                <Text variant="headline">{SORTS[sort]}</Text>
                <Icon icon={ChevronDown} size={18} />
              </Pressable>
            ) : null}
          </View>

          <View className="mt-3 px-4">
            {search.error ? (
              <View className="gap-3">
                <Alert tone="error" message="Couldn't load stays. Check your connection and try again." />
                <Button size="sm" variant="secondary" title="Try again" className="self-start" onPress={search.retry} />
              </View>
            ) : firstLoad ? (
              <View>
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </View>
            ) : hideClosest ? (
              <NoExactMatch
                onShowClosest={() => {
                  setAnimate(true);
                  setShowClosest(true);
                  searchAnalytics.closestShown({ shownCount: stays.length });
                }}
                onPick={(example) => submit(example, "suggested_query")}
              />
            ) : stays && stays.length === 0 ? (
              <NoResults
                missingPlace={
                  search.parsed?.country && search.parsed.country !== HOME_COUNTRY ? search.parsed.place : undefined
                }
                filtersChanged={search.filtersChanged}
                onClear={() => {
                  if (search.filtersChanged) {
                    setAnimate(false);
                    search.resetFilters();
                  } else {
                    clear();
                  }
                }}
              />
            ) : stays ? (
              <View key={submitId} className={search.loading ? "opacity-60" : undefined}>
                {stays.map((stay, index) => (
                  <ResultRow key={stay.id} index={index} animate={animate}>
                    <SearchResultCard
                      stay={stay}
                      highlight={highlight}
                      saved={saved.has(stay.id)}
                      onToggleSave={() => toggleSavedStay(stay.id, "search")}
                      onPress={() => router.push({ pathname: "/stay/[slug]", params: { slug: stay.slug, from: "search" } })}
                    />
                  </ResultRow>
                ))}
              </View>
            ) : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Results of a newly submitted sentence come in with a short stagger. Reduce
// Motion keeps the fade and drops the slide.
function ResultRow({ index, animate, children }: { index: number; animate: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  const entering = useMemo(
    () =>
      animate
        ? (reduced ? FadeIn : FadeInDown).duration(250).delay(Math.min(index, 6) * 40).easing(EASE_OUT)
        : undefined,
    [animate, reduced, index],
  );
  return <Animated.View entering={entering}>{children}</Animated.View>;
}

function EmptyQuery({ onPick }: { onPick: (example: string) => void }) {
  return (
    <View className="gap-4 px-4 pt-6">
      <View className="flex-row items-center gap-2">
        <Icon icon={Sparkles} size={20} color="accent-600" />
        <Text variant="headline">Describe your stay in one sentence</Text>
      </View>
      <Text tone="muted">Price, guests, pets, type, place and amenities filter. Words like quiet or cozy help rank.</Text>
      <View className="items-start gap-2">
        {EXAMPLES.map((example) => (
          <Chip key={example} size="sm" label={example} onPress={() => onPick(example)} />
        ))}
      </View>
    </View>
  );
}

// Only soft words were left, so nothing the guest asked for can be checked
// exactly. Shown instead of the ranked list, which stays one tap away.
function NoExactMatch({ onShowClosest, onPick }: { onShowClosest: () => void; onPick: (example: string) => void }) {
  return (
    <View className="items-center gap-3 pt-10">
      <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon icon={SearchX} size={28} />
      </View>
      <Text variant="title-sm" accessibilityRole="header" className="text-center">
        {"We couldn't find an exact match"}
      </Text>
      <Text tone="muted" className="text-center">
        Try adding a place, type, price or amenity, like one of these.
      </Text>
      <View className="items-center gap-2">
        {EXAMPLES.map((example) => (
          <Chip key={example} size="sm" label={example} onPress={() => onPick(example)} />
        ))}
      </View>
      <Button size="sm" variant="secondary" title="Show closest stays anyway" onPress={onShowClosest} />
    </View>
  );
}

type NoResultsProps = {
  // Set when the guest asked for a place outside the countries Roamly has stays in.
  missingPlace?: string;
  filtersChanged: boolean;
  onClear: () => void;
};

function NoResults({ missingPlace, filtersChanged, onClear }: NoResultsProps) {
  return (
    <View className="items-center gap-3 pt-10">
      <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon icon={SearchX} size={28} />
      </View>
      <Text variant="title-sm" accessibilityRole="header" className="text-center">
        {missingPlace ? `No stays in ${missingPlace} yet` : "No stays match"}
      </Text>
      <Text tone="muted" className="text-center">
        {missingPlace
          ? `Roamly only has stays in the ${HOME_COUNTRY} for now.`
          : "Nothing fits every filter. Try turning one off or describing the stay differently."}
      </Text>
      <Button size="sm" variant="secondary" title={filtersChanged ? "Clear filters" : "Clear search"} onPress={onClear} />
    </View>
  );
}

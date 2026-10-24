import { Stack, useLocalSearchParams } from "expo-router";
import { SearchX, Sparkles } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";
import { usePostHog } from "posthog-react-native";
import type { SearchBarCommands } from "react-native-screens";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { ListingCard } from "@/components/ui/listing-card";
import { Text } from "@/components/ui/text";
import { amenityMeta, stays, type Stay } from "@/data/stays";
import { searchStays } from "@/search/search-stays";

const EXAMPLES = [
  "quiet pet friendly cabin with a hot tub under $300",
  "beach house for 6 under $400",
  "city loft with a workspace",
];

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function SearchScreen() {
  const posthog = usePostHog();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const searchBar = useRef<SearchBarCommands>(null);
  const [query, setQuery] = useState("");
  // Bumped on every search so results replay their entrance only for new queries.
  const [runId, setRunId] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [lastQ, setLastQ] = useState<string | undefined>(undefined);

  const run = (text: string, source?: "native_search" | "suggested_query") => {
    const trimmedQuery = text.trim();
    setQuery(trimmedQuery);
    setRunId((id) => id + 1);
    if (trimmedQuery && source) {
      posthog?.capture("stay_search_submitted", {
        search_source: source,
        query_length: trimmedQuery.length,
      });
    }
  };

  // A query from Home arrives as ?q=: search it during render (no effect
  // round trip), and mirror it into the native bar after commit.
  if (q && q !== lastQ) {
    setLastQ(q);
    run(q);
  }
  useEffect(() => {
    if (q) searchBar.current?.setText(q);
  }, [q]);

  const result = useMemo(() => (query ? searchStays(query, stays) : null), [query]);

  const toggleSave = (id: string) => {
    const isSaved = saved.has(id);
    setSaved((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    posthog?.capture(isSaved ? "stay_unsaved" : "stay_saved", { stay_id: id });
  };

  return (
    <>
      <Stack.SearchBar
        ref={searchBar}
        placeholder="Describe your stay"
        autoCapitalize="none"
        hideWhenScrolling={false}
        onSearchButtonPress={(event) => run(event.nativeEvent.text, "native_search")}
        onCancelButtonPress={() => run("")}
      />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="gap-4 px-5 pb-8 pt-2"
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {!result ? (
          <EmptyQuery
            onPick={(example) => {
              searchBar.current?.setText(example);
              run(example, "suggested_query");
            }}
          />
        ) : (
          <View key={runId} className="gap-4">
            {result.constraints.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {result.constraints.map((label) => (
                  <Badge key={label} label={label} />
                ))}
              </View>
            ) : null}

            {result.stays.length === 0 ? (
              <NoResults
                constraints={result.constraints}
                onClear={() => {
                  searchBar.current?.clearText();
                  run("");
                }}
              />
            ) : (
              <>
                <Text variant="caption" tone="muted">
                  {result.stays.length === 1 ? "1 stay" : `${result.stays.length} stays`}
                </Text>
                <View className="gap-3">
                  {result.stays.map((stay, index) => (
                    <ResultRow
                      key={stay.id}
                      stay={stay}
                      index={index}
                      highlight={result.query.amenities}
                      saved={saved.has(stay.id)}
                      onToggleSave={() => toggleSave(stay.id)}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

type ResultRowProps = {
  stay: Stay;
  index: number;
  highlight: Stay["amenities"];
  saved: boolean;
  onToggleSave: () => void;
};

// Results the guest asked for come in with a short stagger. Reduce Motion keeps
// the fade and drops the slide.
function ResultRow({ stay, index, highlight, saved, onToggleSave }: ResultRowProps) {
  const reduced = useReducedMotion();
  const entering = useMemo(
    () => (reduced ? FadeIn : FadeInDown).duration(250).delay(Math.min(index, 6) * 40).easing(EASE_OUT),
    [reduced, index],
  );
  // Amenities the query asked for come first so the card shows why it matched.
  const amenities = [...stay.amenities]
    .sort((a, b) => Number(highlight.includes(b)) - Number(highlight.includes(a)))
    .slice(0, 3)
    .map((key) => amenityMeta[key]);

  return (
    <Animated.View entering={entering}>
      <ListingCard stay={{ ...stay, amenities }} saved={saved} onToggleSave={onToggleSave} />
    </Animated.View>
  );
}

function EmptyQuery({ onPick }: { onPick: (example: string) => void }) {
  return (
    <View className="gap-4 pt-4">
      <View className="flex-row items-center gap-2">
        <Icon icon={Sparkles} size={20} color="lavender-600" />
        <Text variant="headline">Describe your stay in one sentence</Text>
      </View>
      <Text tone="muted">Price, guests, pets, type and amenities filter. Words like quiet or cozy help rank.</Text>
      <View className="items-start gap-2">
        {EXAMPLES.map((example) => (
          <Chip key={example} size="sm" appearance="muted" label={example} onPress={() => onPick(example)} />
        ))}
      </View>
    </View>
  );
}

function NoResults({ constraints, onClear }: { constraints: string[]; onClear: () => void }) {
  return (
    <View className="items-center gap-3 pt-10">
      <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon icon={SearchX} size={28} />
      </View>
      <Text variant="title-sm" accessibilityRole="header">
        No stays match
      </Text>
      <Text tone="muted" className="text-center">
        {constraints.length > 0
          ? `Nothing fits all of: ${constraints.join(", ")}. Try loosening one.`
          : "Try describing the stay differently."}
      </Text>
      <Button size="sm" variant="secondary" title="Clear search" onPress={onClear} />
    </View>
  );
}

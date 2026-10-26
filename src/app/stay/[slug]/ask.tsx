import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowUp, ChevronLeft, MessageCircle } from "lucide-react-native";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ScrollViewInstance,
} from "react-native";
import Animated, { FadeInDown, ReduceMotion, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { answerFor, NO_ANSWER, type Answer } from "@/ask/answers";
import { matchTopics } from "@/ask/match-topics";
import { TOPIC_CHIPS } from "@/ask/topics";
import { AnswerCard } from "@/components/ask/answer-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { stayAnalytics } from "@/config/stay-analytics";
import { useStay } from "@/hooks/use-stay";
import { colors } from "@/theme";

type Message = { id: number; question: string; answers: Answer[] | null };

// The fake "Checking…" pause so the exchange reads as a conversation. No backend.
const REPLY_DELAY_MS = 400;

const entering = (index: number) =>
  FadeInDown.duration(200).delay(index * 40).reduceMotion(ReduceMotion.System);

export default function AskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stay, policies, loading, error, retry } = useStay(slug);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const list = useRef<ScrollViewInstance>(null);
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardOpen(false));
    const pending = timers.current;
    return () => {
      show.remove();
      hide.remove();
      pending.forEach(clearTimeout);
    };
  }, []);

  // Topics are picked locally (a stand-in for Jev); every card is built from
  // this stay's fields and Roamly's policies, word for word.
  const ask = (text: string, source: "chip" | "typed") => {
    const question = text.trim();
    if (!question || !stay) return;
    const topics = matchTopics(question);
    const answers = topics
      .map((topic) => answerFor(topic, stay, policies, question))
      .filter((answer): answer is Answer => answer !== null);
    const id = nextId.current++;
    setDraft("");
    setMessages((current) => [...current, { id, question, answers: null }]);
    stayAnalytics.questionAsked(stay, source, topics);

    const reply = () =>
      setMessages((current) =>
        current.map((m) => (m.id === id ? { ...m, answers: answers.length ? answers : [NO_ANSWER] } : m)),
      );
    if (reduced) reply();
    else timers.current.push(setTimeout(reply, REPLY_DELAY_MS));
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/stay/[slug]", params: { slug } }));

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-surface"
      style={{ paddingTop: insets.top }}
    >
      {/* The details screen behind sets a light bar for its photos. */}
      <StatusBar style="dark" />
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <IconButton variant="filled-sm" icon={ChevronLeft} accessibilityLabel="Back" onPress={back} />
        <View className="flex-1">
          <Text variant="title-xs" accessibilityRole="header">
            Ask about this stay
          </Text>
          {stay ? (
            <Text variant="caption-regular" tone="muted" numberOfLines={1}>
              {stay.title}
            </Text>
          ) : null}
        </View>
        {stay ? (
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.push({ pathname: "/stay/[slug]/policies", params: { slug: stay.slug } })}
            className="active:opacity-70"
          >
            <Text variant="caption" tone="accent">
              See all policies
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View className="h-px bg-line" />

      {!stay ? (
        <View className="px-5 pt-6">
          {error ? (
            <View className="gap-3">
              <Alert tone="error" message="Couldn't load this stay. Check your connection and try again." />
              <Button size="sm" variant="secondary" title="Try again" className="self-start" onPress={retry} />
            </View>
          ) : loading ? (
            <ActivityIndicator color={colors.muted} className="py-10" />
          ) : null}
        </View>
      ) : (
        <>
          <ScrollView
            ref={list}
            className="flex-1"
            contentContainerClassName="gap-4 px-5 py-4"
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => list.current?.scrollToEnd({ animated: !reduced })}
          >
            <View className="flex-row items-start gap-3">
              <Icon icon={MessageCircle} size={22} color="accent-600" />
              <Text variant="body" tone="muted" className="flex-1">
                {"Ask about cancellation, pets, check-in and more. Answers come straight from this stay's details and Roamly's policies."}
              </Text>
            </View>

            {messages.map((message) => (
              <Fragment key={message.id}>
                <Animated.View
                  entering={entering(0)}
                  className="max-w-[85%] self-end border-r-2 border-accent-600 pr-3"
                >
                  <Text variant="title-xs" className="text-right">
                    {message.question}
                  </Text>
                </Animated.View>
                {message.answers ? (
                  <View className="gap-5" accessibilityLiveRegion="polite">
                    {message.answers.map((answer, i) => (
                      <Animated.View key={answer.topic} entering={entering(i)}>
                        <AnswerCard answer={answer} />
                      </Animated.View>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color={colors.muted} />
                    <Text variant="caption-regular" tone="muted">
                      Checking…
                    </Text>
                  </View>
                )}
              </Fragment>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="grow-0"
            contentContainerClassName="gap-2 px-5 pt-2"
          >
            {TOPIC_CHIPS.map((chip) => (
              <Chip
                key={chip.label}
                size="xs"
                label={chip.label}
                accessibilityHint={`Asks: ${chip.question}`}
                onPress={() => ask(chip.question, "chip")}
              />
            ))}
          </ScrollView>

          <View className="px-5 pt-2" style={{ paddingBottom: (keyboardOpen ? 0 : insets.bottom) + 8 }}>
            <View className="h-13 flex-row items-center gap-3 border-b-2 border-ink">
              <Icon icon={MessageCircle} size={22} color="muted" />
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => ask(draft, "typed")}
                placeholder="Ask about this stay…"
                placeholderTextColor={colors.muted}
                selectionColor={colors["accent-600"]}
                returnKeyType="send"
                submitBehavior="submit"
                accessibilityLabel="Ask about this stay"
                className="h-full flex-1 font-sans-medium text-input text-ink"
              />
              <IconButton
                variant="primary-sm"
                icon={ArrowUp}
                accessibilityLabel="Send"
                disabled={!draft.trim()}
                onPress={() => ask(draft, "typed")}
              />
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

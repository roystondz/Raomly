import { View } from "react-native";

import { Paragraphs, Rule } from "@/components/stay/policy-text";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Answer } from "@/ask/answers";
import { TOPIC_ICONS } from "@/ask/topics";

// One topic of a reply: the stay's facts or policy text word for word, never a
// written paragraph, marked by a left rule like a quoted passage, with its source.
export function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <View
      accessible
      accessibilityLabel={`${answer.title}. Source: ${answer.source}.`}
      className="gap-3 border-l-2 border-accent-400 py-1 pl-4"
    >
      <View className="flex-row items-center gap-2">
        <Icon icon={TOPIC_ICONS[answer.topic]} size={18} color="accent-600" />
        <Text variant="title-xs">{answer.title}</Text>
      </View>

      {answer.rules?.length ? (
        <View className="gap-2">
          {answer.rules.map((rule) => (
            <Rule key={rule.label} label={rule.label} value={rule.value} />
          ))}
        </View>
      ) : null}
      {answer.paragraphs?.length ? (
        <View className="gap-2">
          <Paragraphs paragraphs={answer.paragraphs} />
        </View>
      ) : null}

      <Text variant="footnote" tone="muted">
        Source: {answer.source}
      </Text>
    </View>
  );
}

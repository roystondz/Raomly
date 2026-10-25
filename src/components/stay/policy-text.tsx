import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { Policy, StayDetails } from "@/sanity/queries";
import { checkInMethodLabel, formatTime } from "@/stay/format";

// Text shown word for word, one Text per paragraph.
export function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <Text key={i} variant="body">
          {paragraph}
        </Text>
      ))}
    </>
  );
}

// A policy's body, word for word. Paragraphs are separated by blank lines in Sanity.
export function PolicyText({ policy }: { policy: Policy }) {
  return (
    <View className="gap-2">
      <Text variant="headline">{policy.title}</Text>
      <Paragraphs paragraphs={policy.body.split(/\n\s*\n/).map((p) => p.trim())} />
    </View>
  );
}

// singleLine: long values (an email) shorten in the middle instead of wrapping mid-word.
export function Rule({ label, value, singleLine }: { label: string; value: string; singleLine?: boolean }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text variant="body" tone="muted">
        {label}
      </Text>
      <Text
        variant="body"
        className="shrink text-right"
        numberOfLines={singleLine ? 1 : undefined}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const allowed = (value: boolean) => (value ? "Allowed" : "Not allowed");

// The stay's house rules from its typed fields; additional rules word for word.
export function HouseRules({ rules }: { rules: StayDetails["houseRules"] }) {
  const quiet = rules.quietHours?.start && rules.quietHours?.end ? rules.quietHours : null;
  return (
    <View className="gap-3">
      <Rule label="Check-in" value={`After ${formatTime(rules.checkInTime)}`} />
      <Rule label="Check-out" value={`By ${formatTime(rules.checkOutTime)}`} />
      <Rule label="Check-in method" value={checkInMethodLabel(rules.checkInMethod)} />
      {quiet ? <Rule label="Quiet hours" value={`${formatTime(quiet.start!)} – ${formatTime(quiet.end!)}`} /> : null}
      <Rule label="Pets" value={allowed(rules.petsAllowed)} />
      <Rule label="Smoking" value={allowed(rules.smokingAllowed)} />
      <Rule label="Parties and events" value={allowed(rules.partiesAllowed)} />
      {rules.additionalRules.map((rule, i) => (
        <Text key={i} variant="body">
          {rule}
        </Text>
      ))}
    </View>
  );
}

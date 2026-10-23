import { useRef, useState } from "react";
import { Pressable, TextInput, View, type TextInputInstance } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/utils/cn";

const LENGTH = 6;

export type CodeInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  editable?: boolean;
  autoFocus?: boolean;
};

// One hidden TextInput drawn as six boxes, so paste and SMS/email autofill work.
export function CodeInput({ value, onChangeText, error, editable = true, autoFocus }: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <View>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        className="flex-row gap-2"
      >
        {Array.from({ length: LENGTH }, (_, i) => {
          const active = focused && i === activeIndex;
          return (
            <View
              key={i}
              className={cn(
                "h-14 flex-1 items-center justify-center rounded-lg corner-squircle",
                error
                  ? "border-2 border-danger bg-surface-muted"
                  : active
                    ? "border-2 border-lavender-400 bg-lavender-50"
                    : "border border-transparent bg-surface-muted",
              )}
            >
              <Text variant="title-sm">{value[i] ?? ""}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, "").slice(0, LENGTH))}
        maxLength={LENGTH}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        editable={editable}
        autoFocus={autoFocus}
        accessibilityLabel="Verification code"
        accessibilityHint={error}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute h-px w-px opacity-0"
      />
      {error ? (
        <Text variant="footnote-medium" tone="danger" className="mt-1.5 px-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

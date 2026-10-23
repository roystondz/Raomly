import { Pressable } from "react-native";

import { Text } from "@/components/ui/text";

// "Already have an account? Sign in" style footer: muted prompt plus an underlined link.
export function FooterLink({
  prompt,
  action,
  onPress,
  disabled,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <>
      <Text variant="caption-regular" tone="muted">
        {prompt}
      </Text>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        hitSlop={8}
        onPress={onPress}
        className={disabled ? "opacity-40" : "active:opacity-60"}
      >
        <Text variant="caption" className="underline">
          {action}
        </Text>
      </Pressable>
    </>
  );
}

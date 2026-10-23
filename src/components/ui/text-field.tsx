import { Eye, EyeOff, Lock, Search, SlidersHorizontal, type LucideIcon } from "lucide-react-native";
import { useState, type Ref } from "react";
import { TextInput, View, type TextInputInstance, type TextInputProps } from "react-native";

import { colors } from "@/theme";
import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

export type TextFieldProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  variant?: "default" | "search" | "password";
  icon?: LucideIcon;
  // Shown above the input inside the field (60pt tall field).
  label?: string;
  error?: string;
  onFilterPress?: () => void;
  ref?: Ref<TextInputInstance>;
  className?: string;
};

export function TextField({
  variant = "default",
  icon,
  label,
  error,
  onFilterPress,
  onFocus,
  onBlur,
  ref,
  className,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const leading = icon ?? (variant === "search" ? Search : variant === "password" ? Lock : undefined);

  const input = (
    <TextInput
      {...props}
      ref={ref}
      className={cn(
        "text-ink",
        // text-input sets the size without a line height, which iOS would use to push
        // the text down and clip it while editing.
        label ? "h-6 p-0 font-sans text-input" : "h-full flex-1 font-sans-medium text-input",
      )}
      placeholderTextColor={colors.subtle}
      selectionColor={colors["lavender-600"]}
      secureTextEntry={variant === "password" && hidden}
      accessibilityLabel={label ?? props.accessibilityLabel}
      accessibilityHint={error ?? props.accessibilityHint}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );

  return (
    <View className={className}>
      <View
        className={cn(
          "flex-row items-center gap-3 rounded-lg corner-squircle px-4",
          label ? "h-15" : "h-14",
          error
            ? cn("border-2 border-danger", focused ? "bg-lavender-50" : "bg-surface-muted")
            : focused
              ? "border-2 border-lavender-400 bg-lavender-50"
              : variant === "search"
                ? "border border-line bg-surface"
                : "border-2 border-transparent bg-surface-muted",
        )}
      >
        {leading ? <Icon icon={leading} /> : null}
        {label ? (
          <View className="flex-1 justify-center gap-0.5">
            <Text variant="label" importantForAccessibility="no" accessibilityElementsHidden>
              {label}
            </Text>
            {input}
          </View>
        ) : (
          input
        )}
        {variant === "search" && onFilterPress ? (
          <IconButton variant="plain" icon={SlidersHorizontal} accessibilityLabel="Filters" onPress={onFilterPress} />
        ) : null}
        {variant === "password" ? (
          <IconButton
            variant="plain"
            icon={hidden ? EyeOff : Eye}
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            onPress={() => setHidden((h) => !h)}
          />
        ) : null}
      </View>
      {error ? (
        <Text variant="footnote-medium" tone="danger" className="mt-1.5 px-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

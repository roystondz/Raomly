import { Eye, EyeOff, Lock, Search, SlidersHorizontal, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/theme";
import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { IconButton } from "./icon-button";

export type TextFieldProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  variant?: "default" | "search" | "password";
  icon?: LucideIcon;
  onFilterPress?: () => void;
  className?: string;
};

export function TextField({
  variant = "default",
  icon,
  onFilterPress,
  onFocus,
  onBlur,
  className,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const leading = icon ?? (variant === "search" ? Search : variant === "password" ? Lock : undefined);

  return (
    <View
      className={cn(
        "h-14 flex-row items-center gap-3 rounded-lg corner-squircle px-4",
        focused
          ? "border-2 border-lavender-400 bg-lavender-50"
          : variant === "search"
            ? "border border-line bg-surface"
            : "border border-transparent bg-surface-muted",
        className,
      )}
    >
      {leading ? <Icon icon={leading} /> : null}
      <TextInput
        className="h-full flex-1 font-sans-medium text-label text-ink"
        placeholderTextColor={colors.subtle}
        selectionColor={colors["lavender-600"]}
        secureTextEntry={variant === "password" && hidden}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
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
  );
}

import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";

import { colors } from "@/theme";
import { cn } from "@/utils/cn";

import { Text } from "./text";

const variants = {
  primary: "bg-primary",
  secondary: "bg-surface border border-line",
} as const;

const sizes = {
  md: { container: "h-14 px-6", text: "button" },
  sm: { container: "h-9 px-5", text: "caption" },
} as const;

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  leading,
  trailing,
  className,
  ...props
}: ButtonProps) {
  const inactive = !!(disabled || loading);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      className={cn(
        "flex-row items-center justify-center gap-3 rounded-full",
        variants[variant],
        sizes[size].container,
        disabled ? "opacity-40" : "active:opacity-85",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          {leading}
          <Text variant={sizes[size].text}>{title}</Text>
          {/* Trailing icon sits at the right edge while the title stays centered. */}
          {trailing ? <View className="absolute right-6">{trailing}</View> : null}
        </>
      )}
    </Pressable>
  );
}

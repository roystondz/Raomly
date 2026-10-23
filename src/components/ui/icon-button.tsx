import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";

import type { ColorToken } from "@/theme";
import { cn } from "@/utils/cn";

import { Icon } from "./icon";

const variants = {
  filled: { container: "size-14 bg-surface-muted", icon: 24 },
  overlay: { container: "size-8 bg-surface shadow-raised", icon: 18 },
  plain: { container: "size-10", icon: 20 },
  outline: { container: "size-11 border border-line bg-surface", icon: 24 },
} as const;

export type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  accessibilityLabel: string;
  variant?: keyof typeof variants;
  color?: ColorToken;
  fill?: ColorToken;
  className?: string;
};

export function IconButton({
  icon,
  variant = "filled",
  color = "ink",
  fill,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={variant === "overlay" ? 8 : undefined}
      className={cn(
        "items-center justify-center rounded-full",
        variants[variant].container,
        disabled ? "opacity-40" : "active:opacity-70",
        className,
      )}
      {...props}
    >
      <Icon icon={icon} size={variants[variant].icon} color={color} fill={fill} />
    </Pressable>
  );
}

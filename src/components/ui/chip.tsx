import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

const sizes = {
  md: { container: "h-12 px-6", text: "label", icon: 20 },
  sm: { container: "h-11 px-4", text: "caption", icon: 18 },
} as const;

const selectedTones = {
  lavender: "bg-lavender border-lavender",
  primary: "bg-primary border-primary",
} as const;

export type ChipProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  selected?: boolean;
  tone?: keyof typeof selectedTones;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  className?: string;
};

export function Chip({
  label,
  selected = false,
  tone = "lavender",
  size = "md",
  icon,
  disabled,
  className,
  ...props
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full border",
        sizes[size].container,
        selected ? selectedTones[tone] : "border-line bg-surface",
        disabled ? "opacity-40" : "active:opacity-80",
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} size={sizes[size].icon} /> : null}
      <Text variant={sizes[size].text}>{label}</Text>
    </Pressable>
  );
}

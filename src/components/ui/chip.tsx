import type { LucideIcon } from "lucide-react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { PressableScale, type PressableScaleProps } from "./pressable-scale";
import { Text } from "./text";

const sizes = {
  md: { container: "h-12 px-6", text: "label", icon: 20 },
  // Category row on Home: full height, tighter padding and caption text so three fit per row.
  compact: { container: "h-12 px-4", text: "caption", icon: 20 },
  sm: { container: "h-11 px-4", text: "caption", icon: 18 },
} as const;

const selectedTones = {
  lavender: "bg-lavender border-lavender",
  primary: "bg-primary border-primary",
} as const;

// Unselected look: outlined on white, or filled grey with no visible border.
const appearances = {
  outline: "border-line bg-surface",
  muted: "border-surface-muted bg-surface-muted",
} as const;

export type ChipProps = Omit<PressableScaleProps, "children" | "className"> & {
  label: string;
  selected?: boolean;
  tone?: keyof typeof selectedTones;
  appearance?: keyof typeof appearances;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  className?: string;
};

export function Chip({
  label,
  selected = false,
  tone = "lavender",
  appearance = "outline",
  size = "md",
  icon,
  disabled,
  className,
  ...props
}: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full border",
        sizes[size].container,
        selected ? selectedTones[tone] : appearances[appearance],
        disabled && "opacity-40",
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} size={sizes[size].icon} /> : null}
      <Text variant={sizes[size].text}>{label}</Text>
    </PressableScale>
  );
}

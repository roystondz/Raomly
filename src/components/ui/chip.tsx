import type { LucideIcon } from "lucide-react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { PressableScale, type PressableScaleProps } from "./pressable-scale";
import { Text } from "./text";

const sizes = {
  md: { container: "h-12 px-5", text: "label", icon: 20 },
  // Category row on Home: full height, tighter padding and caption text so three fit per row.
  compact: { container: "h-11 px-3.5", text: "caption", icon: 18 },
  sm: { container: "h-10 px-3.5", text: "caption", icon: 18 },
  // Filter tags under the search field.
  xs: { container: "h-8 px-3", text: "caption", icon: 16 },
} as const;

export type ChipProps = Omit<PressableScaleProps, "children" | "className"> & {
  label: string;
  selected?: boolean;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  className?: string;
};

// Editorial tag: outlined and square-ish; selected is ink-filled.
export function Chip({ label, selected = false, size = "md", icon, disabled, className, ...props }: ChipProps) {
  const tone = selected ? "on-ink" : "ink";
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-sm border",
        sizes[size].container,
        selected ? "border-ink bg-ink" : "border-line bg-surface",
        disabled && "opacity-40",
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} size={sizes[size].icon} color={tone} /> : null}
      <Text variant={sizes[size].text} tone={tone}>
        {label}
      </Text>
    </PressableScale>
  );
}

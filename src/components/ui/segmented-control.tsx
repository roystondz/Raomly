import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

export type SegmentedOption<T extends string> = { value: T; label: string; icon?: LucideIcon };

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <View accessibilityRole="tablist" className={cn("h-13 flex-row rounded-full bg-surface-muted p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-2 rounded-full",
              // The pressed style stays on every segment so selecting one doesn't re-mount it.
              "active:opacity-70",
              selected && "bg-ink",
            )}
          >
            {option.icon ? <Icon icon={option.icon} size={20} color={selected ? "on-ink" : "ink"} /> : null}
            <Text variant="label" tone={selected ? "on-ink" : "ink"}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

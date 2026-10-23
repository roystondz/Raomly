import { GlassView } from "expo-glass-effect";
import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { useGlassAvailable } from "@/hooks/use-glass-available";
import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

export type TabItem<K extends string> = { key: K; label: string; icon: LucideIcon };

export type GlassTabBarProps<K extends string> = {
  items: TabItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
  className?: string;
};

export function GlassTabBar<K extends string>({ items, activeKey, onSelect, className }: GlassTabBarProps<K>) {
  const glass = useGlassAvailable();
  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        "h-18 flex-row items-center overflow-hidden rounded-full p-1 shadow-raised",
        !glass && "border border-line bg-surface-glass",
        className,
      )}
    >
      {glass ? <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" /> : null}
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.key)}
            className="flex-1 items-center active:opacity-70"
          >
            <View className={cn("size-16 items-center justify-center gap-0.5 rounded-full", active && "bg-primary")}>
              <Icon icon={item.icon} />
              <Text variant="footnote-medium">{item.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

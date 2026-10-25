import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Children, Fragment, type ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

// Rows sit on the page, separated by full-width hairlines (no card behind them).
export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  const rows = Children.toArray(children);
  return (
    <View className={className}>
      {rows.map((row, i) => (
        <Fragment key={i}>
          {i > 0 ? <View className="h-px bg-line" /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const variants = {
  plain: { container: "min-h-13 gap-4 py-3", icon: 22, label: "caption", chevron: 18 },
  // Profile and settings lists.
  lg: { container: "min-h-14 gap-4 py-3.5", icon: 22, label: "body", chevron: 20 },
} as const;

export type ListRowProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  label: string;
  variant?: keyof typeof variants;
  className?: string;
};

export function ListRow({ icon, label, variant = "plain", className, ...props }: ListRowProps) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn("flex-row items-center active:opacity-70", v.container, className)}
      {...props}
    >
      <Icon icon={icon} size={v.icon} />
      <Text variant={v.label} className="flex-1">
        {label}
      </Text>
      <Icon icon={ChevronRight} size={v.chevron} color="muted" />
    </Pressable>
  );
}

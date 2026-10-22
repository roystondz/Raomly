import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Children, Fragment, type ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  const rows = Children.toArray(children);
  return (
    <View className={cn("overflow-hidden rounded-xl corner-squircle bg-surface", className)}>
      {rows.map((row, i) => (
        <Fragment key={i}>
          {i > 0 ? <View className="ml-14 h-px bg-line" /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export type ListRowProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  label: string;
  className?: string;
};

export function ListRow({ icon, label, className, ...props }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn("min-h-13 flex-row items-center gap-4 px-4 py-3 active:bg-surface-muted", className)}
      {...props}
    >
      <Icon icon={icon} />
      <Text variant="caption" className="flex-1">
        {label}
      </Text>
      <Icon icon={ChevronRight} size={18} />
    </Pressable>
  );
}

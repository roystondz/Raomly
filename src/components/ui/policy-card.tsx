import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

export type PolicyCardProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function PolicyCard({ icon, title, description, className, ...props }: PolicyCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      className={cn(
        "flex-row items-center gap-3 rounded-lg corner-squircle bg-lavender-50 p-4 active:opacity-80",
        className,
      )}
      {...props}
    >
      <View className="size-10 items-center justify-center rounded-md corner-squircle bg-lavender-100">
        <Icon icon={icon} color="lavender-600" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="headline">{title}</Text>
        <Text variant="footnote" tone="muted" numberOfLines={2}>
          {description}
        </Text>
      </View>
      <Icon icon={ChevronRight} size={20} color="lavender-600" />
    </Pressable>
  );
}

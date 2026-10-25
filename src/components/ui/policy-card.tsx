import { ArrowRight, type LucideIcon } from "lucide-react-native";
import { Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

const sizes = {
  md: { container: "py-3.5", icon: 22, title: "headline", description: "footnote" },
  lg: { container: "py-4", icon: 24, title: "title-xs", description: "caption-regular" },
} as const;

export type PolicyCardProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  title: string;
  description: string;
  size?: keyof typeof sizes;
  className?: string;
};

// Editorial link row: no box, a hairline under it, an icon, a title and an arrow.
// Stack several and give the group a hairline on top.
export function PolicyCard({ icon, title, description, size = "md", className, ...props }: PolicyCardProps) {
  const s = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      className={cn("flex-row items-center gap-4 border-b border-line active:opacity-70", s.container, className)}
      {...props}
    >
      <Icon icon={icon} size={s.icon} color="accent-600" />
      <View className="flex-1 gap-0.5">
        <Text variant={s.title}>{title}</Text>
        <Text variant={s.description} tone="muted" numberOfLines={2}>
          {description}
        </Text>
      </View>
      <Icon icon={ArrowRight} size={20} color="accent-600" />
    </Pressable>
  );
}

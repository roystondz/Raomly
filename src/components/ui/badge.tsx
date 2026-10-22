import { Star } from "lucide-react-native";
import { View } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { Text } from "./text";

const tones = {
  favorite: { container: "bg-primary-50", text: "ink" },
  success: { container: "bg-success-50", text: "success" },
  danger: { container: "bg-danger-50", text: "danger" },
  info: { container: "bg-info-50", text: "info" },
} as const;

export type BadgeProps = {
  label: string;
  tone?: keyof typeof tones;
  className?: string;
};

export function Badge({ label, tone = "info", className }: BadgeProps) {
  return (
    <View className={cn("h-10 flex-row items-center gap-2 self-start rounded-full px-5", tones[tone].container, className)}>
      {tone === "favorite" ? <Icon icon={Star} size={20} fill="primary" /> : null}
      <Text variant="caption" tone={tones[tone].text}>
        {label}
      </Text>
    </View>
  );
}

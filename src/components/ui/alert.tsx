import { Check, X } from "lucide-react-native";
import { View } from "react-native";

import { cn } from "@/utils/cn";

import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

const tones = {
  success: { container: "bg-success-50", dot: "bg-success", text: "success", color: "success-700" },
  error: { container: "bg-danger-50", dot: "bg-danger", text: "danger", color: "danger-700" },
} as const;

export type AlertProps = {
  tone: keyof typeof tones;
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ tone, message, onDismiss, className }: AlertProps) {
  const t = tones[tone];
  return (
    <View
      accessibilityRole="alert"
      className={cn("min-h-12 flex-row items-center gap-3 rounded-md corner-squircle py-2 pl-4 pr-1", t.container, className)}
    >
      <View className={cn("size-6 items-center justify-center rounded-full", t.dot)}>
        {tone === "success" ? (
          <Icon icon={Check} size={14} color="on-ink" strokeWidth={3} />
        ) : (
          <Text variant="headline" tone="on-ink">
            !
          </Text>
        )}
      </View>
      <Text variant="caption" tone={t.text} className="flex-1">
        {message}
      </Text>
      {onDismiss ? <IconButton variant="plain" icon={X} color={t.color} accessibilityLabel="Dismiss" onPress={onDismiss} /> : null}
    </View>
  );
}

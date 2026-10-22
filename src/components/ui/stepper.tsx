import { Minus, Plus } from "lucide-react-native";
import { View } from "react-native";

import { cn } from "@/utils/cn";

import { IconButton } from "./icon-button";
import { Text } from "./text";

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
  className?: string;
};

export function Stepper({ value, onChange, min = 0, max = Infinity, accessibilityLabel, className }: StepperProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn("h-13 flex-row items-center gap-4 rounded-full border border-line bg-surface px-2", className)}
    >
      <IconButton
        variant="plain"
        icon={Minus}
        accessibilityLabel="Decrease"
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      />
      <Text variant="headline" className="min-w-6 text-center" accessibilityLiveRegion="polite">
        {value}
      </Text>
      <IconButton
        variant="plain"
        icon={Plus}
        accessibilityLabel="Increase"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </View>
  );
}

import { GlassView } from "expo-glass-effect";
import { Pressable, StyleSheet } from "react-native";

import { Text } from "@/components/ui/text";
import { useGlassAvailable } from "@/hooks/use-glass-available";
import { colors } from "@/theme";
import { cn } from "@/utils/cn";

// Light glass pill in the onboarding top bar.
export function SkipButton({ onPress }: { onPress: () => void }) {
  const glass = useGlassAvailable();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "h-11 items-center justify-center overflow-hidden rounded-full px-5 active:opacity-70",
        !glass && "bg-surface-glass",
      )}
    >
      {glass ? (
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme="light"
          tintColor={colors["surface-glass"]}
          isInteractive
        />
      ) : null}
      <Text variant="label">Skip</Text>
    </Pressable>
  );
}

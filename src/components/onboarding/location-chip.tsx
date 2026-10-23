import { GlassView } from "expo-glass-effect";
import { MapPin } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useGlassAvailable } from "@/hooks/use-glass-available";
import { colors } from "@/theme";
import { cn } from "@/utils/cn";

// Dark glass pill naming where the photo was taken.
export function LocationChip({ location, className }: { location: string; className?: string }) {
  const glass = useGlassAvailable();
  return (
    <View
      className={cn(
        "h-10 flex-row items-center gap-2 self-start overflow-hidden rounded-full border border-on-image-line px-4",
        !glass && "bg-scrim",
        className,
      )}
    >
      {glass ? (
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={colors.scrim}
        />
      ) : null}
      <Icon icon={MapPin} size={18} color="on-ink" />
      <Text variant="caption" tone="on-ink">
        {location}
      </Text>
    </View>
  );
}

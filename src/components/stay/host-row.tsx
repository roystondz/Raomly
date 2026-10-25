import { Image } from "expo-image";
import { Award, ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { sanityImage } from "@/sanity/image";
import type { StayDetails } from "@/sanity/queries";
import { firstName, hostFacts } from "@/stay/format";
import { cn } from "@/utils/cn";

const AVATAR = 64;

export function HostAvatar({ host, size = AVATAR, className }: { host: StayDetails["host"]; size?: number; className?: string }) {
  return (
    <View
      style={{ width: size, height: size }}
      className={cn("overflow-hidden rounded-full bg-surface-muted", className)}
    >
      {host.photoUrl ? (
        <Image
          source={{ uri: sanityImage(host.photoUrl, size, size) }}
          accessibilityLabel={host.photoAlt ?? `Photo of ${host.name}`}
          style={{ flex: 1 }}
          contentFit="cover"
        />
      ) : null}
    </View>
  );
}

// "Hosted by Maya" with facts from the host document (no Superhost field exists).
export function HostRow({ host, onPress }: { host: StayDetails["host"]; onPress: () => void }) {
  const facts = hostFacts(host);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hosted by ${firstName(host.name)}. ${facts}`}
      onPress={onPress}
      className="flex-row items-center gap-4 py-3 active:opacity-70"
    >
      <HostAvatar host={host} size={56} />
      <View className="flex-1 gap-1">
        <Text variant="title-xs">Hosted by {firstName(host.name)}</Text>
        <View className="flex-row items-center gap-1.5">
          <Icon icon={Award} size={18} color="subtle" />
          <Text variant="caption-regular" tone="muted" numberOfLines={1} className="flex-1">
            {facts}
          </Text>
        </View>
      </View>
      <Icon icon={ChevronRight} size={22} />
    </Pressable>
  );
}

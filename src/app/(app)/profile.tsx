import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bell, BriefcaseBusiness, CircleHelp, CreditCard, FileText, Settings, UserRound } from "lucide-react-native";
import type { ReactNode } from "react";
import { Alert, ScrollView, View } from "react-native";

import { IconButton } from "@/components/ui/icon-button";
import { ListGroup, ListRow } from "@/components/ui/list-group";
import { Logo } from "@/components/ui/logo";
import { PolicyCard } from "@/components/ui/policy-card";
import { SectionLabel } from "@/components/ui/section-label";
import { Text } from "@/components/ui/text";
import { useSavedStays } from "@/hooks/use-saved-stays";

// No booking yet, so there are no trips to count.
const TRIP_COUNT = 0;

const comingSoon = (feature: string) => Alert.alert("Coming soon", `${feature} isn't available yet.`);

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const saved = useSavedStays();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="gap-8 px-5 pb-8 pt-2"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="flex-row items-center justify-between">
        <Logo height={28} />
        <IconButton
          variant="filled-sm"
          icon={Settings}
          accessibilityLabel="Settings"
          onPress={() => router.push("/settings")}
        />
      </View>

      {/* Only real data: no home city, tier badge or guest rating exist yet. */}
      <View className="flex-row items-center gap-4">
        <View className="size-20 overflow-hidden rounded-full bg-primary-50">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ flex: 1 }} contentFit="cover" accessibilityIgnoresInvertColors />
          ) : null}
        </View>
        <View className="flex-1 gap-1">
          <Text variant="title-lg" accessibilityRole="header" numberOfLines={2}>
            {user?.fullName || email}
          </Text>
          {user?.fullName && email ? (
            <Text variant="caption-regular" tone="muted" numberOfLines={1}>
              {email}
            </Text>
          ) : null}
          <Text variant="caption" accessibilityLabel={`${TRIP_COUNT} trips, ${saved.size} saved`}>
            {TRIP_COUNT} trips · {saved.size} saved
          </Text>
        </View>
      </View>

      <Section title="Account">
        <ListRow variant="lg" icon={UserRound} label="Personal info" onPress={() => router.push("/personal-info")} />
        <ListRow variant="lg" icon={CreditCard} label="Payment methods" onPress={() => comingSoon("Payment methods")} />
        <ListRow variant="lg" icon={BriefcaseBusiness} label="Trips" onPress={() => router.navigate("/trips")} />
      </Section>

      <Section title="Preferences">
        <ListRow variant="lg" icon={Bell} label="Notifications" onPress={() => comingSoon("Notifications")} />
        <ListRow variant="lg" icon={CircleHelp} label="Help & support" onPress={() => comingSoon("Help & support")} />
      </Section>

      <View>
        <SectionLabel label="Policies" />
        <PolicyCard
          size="lg"
          icon={FileText}
          title="Roamly policies"
          description="Cancellation, payment, damage and more."
          onPress={() => router.push("/policies")}
        />
      </View>
    </ScrollView>
  );
}

// A labelled section of hairline rows.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <SectionLabel label={title} />
      <ListGroup>{children}</ListGroup>
    </View>
  );
}

import { View } from "react-native";

import { HostAvatar } from "@/components/stay/host-row";
import { StaySheet } from "@/components/stay/stay-sheet";
import { Text } from "@/components/ui/text";
import { responseTimeLabel, yearsHosting } from "@/stay/format";

// The host, from their Sanity document. The bio is shown word for word.
export default function HostSheet() {
  return (
    <StaySheet scroll={false}>
      {({ stay: { host } }) => {
        const years = yearsHosting(host.hostingSince);
        const response = responseTimeLabel(host.responseTime);
        return (
          <>
            <View className="flex-row items-center gap-4">
              <HostAvatar host={host} size={80} />
              <View className="flex-1 gap-1">
                <Text variant="title-sm" accessibilityRole="header">
                  {host.name}
                </Text>
                <Text variant="caption-regular" tone="muted">
                  Hosting since {host.hostingSince.slice(0, 4)}
                  {years > 0 ? ` (${years} ${years === 1 ? "year" : "years"})` : ""}
                </Text>
                {response ? (
                  <Text variant="caption-regular" tone="muted">
                    {response}
                  </Text>
                ) : null}
              </View>
            </View>
            {host.bio ? <Text variant="body">{host.bio}</Text> : null}
            {host.languages.length > 0 ? (
              <Text variant="body">
                <Text variant="body" tone="muted">
                  Speaks{" "}
                </Text>
                {host.languages.join(", ")}
              </Text>
            ) : null}
          </>
        );
      }}
    </StaySheet>
  );
}

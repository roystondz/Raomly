import { View } from "react-native";

import { HouseRules, PolicyText } from "@/components/stay/policy-text";
import { StaySheet } from "@/components/stay/stay-sheet";
import { Text } from "@/components/ui/text";

// Interim answer to "Ask about policies" until the Q&A exists: the stay's house
// rules and every Roamly policy, word for word from Sanity.
export default function PoliciesSheet() {
  return (
    <StaySheet>
      {({ stay, policies }) => (
        <>
          <Text variant="title-sm" accessibilityRole="header">
            House rules
          </Text>
          <HouseRules rules={stay.houseRules} />
          <View className="h-px bg-line" />
          <Text variant="title-sm" accessibilityRole="header">
            Cancellation
          </Text>
          <PolicyText policy={stay.cancellation} />
          <View className="h-px bg-line" />
          <Text variant="title-sm" accessibilityRole="header">
            Roamly policies
          </Text>
          {policies.map((policy) => (
            <PolicyText key={policy.id} policy={policy} />
          ))}
        </>
      )}
    </StaySheet>
  );
}

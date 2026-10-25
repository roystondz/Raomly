import { PolicyText } from "@/components/stay/policy-text";
import { StaySheet } from "@/components/stay/stay-sheet";
import { Text } from "@/components/ui/text";

// The stay's cancellation policy, word for word.
export default function CancellationSheet() {
  return (
    <StaySheet>
      {({ stay }) => (
        <>
          <Text variant="title-sm" accessibilityRole="header">
            Cancellation
          </Text>
          <PolicyText policy={stay.cancellation} />
        </>
      )}
    </StaySheet>
  );
}

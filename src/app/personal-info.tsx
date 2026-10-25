import { useUser } from "@clerk/expo";
import { View } from "react-native";

import { Rule } from "@/components/stay/policy-text";
import { Text } from "@/components/ui/text";

// Read-only details from Clerk. Editing comes later.
export default function PersonalInfoSheet() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <View className="gap-5 bg-surface px-5 pb-4 pt-8">
      <Text variant="title-sm" accessibilityRole="header">
        Personal info
      </Text>
      <View className="gap-3">
        {user?.fullName ? <Rule label="Name" value={user.fullName} /> : null}
        {email ? <Rule label="Email" value={email} singleLine /> : null}
        {user?.createdAt ? <Rule label="Member since" value={String(user.createdAt.getFullYear())} /> : null}
      </View>
    </View>
  );
}

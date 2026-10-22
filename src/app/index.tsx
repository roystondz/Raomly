import { useRouter } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-surface-muted px-5">
      <Text variant="title">Welcome to Roamly.</Text>
      {__DEV__ ? (
        <Button
          size="sm"
          variant="secondary"
          title="Open design system"
          onPress={() => router.push("/design-system")}
        />
      ) : null}
    </View>
  );
}

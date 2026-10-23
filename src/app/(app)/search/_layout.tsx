import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Search",
          headerLargeTitleEnabled: true,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { fontFamily: "PlusJakartaSans-Bold", color: colors.ink },
          headerLargeTitleStyle: { fontFamily: "PlusJakartaSans-Bold", color: colors.ink },
        }}
      />
    </Stack>
  );
}

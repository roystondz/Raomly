import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        // No headerStyle: a background color here stops iOS drawing the large title
        // (its space stays, the text disappears). The screen is already bg-surface.
        options={{
          title: "Search",
          headerLargeTitleEnabled: true,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerTitleStyle: { fontFamily: "PlusJakartaSans-Bold", color: colors.ink },
          headerLargeTitleStyle: { fontFamily: "PlusJakartaSans-Bold", color: colors.ink },
        }}
      />
    </Stack>
  );
}

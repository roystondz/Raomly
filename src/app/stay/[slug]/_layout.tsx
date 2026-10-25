import { Stack } from "expo-router";

import { sheetOptions as sheet } from "@/config/sheet-options";

// The details screen draws its own header over the photos. Policies,
// cancellation and host open as native sheets over it.
export const unstable_settings = { anchor: "index" };

export default function StayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ask" />
      <Stack.Screen name="policies" options={{ ...sheet, sheetAllowedDetents: [0.6, 1] }} />
      <Stack.Screen name="cancellation" options={{ ...sheet, sheetAllowedDetents: [0.5, 1] }} />
      <Stack.Screen name="host" options={{ ...sheet, sheetAllowedDetents: "fitToContents" }} />
    </Stack>
  );
}

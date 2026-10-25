import { Stack } from "expo-router";

// The screen draws its own header (back button and search pill), as in the design.
export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

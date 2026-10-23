import { Stack } from "expo-router";

// The auth screens draw their own back button (AuthScreen); swipe back still works.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

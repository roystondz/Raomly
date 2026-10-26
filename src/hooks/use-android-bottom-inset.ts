import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Gesture-bar space for content pinned to the bottom edge: sheets sized to their
// content and onboarding's actions. iOS sheets reserve the home indicator and
// onboarding's iOS spacing matches the design, so this is 0 there.
export function useAndroidBottomInset() {
  const insets = useSafeAreaInsets();
  return Platform.OS === "android" ? insets.bottom : 0;
}

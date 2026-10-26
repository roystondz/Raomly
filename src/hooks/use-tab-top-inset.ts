import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Status bar space for tab screens' scroll content. iOS adds it through
// contentInsetAdjustmentBehavior="automatic", which Android ignores, and Android
// native tabs only pad the bottom.
export function useTabTopInset() {
  const insets = useSafeAreaInsets();
  return Platform.OS === "android" ? insets.top : 0;
}

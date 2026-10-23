import { isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

// True when GlassView can render real Liquid Glass (iOS 26+) and the user
// hasn't turned on Reduce Transparency. Otherwise use the token fallback.
export function useGlassAvailable() {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency, () => {});
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduceTransparency);
    return () => sub.remove();
  }, []);
  return Platform.OS === "ios" && isGlassEffectAPIAvailable() && !reduceTransparency;
}

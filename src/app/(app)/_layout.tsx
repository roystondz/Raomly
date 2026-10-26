import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";

import { colors } from "@/theme";

const LABEL_FONT = "PlusJakartaSans-Medium";

// Android's Material bar defaults to grey with a lavender indicator, hides
// unselected labels with 4 tabs, and draws md icons white unless colored.
// These give it the app's surface, ink and accent instead. iOS keeps the system bar.
const androidBar =
  Platform.OS === "android"
    ? {
        backgroundColor: colors.surface,
        iconColor: { default: colors.muted, selected: colors.ink },
        labelStyle: {
          default: { fontFamily: LABEL_FONT, color: colors.muted },
          selected: { fontFamily: LABEL_FONT, color: colors.ink },
        },
        indicatorColor: colors["accent-100"],
        rippleColor: colors["accent-50"],
        labelVisibilityMode: "labeled" as const,
      }
    : { labelStyle: { fontFamily: LABEL_FONT } };

// System tab bar (Liquid Glass on iOS 26). Icons are SF Symbols / Material
// Symbols here, not Lucide. Search keeps the design's order, so no role="search"
// (that would move it into its own bubble).
export default function AppTabs() {
  return (
    <NativeTabs tintColor={colors.ink} {...androidBar}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_today" />
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

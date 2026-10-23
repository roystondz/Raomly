import { NativeTabs } from "expo-router/native-tabs";

import { colors } from "@/theme";

// System tab bar (Liquid Glass on iOS 26). Icons are SF Symbols / Material
// Symbols here, not Lucide. Search keeps the design's order, so no role="search"
// (that would move it into its own bubble).
export default function AppTabs() {
  return (
    <NativeTabs tintColor={colors.ink} labelStyle={{ fontFamily: "PlusJakartaSans-Medium" }}>
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

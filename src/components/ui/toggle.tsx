import { Switch, type SwitchProps } from "react-native";

import { colors } from "@/theme";

// Native Switch tinted with Roamly colors; it keeps the platform's own size.
export function Toggle(props: Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">) {
  return (
    <Switch
      trackColor={{ false: colors.line, true: colors.primary }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.line}
      {...props}
    />
  );
}

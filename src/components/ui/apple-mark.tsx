import { SymbolView } from "expo-symbols";

import { colors } from "@/theme";

// Apple's own SF Symbol, so the logo isn't recreated. iOS only.
export function AppleMark() {
  return <SymbolView name="apple.logo" size={20} tintColor={colors.ink} />;
}

import type { LucideIcon } from "lucide-react-native";

import { colors, type ColorToken } from "@/theme";

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: ColorToken;
  fill?: ColorToken;
  strokeWidth?: number;
};

export function Icon({ icon: LucideComponent, size = 24, color = "ink", fill, strokeWidth = 2 }: IconProps) {
  return (
    <LucideComponent
      size={size}
      color={colors[color]}
      fill={fill ? colors[fill] : "none"}
      strokeWidth={strokeWidth}
    />
  );
}

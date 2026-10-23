import { useState, type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme";

const CURVE_HEIGHT = 64;

// White sheet whose top edge has a rounded top-left corner and bows down
// toward the right edge (≈ estimated from the onboarding design).
// Children start halfway into the curve, where the left side is already white.
export function CurvedSheet({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(0);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View className="absolute inset-x-0 bottom-0 top-16 bg-surface" />
      <Svg width={width} height={CURVE_HEIGHT}>
        {width > 0 ? (
          <Path
            fill={colors.surface}
            d={`M0 ${CURVE_HEIGHT} L0 28 Q0 4 24 2 C140 -4 ${width - 93} 14 ${width} 60 L${width} ${CURVE_HEIGHT} Z`}
          />
        ) : null}
      </Svg>
      <View className="-mt-8">{children}</View>
    </View>
  );
}

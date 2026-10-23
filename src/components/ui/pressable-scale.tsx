import { useState, type ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";
import Animated, { cubicBezier, useReducedMotion } from "react-native-reanimated";

export type PressableScaleProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  // Classes for the visual box that scales (background, radius, padding, size).
  className?: string;
  // Classes for the outer touch area (flex, self-*, margins).
  containerClassName?: string;
};

// Press feedback for buttons, chips and avatars (not list rows): 0.97 scale on
// press-in, 120ms. Reduce Motion drops the scale.
// The Reanimated view takes no className: styling it through react-native-css
// strips the cubicBezier easing, so the classes live on an inner View.
export function PressableScale({
  children,
  className,
  containerClassName,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Pressable
      pressRetentionOffset={16}
      className={containerClassName}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      {...props}
    >
      <Animated.View style={[box, pressed && !reduced && pressedBox]}>
        <View className={className}>{children}</View>
      </Animated.View>
    </Pressable>
  );
}

const box = {
  transform: [{ scale: 1 }],
  transitionProperty: "transform",
  transitionDuration: "120ms",
  transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
};

const pressedBox = { transform: [{ scale: 0.97 }] };

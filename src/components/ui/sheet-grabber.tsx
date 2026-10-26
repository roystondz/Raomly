import { Platform, View } from "react-native";

// Android's form sheet has no system grabber (sheetGrabberVisible is iOS-only),
// so sheets draw one there. Absolute, so it sits in the sheets' top padding
// without moving their content.
export function SheetGrabber() {
  if (Platform.OS !== "android") return null;
  return (
    <View pointerEvents="none" className="absolute inset-x-0 top-2.5 items-center">
      <View className="h-1 w-8 rounded-full bg-subtle" />
    </View>
  );
}

import { colors } from "@/theme";

// Native form sheet look shared by every sheet route (stay and profile).
// The grabber and corner radius are iOS-only; Android sheets draw SheetGrabber
// and add useAndroidBottomInset themselves.
export const sheetOptions = {
  presentation: "formSheet",
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
  // The sheet reserves the home-indicator area itself; this keeps it solid.
  contentStyle: { backgroundColor: colors.surface },
} as const;

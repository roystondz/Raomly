// Mirror of the color tokens in global.css, only for APIs that take a color
// prop instead of a className (icons, Switch, ActivityIndicator, placeholders,
// GlassView tint). Keep in sync with global.css.
export const colors = {
  primary: "#F2C36B",
  "primary-50": "#FBF1DC",
  accent: "#B7D9BF",
  "accent-50": "#EDF5EF",
  "accent-100": "#D5E8DA",
  "accent-400": "#8CC19A",
  "accent-600": "#2E6B45",
  ink: "#16201A",
  muted: "#66706A",
  subtle: "#A0A8A2",
  surface: "#FFFFFF",
  "surface-muted": "#F5F3EE",
  line: "#E6E2D8",
  "surface-glass": "rgba(255, 255, 255, 0.7)",
  success: "#1E9E5A",
  "success-50": "#E7F5EC",
  "success-700": "#1B7A45",
  danger: "#E5484D",
  "danger-50": "#FDECEE",
  "danger-700": "#C53340",
  "info-50": "#E8EEFF",
  "info-700": "#3451C7",
  "on-ink": "#FFFFFF",
  scrim: "rgba(22, 32, 26, 0.45)",
  "on-image-line": "rgba(255, 255, 255, 0.35)",
} as const;

export type ColorToken = keyof typeof colors;

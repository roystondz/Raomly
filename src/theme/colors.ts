// Mirror of the color tokens in global.css, only for APIs that take a color
// prop instead of a className (icons, Switch, ActivityIndicator, placeholders,
// GlassView tint). Keep in sync with global.css.
export const colors = {
  primary: "#FFC629",
  "primary-50": "#FFF6DA",
  lavender: "#C9B4FF",
  "lavender-50": "#F4EFFF",
  "lavender-100": "#E7DDFF",
  "lavender-400": "#B49BF7",
  "lavender-600": "#7B5BE4",
  ink: "#0B0B1A",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  surface: "#FFFFFF",
  "surface-muted": "#F4F5F7",
  line: "#E5E7EB",
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
} as const;

export type ColorToken = keyof typeof colors;

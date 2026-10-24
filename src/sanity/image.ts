import { PixelRatio } from "react-native";

// Sizes a Sanity CDN image for a box in points. Center-cropped for now; the
// editor's hotspot is not applied.
export function sanityImage(url: string, width: number, height: number) {
  const scale = Math.min(PixelRatio.get(), 3);
  const params = new URLSearchParams({
    w: String(Math.round(width * scale)),
    h: String(Math.round(height * scale)),
    fit: "crop",
    auto: "format",
  });
  return `${url}?${params}`;
}

import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/utils/cn";

const variants = {
  display: "font-serif text-display",
  hero: "font-serif text-hero",
  "title-lg": "font-serif text-title-lg",
  title: "font-serif text-title",
  "title-sm": "font-serif text-title-sm",
  "title-xs": "font-serif text-title-xs",
  headline: "font-sans-bold text-headline",
  body: "font-sans text-body",
  label: "font-sans-medium text-label",
  caption: "font-sans-medium text-caption",
  "caption-regular": "font-sans text-caption",
  footnote: "font-sans text-footnote",
  "footnote-medium": "font-sans-medium text-footnote",
  // Section labels: small, uppercase and spaced, as in a printed index.
  eyebrow: "font-sans-medium text-footnote uppercase tracking-widest",
  button: "font-sans-medium text-button",
  // Large action labels stay sans so actions read as UI, not headings.
  "button-lg": "font-sans-bold text-title-sm",
} as const;

const tones = {
  ink: "text-ink",
  muted: "text-muted",
  subtle: "text-subtle",
  "on-ink": "text-on-ink",
  success: "text-success-700",
  danger: "text-danger-700",
  info: "text-info-700",
  accent: "text-accent-600",
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export function Text({ variant = "body", tone = "ink", className, ...props }: TextProps) {
  return <RNText className={cn(variants[variant], tones[tone], className)} {...props} />;
}

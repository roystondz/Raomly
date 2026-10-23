import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/utils/cn";

const variants = {
  display: "font-sans-bold text-display",
  hero: "font-sans-bold text-hero",
  title: "font-sans-bold text-title",
  "title-sm": "font-sans-bold text-title-sm",
  headline: "font-sans-bold text-headline",
  body: "font-sans text-body",
  label: "font-sans-medium text-label",
  caption: "font-sans-medium text-caption",
  "caption-regular": "font-sans text-caption",
  footnote: "font-sans text-footnote",
  "footnote-medium": "font-sans-medium text-footnote",
  button: "font-sans-medium text-button",
} as const;

const tones = {
  ink: "text-ink",
  muted: "text-muted",
  subtle: "text-subtle",
  "on-ink": "text-on-ink",
  success: "text-success-700",
  danger: "text-danger-700",
  info: "text-info-700",
  lavender: "text-lavender-600",
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

// Joins class names, skipping falsy values. Caller classes go last.
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

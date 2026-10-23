import type { FieldError, SignInErrors, SignUpErrors } from "@clerk/expo/types";

type ClerkErrors = SignInErrors | SignUpErrors;
type FieldName<E extends ClerkErrors> = keyof E["fields"];

// Message for one field from a Clerk hook's reactive `errors`, if any.
export function fieldError<E extends ClerkErrors>(errors: E, name: FieldName<E>) {
  const fields: E["fields"] = errors.fields;
  const field = fields[name] as FieldError | null;
  return field ? (field.longMessage ?? field.message) : undefined;
}

// Message for errors that don't belong to a field.
export function globalError(errors: ClerkErrors) {
  const first = errors.global?.[0];
  return first ? (first.longMessage ?? first.message) : undefined;
}

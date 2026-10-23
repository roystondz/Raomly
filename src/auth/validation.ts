// Client-side form validation. Each returns an error message, or undefined when valid.

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateName(name: string) {
  return name.trim() ? undefined : "Enter your full name.";
}

export function validateEmail(email: string) {
  const value = normalizeEmail(email);
  if (!value) return "Enter your email address.";
  return EMAIL_SHAPE.test(value) ? undefined : "Enter a valid email address.";
}

export function validatePassword(password: string) {
  if (!password) return "Enter a password.";
  return password.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
}

export function validateCode(code: string) {
  return /^\d{6}$/.test(code) ? undefined : "Enter the 6-digit code.";
}

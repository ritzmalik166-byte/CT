export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const EMAIL_PATTERN =
  "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+";

export const EMAIL_INVALID_MESSAGE =
  "Please enter a valid email address (e.g. name@example.com).";

export function isValidEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function getEmailValidationError(value: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Please enter your email address.";
  if (!isValidEmail(trimmed)) return EMAIL_INVALID_MESSAGE;
  return "";
}

export const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;

export const NAME_PATTERN = "[A-Za-z][A-Za-z\\s.'-]{1,49}";

export const NAME_INVALID_MESSAGE =
  "Use letters, spaces, hyphens or apostrophes only (2–50 characters).";

export function isValidName(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) return false;
  return NAME_REGEX.test(trimmed);
}

export function getNameValidationError(value: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (!NAME_REGEX.test(trimmed)) return NAME_INVALID_MESSAGE;
  return "";
}

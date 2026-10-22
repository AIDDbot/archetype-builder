import { ruleError } from "#shared/expected.error.ts";
import { isMissing, isText } from "#shared/values/values.check.ts";

export type TextLength = { field: string; min: number; max: number };

export function requireText(value: unknown, field: string): string {
  const hasText = isText(value);
  if (!hasText) throw ruleError(field, "needs text");
  return value.trim();
}

export function optionalText(value: unknown, field: string): string | undefined {
  const isBlank = typeof value === "string" && !isText(value);
  const isAbsent = isMissing(value) || isBlank;
  return isAbsent ? undefined : requireText(value, field);
}

function describeLength(length: TextLength): string {
  const isOpen = length.max === Infinity;
  return isOpen ? `${length.min} or more` : `${length.min} to ${length.max}`;
}

export function requireLength(value: unknown, length: TextLength): string {
  const text = requireText(value, length.field);
  const isShort = text.length < length.min;
  const isLong = text.length > length.max;
  const isOutside = isShort || isLong;
  if (isOutside) throw ruleError(length.field, `has ${describeLength(length)} characters`);
  return text;
}

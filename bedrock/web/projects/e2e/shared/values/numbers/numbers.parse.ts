import { isText } from "#shared/values/values.check.ts";

export type NumberRange = { field: string; min: number; max: number };

export function parseInteger(value: unknown, range: NumberRange): number {
  const parsed = isText(value) ? Number(value) : Number.NaN;
  const isInteger = Number.isInteger(parsed);
  const isInRange = parsed >= range.min && parsed <= range.max;
  const isValid = isInteger && isInRange;
  if (!isValid) throw new Error(`${range.field} is an integer from ${range.min} to ${range.max}`);
  return parsed;
}

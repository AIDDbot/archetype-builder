import { isText } from "#shared/values/values.check.ts";

export type NumberRange = { field: string; min: number; max: number };

function describeRange(range: NumberRange): string {
  const isOpen = range.max === Infinity;
  return isOpen ? `of ${range.min} or more` : `from ${range.min} to ${range.max}`;
}

export function parseInteger(value: unknown, range: NumberRange): number {
  const parsed = isText(value) ? Number(value) : Number.NaN;
  const isInteger = Number.isInteger(parsed);
  const isInRange = parsed >= range.min && parsed <= range.max;
  const isValid = isInteger && isInRange;
  if (!isValid) throw new Error(`${range.field} is an integer ${describeRange(range)}`);
  return parsed;
}

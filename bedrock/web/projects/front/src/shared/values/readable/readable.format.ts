import { isMissing } from "#shared/values/values.check.ts";

export type Readable = { locale: string };

export type ReadableDate = Readable & { style: Intl.DateTimeFormatOptions };

export const dateTimeStyle: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const missing = "—";

export function readableText(value: string | number | null | undefined): string {
  const isAbsent = isMissing(value) || value === "";
  return isAbsent ? missing : String(value);
}

export function readableDate(value: Date | null | undefined, format: ReadableDate): string {
  const isAbsent = isMissing(value);
  return isAbsent ? missing : new Intl.DateTimeFormat(format.locale, format.style).format(value);
}

export function readableNumber(value: number | null | undefined, format: Readable): string {
  const isAbsent = isMissing(value);
  return isAbsent ? missing : new Intl.NumberFormat(format.locale).format(value);
}

export function readableDuration(seconds: number | null | undefined, format: Readable): string {
  const isAbsent = isMissing(seconds);
  const unit: Intl.NumberFormatOptions = { style: "unit", unit: "second", unitDisplay: "long" };
  return isAbsent ? missing : new Intl.NumberFormat(format.locale, unit).format(seconds);
}

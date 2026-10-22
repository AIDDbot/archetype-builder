import { expect, it } from "vite-plus/test";
import {
  dateTimeStyle,
  readableDate,
  readableDuration,
  readableNumber,
  readableText,
} from "#shared/values/readable/readable.format.ts";

const english = { locale: "en-GB" };

it("shows a missing value as a dash", () => {
  for (const value of [null, undefined, ""]) expect(readableText(value)).toBe("—");
  expect(readableDate(undefined, { ...english, style: dateTimeStyle })).toBe("—");
  expect(readableNumber(null, english)).toBe("—");
  expect(readableDuration(undefined, english)).toBe("—");
});

it("shows text and numbers as they are", () => {
  expect(readableText("Ada")).toBe("Ada");
  expect(readableText(0)).toBe("0");
});

it("shows a date in the language of the reader", () => {
  const date = new Date(2026, 9, 5, 16, 40);
  expect(readableDate(date, { ...english, style: dateTimeStyle })).toBe("5 Oct 2026, 16:40");
});

it("shows numbers and durations in the language of the reader", () => {
  expect(readableNumber(1234.5, english)).toBe("1,234.5");
  expect(readableNumber(1234.5, { locale: "es-ES" })).toBe("1234,5");
  expect(readableDuration(1.25, english)).toBe("1.25 seconds");
});

import { expect, it } from "vite-plus/test";
import { formatDate, formatDateTime, formatTime } from "#shared/values/dates.format.ts";

const date = new Date(2026, 0, 2, 3, 4, 5, 6);

it("formats the date in local time", () => {
  expect(formatDate(date)).toBe("2026-01-02");
});

it("formats the time with milliseconds", () => {
  expect(formatTime(date)).toBe("03:04:05.006");
});

it("formats the date and time for a person", () => {
  expect(formatDateTime(date)).toBe("2026-01-02 03:04:05");
});

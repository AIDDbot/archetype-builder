import { expect, it } from "vite-plus/test";
import { parseInteger, parseNumber } from "#shared/values/numbers/numbers.parse.ts";

const port = { field: "PORT", min: 1, max: 65535 };
const ratio = { field: "ratio", min: 0, max: 1 };

it("parses an integer in its range, from a number or a text", () => {
  expect(parseInteger(1, port)).toBe(1);
  expect(parseInteger("65535", port)).toBe(65535);
});

it("rejects an integer out of its range, or a value that is not an integer", () => {
  const invalid = [0, 65536, "1.5", "abc", "", "  ", undefined, null];
  for (const value of invalid) {
    expect(() => parseInteger(value, port)).toThrow("PORT is an integer from 1 to 65535");
  }
});

it("names an open range by its lower limit", () => {
  const offset = { field: "offset", min: 0, max: Infinity };
  expect(parseInteger("12", offset)).toBe(12);
  expect(() => parseInteger("-1", offset)).toThrow("offset is an integer of 0 or more");
});

it("parses a number in its range", () => {
  expect(parseNumber("0.25", ratio)).toBe(0.25);
  expect(parseNumber(1, ratio)).toBe(1);
});

it("rejects a number out of its range, or a value that is not a number", () => {
  const invalid = [-0.1, 1.1, "x", "", undefined];
  for (const value of invalid) {
    expect(() => parseNumber(value, ratio)).toThrow("ratio is a number from 0 to 1");
  }
});

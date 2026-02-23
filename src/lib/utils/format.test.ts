import { describe, it, expect } from "vitest";
import { bgnToEur, formatBgn, formatEur } from "./format";

describe("bgnToEur", () => {
  it("converts BGN to EUR using fixed rate 1.9558", () => {
    expect(bgnToEur(195.58)).toBeCloseTo(100, 1);
  });

  it("rounds to 2 decimal places", () => {
    expect(bgnToEur(100)).toBe(51.13);
  });
});

describe("formatBgn", () => {
  it("formats number as BGN string", () => {
    expect(formatBgn(280)).toBe("280 лв.");
  });
});

describe("formatEur", () => {
  it("formats number as EUR string", () => {
    expect(formatEur(100)).toBe("100 EUR");
  });
});

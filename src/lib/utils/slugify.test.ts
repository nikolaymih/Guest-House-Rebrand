import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts Bulgarian text to ascii slug", () => {
    expect(slugify("Нова скала")).toBe("nova-skala");
  });
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes special characters", () => {
    expect(slugify("Café & Bar!")).toBe("cafe-bar");
  });
  it("collapses multiple hyphens", () => {
    expect(slugify("one  two   three")).toBe("one-two-three");
  });
  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --test-- ")).toBe("test");
  });
});

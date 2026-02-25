import { describe, it, expect } from "vitest";
import { parseAdminEmails } from "./parseAdminEmails";

describe("parseAdminEmails", () => {
  it("returns list from comma-separated string", () => {
    expect(parseAdminEmails("a@b.com,c@d.com")).toEqual(["a@b.com", "c@d.com"]);
  });

  it("trims spaces around commas", () => {
    expect(parseAdminEmails("a@b.com , c@d.com")).toEqual(["a@b.com", "c@d.com"]);
  });

  it("handles a single email", () => {
    expect(parseAdminEmails("a@b.com")).toEqual(["a@b.com"]);
  });

  it("returns empty array for empty string", () => {
    expect(parseAdminEmails("")).toEqual([]);
  });

  it("returns empty array for undefined (missing env var)", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

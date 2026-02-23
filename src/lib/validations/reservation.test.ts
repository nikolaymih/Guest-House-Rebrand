import { describe, it, expect } from "vitest";
import { reservationSchema } from "./reservation";

describe("reservationSchema", () => {
  const valid = {
    fullName: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+35988577132",
    subject: "Резервация",
    message: "Искам да резервирам за уикенда.",
    consent: true,
  };

  it("passes with valid Bulgarian data", () => {
    expect(() => reservationSchema.parse(valid)).not.toThrow();
  });

  it("passes with valid Latin name", () => {
    const result = reservationSchema.safeParse({ ...valid, fullName: "John Smith" });
    expect(result.success).toBe(true);
  });

  it("passes with single-word name", () => {
    const result = reservationSchema.safeParse({ ...valid, fullName: "Иван" });
    expect(result.success).toBe(true);
  });

  it("rejects empty full name", () => {
    const result = reservationSchema.safeParse({ ...valid, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = reservationSchema.safeParse({ ...valid, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("rejects empty subject", () => {
    const result = reservationSchema.safeParse({ ...valid, subject: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = reservationSchema.safeParse({ ...valid, message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when consent is false", () => {
    const result = reservationSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const result = reservationSchema.safeParse({ ...valid, phone: "" });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { generateReferenceNumber } from "../reference-number.helper.js";

describe("generateReferenceNumber", () => {
  it("builds a prefixed UTC-based reference with extra entropy", () => {
    const value = generateReferenceNumber(
      "ORD",
      new Date("2026-06-26T03:04:05.067Z"),
    );

    expect(value).toMatch(/^ORD-20260626-030405067[A-F0-9]{8}$/);
  });

  it("stays unique across a burst of generated references", () => {
    const values = new Set(
      Array.from({ length: 200 }, () => generateReferenceNumber("PAY")),
    );

    expect(values.size).toBe(200);
  });
});

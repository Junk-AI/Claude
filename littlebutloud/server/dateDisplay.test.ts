import { describe, expect, it } from "vitest";
import { formatDateRange } from "../client/src/lib/dateDisplay";

describe("formatDateRange", () => {
  it("renders a date range when both dates are valid", () => {
    expect(formatDateRange("2026-09-05", "2026-09-06")).toContain("–");
  });

  it("uses the valid date when a date range is incomplete", () => {
    const result = formatDateRange("2026-09-05", null);
    expect(result).not.toContain("Invalid Date");
    expect(result).not.toBe("Dates to be confirmed");
  });

  it("uses a neutral fallback for absent or malformed dates", () => {
    expect(formatDateRange(null, undefined)).toBe("Dates to be confirmed");
    expect(formatDateRange("not-a-date", "")).toBe("Dates to be confirmed");
  });
});

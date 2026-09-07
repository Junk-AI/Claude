import { describe, expect, it } from "vitest";
import { buildEventShareUrl, getSharedEventId } from "../client/src/lib/eventLinks";

describe("event sharing links", () => {
  it("builds a stable, direct link to an event detail view", () => {
    expect(buildEventShareUrl("https://network.example/", 42)).toBe("https://network.example/convene?event=42");
  });

  it("extracts valid positive event IDs from a shared link", () => {
    expect(getSharedEventId("?event=42")).toBe(42);
    expect(getSharedEventId("?source=invite&event=42")).toBe(42);
  });

  it("ignores a missing, invalid, or non-positive event ID", () => {
    expect(getSharedEventId("")).toBeNull();
    expect(getSharedEventId("?event=abc")).toBeNull();
    expect(getSharedEventId("?event=0")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { members, events, resources } from "../drizzle/schema";

describe("Seeded Content Verification", () => {
  it("should have 5 approved members in database", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.status, "approved"));

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.some((m) => m.name === "Green Future Initiative")).toBe(true);
    expect(result.some((m) => m.name === "Mental Wellness Advocates")).toBe(true);
    expect(result.some((m) => m.name === "Seniors Connect")).toBe(true);
    expect(result.some((m) => m.name === "Children's Learning Hub")).toBe(true);
    expect(result.some((m) => m.name === "Community Health Collective")).toBe(true);
  });

  it("should have members with correct issue areas", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.status, "approved"));

    const issueAreas = result.map((m) => m.issueArea);
    expect(issueAreas).toContain("environment");
    expect(issueAreas).toContain("mental health");
    expect(issueAreas).toContain("seniors");
    expect(issueAreas).toContain("children");
  });

  it("should have members with correct member types", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.status, "approved"));

    const memberTypes = result.map((m) => m.memberType);
    expect(memberTypes).toContain("youth-led group");
    expect(memberTypes).toContain("social service agency");
    expect(memberTypes).toContain("community organisation");
  });

  it("should have 3 upcoming events", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(events)
      .where(eq(events.status, "upcoming"));

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.some((e) => e.title === "Youth Leadership Summit 2026")).toBe(true);
    expect(result.some((e) => e.title === "Environmental Action Workshop")).toBe(true);
    expect(result.some((e) => e.title === "Mental Health Awareness Campaign Launch")).toBe(true);
  });

  it("should have events with correct locations", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(events)
      .where(eq(events.status, "upcoming"));

    const locations = result.map((e) => e.location);
    expect(locations).toContain("Singapore Convention Centre");
    expect(locations).toContain("Marina Bay Park");
    expect(locations).toContain("Online (Zoom)");
  });

  it("should have 5 resources", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db.select().from(resources);

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.some((r) => r.title === "Youth Leadership Toolkit")).toBe(true);
    expect(result.some((r) => r.title === "Mental Health Support Resources")).toBe(true);
    expect(result.some((r) => r.title === "Sustainable Living: A Youth Guide")).toBe(true);
    expect(result.some((r) => r.title === "Case Study: Green Future Initiative Success")).toBe(true);
    expect(result.some((r) => r.title === "Community Engagement Playbook")).toBe(true);
  });

  it("should have resources with correct types", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db.select().from(resources);

    const types = result.map((r) => r.resourceType);
    expect(types).toContain("Toolkits");
    expect(types).toContain("Reports");
    expect(types).toContain("Articles");
    expect(types).toContain("Case Studies");
  });

  it("should have spotlight-eligible members", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.eligibleForSpotlight, true));

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.some((m) => m.name === "Green Future Initiative")).toBe(true);
    expect(result.some((m) => m.name === "Mental Wellness Advocates")).toBe(true);
    expect(result.some((m) => m.name === "Seniors Connect")).toBe(true);
  });
});

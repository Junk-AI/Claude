import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMember, getMemberById, deleteMember } from "./db";
import type { InsertMember } from "../drizzle/schema";

describe("Custom Cause Field", () => {
  let memberId: number;

  beforeAll(async () => {
    // Create a test member with custom cause
    const memberData: InsertMember = {
      name: "Test Custom Cause",
      country: "Singapore",
      email: "customcause@test.com",
      issueAreas: JSON.stringify(["Other"]),
      customCause: "Migrant Workers",
      memberType: "Youth-led group",
      description: "Testing custom cause functionality",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    memberId = await createMember(memberData);
  });

  afterAll(async () => {
    if (memberId) {
      await deleteMember(memberId);
    }
  });

  it("should store custom cause when provided", async () => {
    const member = await getMemberById(memberId);
    expect(member).toBeDefined();
    expect(member?.customCause).toBe("Migrant Workers");
  });

  it("should handle members without custom cause", async () => {
    const memberData: InsertMember = {
      name: "Test No Custom Cause",
      country: "Singapore",
      email: "nocustomcause@test.com",
      issueAreas: JSON.stringify(["Seniors", "Education"]),
      memberType: "Social service agency",
      description: "Testing without custom cause",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    const testMemberId = await createMember(memberData);
    const member = await getMemberById(testMemberId);
    
    expect(member).toBeDefined();
    expect(member?.customCause).toBeNull();
    
    await deleteMember(testMemberId);
  });

  it("should support different custom causes", async () => {
    const customCauses = ["Refugees", "LGBTQ+ Community", "Elderly Care"];
    const memberIds: number[] = [];

    for (const cause of customCauses) {
      const memberData: InsertMember = {
        name: `Test ${cause}`,
        country: "Singapore",
        email: `test-${cause.toLowerCase().replace(/\s+/g, "-")}@test.com`,
        issueAreas: JSON.stringify(["Other"]),
        customCause: cause,
        memberType: "Community organisation",
        description: `Testing ${cause}`,
        pdpaConsent: true,
        pdpaDataUsage: true,
        pdpaMarketing: false,
        pdpaThirdParty: false,
        status: "approved",
      };

      const id = await createMember(memberData);
      memberIds.push(id);
      
      const member = await getMemberById(id);
      expect(member?.customCause).toBe(cause);
    }

    // Cleanup
    for (const id of memberIds) {
      await deleteMember(id);
    }
  });
});

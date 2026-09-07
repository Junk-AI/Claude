import { describe, it, expect, beforeAll } from "vitest";
import { getAllMemberEmails, createMember } from "./db";

describe("getAllMemberEmails", () => {
  let testMemberId: number;

  beforeAll(async () => {
    // Create a test member with approved status
    testMemberId = await createMember({
      name: "Test Member",
      email: "test@example.com",
      country: "Singapore",
      memberType: "Youth-led group",
      description: "Test member for email export",
      status: "approved",
      eligibleForSpotlight: false,
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
    });
  });

  it("should return all approved members with email addresses", async () => {
    const emails = await getAllMemberEmails();
    
    expect(Array.isArray(emails)).toBe(true);
    expect(emails.length).toBeGreaterThan(0);
    
    // Check that at least one member has the expected structure
    const testMember = emails.find(m => m.id === testMemberId);
    if (testMember) {
      expect(testMember).toHaveProperty("id");
      expect(testMember).toHaveProperty("name");
      expect(testMember).toHaveProperty("email");
      expect(testMember.email).toBe("test@example.com");
    }
  });

  it("should only return members with email addresses", async () => {
    const emails = await getAllMemberEmails();
    
    // All returned members should have valid email addresses
    emails.forEach(member => {
      expect(member.email).toBeTruthy();
      expect(typeof member.email).toBe("string");
      expect(member.email.length).toBeGreaterThan(0);
    });
  });

  it("should return members sorted by name", async () => {
    const emails = await getAllMemberEmails();
    
    if (emails.length > 1) {
      // Check that names are sorted alphabetically
      for (let i = 1; i < emails.length; i++) {
        expect(emails[i].name.localeCompare(emails[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("should have correct structure for each member", async () => {
    const emails = await getAllMemberEmails();
    
    expect(emails.length).toBeGreaterThan(0);
    
    emails.forEach(member => {
      expect(member).toHaveProperty("id");
      expect(member).toHaveProperty("name");
      expect(member).toHaveProperty("email");
      expect(typeof member.id).toBe("number");
      expect(typeof member.name).toBe("string");
      expect(typeof member.email).toBe("string");
    });
  });

  it("should exclude pending and rejected members", async () => {
    // Create pending and rejected members
    const pendingId = await createMember({
      name: "Pending Member",
      email: "pending@example.com",
      country: "Singapore",
      memberType: "Youth-led group",
      description: "Pending member",
      status: "pending",
      eligibleForSpotlight: false,
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
    });

    const rejectedId = await createMember({
      name: "Rejected Member",
      email: "rejected@example.com",
      country: "Singapore",
      memberType: "Youth-led group",
      description: "Rejected member",
      status: "rejected",
      eligibleForSpotlight: false,
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
    });

    const emails = await getAllMemberEmails();
    
    // Verify pending and rejected members are not in the list
    const memberIds = emails.map(m => m.id);
    expect(memberIds).not.toContain(pendingId);
    expect(memberIds).not.toContain(rejectedId);
  });
});

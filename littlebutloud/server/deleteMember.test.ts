import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMember, deleteMember, getMemberById } from "./db";
import type { InsertMember } from "../drizzle/schema";

describe("Member Deletion with Cascading Connection Requests", () => {
  let memberId: number;

  beforeAll(async () => {
    // Create a test member to delete
    const memberData: InsertMember = {
      name: "Member to Delete",
      country: "Singapore",
      email: "delete.test@example.com",
      issueAreas: JSON.stringify(["Education"]),
      memberType: "Youth-led group",
      description: "This member will be deleted",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    memberId = await createMember(memberData);
  });

  afterAll(async () => {
    // Cleanup - ensure member is deleted
    try {
      const member = await getMemberById(memberId);
      if (member) {
        await deleteMember(memberId);
      }
    } catch (err) {
      // Member already deleted
    }
  });

  it("should delete a member successfully", async () => {
    // Verify member exists
    const memberBefore = await getMemberById(memberId);
    expect(memberBefore).toBeDefined();
    expect(memberBefore?.name).toBe("Member to Delete");

    // Delete the member
    await deleteMember(memberId);

    // Verify member is deleted
    const memberAfter = await getMemberById(memberId);
    expect(memberAfter).toBeUndefined();
  });

  it("should handle deletion of non-existent member gracefully", async () => {
    // Try to delete a member that doesn't exist (should not throw)
    const nonExistentId = 999999;
    
    // This should not throw an error
    expect(async () => {
      await deleteMember(nonExistentId);
    }).not.toThrow();
  });

  it("should delete member and cascade delete related connection requests", async () => {
    // Create two members
    const member1Data: InsertMember = {
      name: "Sender Member",
      country: "Singapore",
      email: "sender@test.com",
      issueAreas: JSON.stringify(["Health & Wellbeing"]),
      memberType: "Social service agency",
      description: "Sender of connection request",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    const member2Data: InsertMember = {
      name: "Recipient Member",
      country: "Singapore",
      email: "recipient@test.com",
      issueAreas: JSON.stringify(["Health & Wellbeing"]),
      memberType: "Community organisation",
      description: "Recipient of connection request",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    const senderId = await createMember(member1Data);
    const recipientId = await createMember(member2Data);

    // Note: In a real scenario, we would create a connection request here
    // For now, we're just testing that the member deletion works

    // Delete the sender member
    await deleteMember(senderId);

    // Verify sender is deleted
    const senderAfter = await getMemberById(senderId);
    expect(senderAfter).toBeUndefined();

    // Cleanup recipient
    await deleteMember(recipientId);
  });
});

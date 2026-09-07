import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMember, deleteMember, getMemberById, createConnectionRequest } from "./db";
import { getDb } from "./db";
import { connectionRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import type { InsertMember } from "../drizzle/schema";

describe("Member Deletion with Cascade Delete of Connection Requests", () => {
  let senderId: number;
  let recipientId: number;
  let connectionRequestId: number;

  beforeAll(async () => {
    // Create sender member
    const senderData: InsertMember = {
      name: "Sender for Cascade Test",
      country: "Singapore",
      email: "sender.cascade@example.com",
      issueAreas: JSON.stringify(["Education"]),
      memberType: "Youth-led group",
      description: "Sender member for cascade delete test",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    // Create recipient member
    const recipientData: InsertMember = {
      name: "Recipient for Cascade Test",
      country: "Singapore",
      email: "recipient.cascade@example.com",
      issueAreas: JSON.stringify(["Health & Wellbeing"]),
      memberType: "Community organisation",
      description: "Recipient member for cascade delete test",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    };

    senderId = await createMember(senderData);
    recipientId = await createMember(recipientData);

    // Create a connection request from sender to recipient
    connectionRequestId = await createConnectionRequest({
      fromMemberId: senderId,
      toMemberId: recipientId,
      requesterName: "Test Sender",
      requesterEmail: "sender.cascade@example.com",
      requesterOrganisation: "Test Org",
      message: "Would like to connect",
      purpose: "Collaboration",
      status: "sent",
    });

    console.log(`Created connection request ${connectionRequestId} from member ${senderId} to member ${recipientId}`);
  });

  afterAll(async () => {
    // Cleanup - ensure members are deleted
    try {
      const sender = await getMemberById(senderId);
      if (sender) {
        await deleteMember(senderId);
      }
    } catch (err) {
      // Already deleted
    }

    try {
      const recipient = await getMemberById(recipientId);
      if (recipient) {
        await deleteMember(recipientId);
      }
    } catch (err) {
      // Already deleted
    }
  });

  it("should cascade delete connection requests when sender member is deleted", async () => {
    const db = await getDb();
    if (!db) {
      expect(db).toBeDefined();
      return;
    }

    // Verify connection request exists before deletion
    const requestBefore = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, connectionRequestId))
      .limit(1);

    expect(requestBefore.length).toBe(1);
    expect(requestBefore[0].fromMemberId).toBe(senderId);
    console.log(`✓ Connection request ${connectionRequestId} exists before deletion`);

    // Delete the sender member
    await deleteMember(senderId);
    console.log(`✓ Deleted member ${senderId}`);

    // Verify sender member is deleted
    const senderAfter = await getMemberById(senderId);
    expect(senderAfter).toBeUndefined();
    console.log(`✓ Sender member ${senderId} is deleted`);

    // Verify connection request is cascade deleted
    const requestAfter = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, connectionRequestId))
      .limit(1);

    expect(requestAfter.length).toBe(0);
    console.log(`✓ Connection request ${connectionRequestId} was cascade deleted`);
  });

  it("should cascade delete connection requests when recipient member is deleted", async () => {
    const db = await getDb();
    if (!db) {
      expect(db).toBeDefined();
      return;
    }

    // Create a new connection request for this test
    const testSenderId = await createMember({
      name: "Test Sender 2",
      country: "Singapore",
      email: "test.sender2@example.com",
      issueAreas: JSON.stringify(["Environment"]),
      memberType: "Social service agency",
      description: "Test sender 2",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    });

    const testRecipientId = await createMember({
      name: "Test Recipient 2",
      country: "Singapore",
      email: "test.recipient2@example.com",
      issueAreas: JSON.stringify(["Health & Wellbeing"]),
      memberType: "Community organisation",
      description: "Test recipient 2",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    });

    const testConnectionRequestId = await createConnectionRequest({
      fromMemberId: testSenderId,
      toMemberId: testRecipientId,
      requesterName: "Test Sender 2",
      requesterEmail: "test.sender2@example.com",
      requesterOrganisation: "Test Org 2",
      message: "Connection test",
      purpose: "Collaboration",
      status: "sent",
    });

    console.log(`Created test connection request ${testConnectionRequestId} from ${testSenderId} to ${testRecipientId}`);

    // Verify connection request exists
    const requestBefore = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, testConnectionRequestId))
      .limit(1);

    expect(requestBefore.length).toBe(1);
    expect(requestBefore[0].toMemberId).toBe(testRecipientId);
    console.log(`✓ Connection request ${testConnectionRequestId} exists before deletion`);

    // Delete the recipient member
    await deleteMember(testRecipientId);
    console.log(`✓ Deleted recipient member ${testRecipientId}`);

    // Verify recipient member is deleted
    const recipientAfter = await getMemberById(testRecipientId);
    expect(recipientAfter).toBeUndefined();
    console.log(`✓ Recipient member ${testRecipientId} is deleted`);

    // Verify connection request is cascade deleted
    const requestAfter = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, testConnectionRequestId))
      .limit(1);

    expect(requestAfter.length).toBe(0);
    console.log(`✓ Connection request ${testConnectionRequestId} was cascade deleted`);

    // Cleanup
    await deleteMember(testSenderId);
  });

  it("should verify no orphaned connection requests remain after member deletion", async () => {
    const db = await getDb();
    if (!db) {
      expect(db).toBeDefined();
      return;
    }

    // Create members and connection request
    const orphanTestSenderId = await createMember({
      name: "Orphan Test Sender",
      country: "Singapore",
      email: "orphan.sender@example.com",
      issueAreas: JSON.stringify(["Education"]),
      memberType: "Youth-led group",
      description: "Orphan test sender",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    });

    const orphanTestRecipientId = await createMember({
      name: "Orphan Test Recipient",
      country: "Singapore",
      email: "orphan.recipient@example.com",
      issueAreas: JSON.stringify(["Health & Wellbeing"]),
      memberType: "Community organisation",
      description: "Orphan test recipient",
      pdpaConsent: true,
      pdpaDataUsage: true,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      status: "approved",
    });

    // Create multiple connection requests
    const orphanRequest1 = await createConnectionRequest({
      fromMemberId: orphanTestSenderId,
      toMemberId: orphanTestRecipientId,
      requesterName: "Orphan Sender",
      requesterEmail: "orphan.sender@example.com",
      requesterOrganisation: "Orphan Org",
      message: "Orphan test 1",
      purpose: "Collaboration",
      status: "sent",
    });

    const orphanRequest2 = await createConnectionRequest({
      fromMemberId: orphanTestRecipientId,
      toMemberId: orphanTestSenderId,
      requesterName: "Orphan Recipient",
      requesterEmail: "orphan.recipient@example.com",
      requesterOrganisation: "Orphan Org 2",
      message: "Orphan test 2",
      purpose: "Collaboration",
      status: "sent",
    });

    console.log(`Created orphan requests ${orphanRequest1} and ${orphanRequest2}`);

    // Verify both requests exist
    const requestsBefore = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.fromMemberId, orphanTestSenderId));

    expect(requestsBefore.length).toBeGreaterThan(0);
    console.log(`✓ ${requestsBefore.length} connection request(s) exist for sender before deletion`);

    // Delete the sender member
    await deleteMember(orphanTestSenderId);
    console.log(`✓ Deleted sender member ${orphanTestSenderId}`);

    // Verify all connection requests from this member are deleted
    const requestsAfterSenderDelete = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.fromMemberId, orphanTestSenderId));

    expect(requestsAfterSenderDelete.length).toBe(0);
    console.log(`✓ All connection requests from deleted sender are removed (no orphans)`);

    // Delete the recipient member
    await deleteMember(orphanTestRecipientId);
    console.log(`✓ Deleted recipient member ${orphanTestRecipientId}`);

    // Verify all connection requests to this member are deleted
    const requestsAfterRecipientDelete = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.toMemberId, orphanTestRecipientId));

    expect(requestsAfterRecipientDelete.length).toBe(0);
    console.log(`✓ All connection requests to deleted recipient are removed (no orphans)`);
  });
});

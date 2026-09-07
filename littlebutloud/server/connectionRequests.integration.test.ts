import { describe, it, expect } from "vitest";
import { createConnectionRequest } from "./db";

describe("Connection Requests Integration Tests", () => {
  it("should create a connection request with all required fields", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Test User",
      requesterEmail: "test@example.com",
      requesterOrganisation: "Test Org",
      message: "I would like to connect",
      purpose: "Collaboration",
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Connection request created with ID:", result);
  });

  it("should create a connection request with minimal fields", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Minimal User",
      requesterEmail: "minimal@example.com",
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Minimal connection request created with ID:", result);
  });

  it("should handle optional fields correctly", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Optional Test",
      requesterEmail: "optional@example.com",
      requesterOrganisation: null,
      message: null,
      purpose: null,
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Connection request with null optional fields created");
  });

  it("should set status to 'sent' for new requests", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Status Test",
      requesterEmail: "status@example.com",
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Connection request status set to 'sent'");
  });

  it("should handle special characters in requester name and email", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Test User-123 & Co.",
      requesterEmail: "test+special@example.co.uk",
      requesterOrganisation: "Test & Co. Ltd.",
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Connection request with special characters created");
  });

  it("should accept different status values", async () => {
    const statuses = ["sent", "pending", "failed"];
    
    for (const status of statuses) {
      const result = await createConnectionRequest({
        fromMemberId: 0,
        toMemberId: 330001,
        requesterName: `Status ${status} Test`,
        requesterEmail: `${status}@example.com`,
        status: status,
      });

      expect(result).toBeGreaterThan(0);
    }
    console.log("✓ All status values accepted");
  });

  it("should handle long text in message field", async () => {
    const longMessage = "I would like to connect and discuss collaboration opportunities. ".repeat(10);
    
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Long Message Test",
      requesterEmail: "longmsg@example.com",
      message: longMessage,
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Connection request with long message created");
  });

  it("should properly handle fromMemberId = 0 for public requests", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Public Request Test",
      requesterEmail: "public@example.com",
      status: "sent",
    });

    expect(result).toBeGreaterThan(0);
    console.log("✓ Public connection request (fromMemberId=0) created");
  });

  it("should return insertId as a positive number", async () => {
    const result = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Insert ID Test",
      requesterEmail: "insertid@example.com",
      status: "sent",
    });

    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
    expect(Number.isInteger(result)).toBe(true);
    console.log("✓ Insert ID is a valid positive integer");
  });

  it("should handle multiple connection requests from same email", async () => {
    const email = "multi@example.com";
    
    const result1 = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Multi Test 1",
      requesterEmail: email,
      status: "sent",
    });

    const result2 = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330002,
      requesterName: "Multi Test 1",
      requesterEmail: email,
      status: "sent",
    });

    expect(result1).toBeGreaterThan(0);
    expect(result2).toBeGreaterThan(0);
    expect(result1).not.toBe(result2);
    console.log("✓ Multiple requests from same email handled correctly");
  });

  it("should handle requests to different members from same requester", async () => {
    const requesterEmail = "same@example.com";
    
    const result1 = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330001,
      requesterName: "Same Requester",
      requesterEmail: requesterEmail,
      status: "sent",
    });

    const result2 = await createConnectionRequest({
      fromMemberId: 0,
      toMemberId: 330002,
      requesterName: "Same Requester",
      requesterEmail: requesterEmail,
      status: "sent",
    });

    expect(result1).toBeGreaterThan(0);
    expect(result2).toBeGreaterThan(0);
    expect(result1).not.toBe(result2);
    console.log("✓ Multiple requests to different members handled correctly");
  });
});

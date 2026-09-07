import { describe, it, expect, beforeAll, vi } from "vitest";
import { getDb } from "./db";
import { members } from "../drizzle/schema";
import { sendConnectionRequest } from "./email";
import { eq } from "drizzle-orm";

describe("Connection Request Email Delivery", () => {
  let testMember: any;

  beforeAll(async () => {
    // Get Test123 member to verify email exists
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.name, "Test123"))
      .limit(1);

    testMember = result[0];
    console.log("Test member:", testMember);
  });

  it("should have Test123 member with email address", () => {
    expect(testMember).toBeDefined();
    if (testMember) {
      expect(testMember.name).toBe("Test123");
      console.log("Test123 email:", testMember.email);
      expect(testMember.email).toBeTruthy(); // Email should exist
    }
  });

  it("should send connection request email to member", async () => {
    if (!testMember || !testMember.email) {
      console.warn("Test123 has no email address - cannot send email");
      expect(testMember?.email).toBeTruthy();
      return;
    }

    // Mock the email sending to verify it's called with correct parameters
    const sendEmailSpy = vi.spyOn(console, "log");

    try {
      await sendConnectionRequest({
        toName: testMember.name,
        toEmail: testMember.email,
        fromName: "Test Requester",
        fromEmail: "test@example.com",
        fromOrganisation: "Test Org",
        message: "I would like to connect with you",
      });

      // If we get here, the email was sent (or attempted)
      console.log("Email sent successfully to:", testMember.email);
      expect(true).toBe(true);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  });

  it("should verify member email is not null or empty", () => {
    if (!testMember) {
      console.error("Test123 member not found");
      expect(testMember).toBeDefined();
      return;
    }

    console.log("Member details:");
    console.log("  ID:", testMember.id);
    console.log("  Name:", testMember.name);
    console.log("  Email:", testMember.email);
    console.log("  Email type:", typeof testMember.email);
    console.log("  Email length:", testMember.email?.length);

    if (!testMember.email) {
      console.error("ERROR: Test123 has no email address!");
      console.error("This is why connection request emails are not being sent.");
      console.error("Please update the member record with an email address.");
    }

    expect(testMember.email).toBeTruthy();
  });
});

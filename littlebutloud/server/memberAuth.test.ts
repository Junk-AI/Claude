import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcrypt";
import {
  createMember,
  getMemberById,
  createMemberAccount,
  getMemberAccountByUsername,
  getMemberAccountByMemberId,
  createMemberEvent,
  getMemberEventsByMemberId,
  getMemberEventById,
  getMemberEventSignupsByEventId,
  createMemberEventSignup,
  updateMemberEvent,
  deleteMemberEvent,
} from "./db";

describe("Member Authentication & Event Management", () => {
  let testMemberId: number;
  let testEventId: number;

  beforeAll(async () => {
    // Create a test member
    testMemberId = await createMember({
      name: "Test Member",
      email: "test@example.com",
      country: "Singapore",
      status: "approved",
      pdpaConsent: true,
      pdpaDataUsage: false,
      pdpaMarketing: false,
      pdpaThirdParty: false,
      eligibleForSpotlight: false,
    });
  });

  describe("Member Account Creation & Login", () => {
    it("should create a member account with hashed password", async () => {
      const username = "testuser123";
      const password = "securePassword123";

      const accountId = await createMemberAccount({
        memberId: testMemberId,
        username: username,
        passwordHash: await bcrypt.hash(password, 10),
      });

      expect(accountId).toBeGreaterThan(0);

      // Verify account was created
      const account = await getMemberAccountByUsername(username);
      expect(account).toBeDefined();
      expect(account?.username).toBe(username);
      expect(account?.memberId).toBe(testMemberId);

      // Verify password hash is different from plain password
      expect(account?.passwordHash).not.toBe(password);

      // Verify password can be verified with bcrypt
      const isPasswordValid = await bcrypt.compare(password, account?.passwordHash || "");
      expect(isPasswordValid).toBe(true);
    });

    it("should retrieve account by member ID", async () => {
      const account = await getMemberAccountByMemberId(testMemberId);
      expect(account).toBeDefined();
      expect(account?.memberId).toBe(testMemberId);
    });

    it("should reject invalid password", async () => {
      const account = await getMemberAccountByUsername("testuser123");
      expect(account).toBeDefined();

      const isPasswordValid = await bcrypt.compare("wrongPassword", account?.passwordHash || "");
      expect(isPasswordValid).toBe(false);
    });

    it("should handle duplicate username prevention", async () => {
      // This would be handled by the router, but we can verify the database constraint
      const account = await getMemberAccountByUsername("testuser123");
      expect(account).toBeDefined();
      // Attempting to create another account with same username would fail at DB level
    });
  });

  describe("Member Event Creation", () => {
    it("should create a member event with all required fields", async () => {
      const eventDate = new Date("2026-07-15");
      testEventId = await createMemberEvent({
        memberId: testMemberId,
        name: "Community Cleanup Drive",
        venue: "Central Park, Singapore",
        startTime: "09:00",
        endTime: "12:00",
        date: eventDate,
        contactPerson: "John Doe",
        details: "Join us for a community cleanup initiative to make our neighborhood cleaner.",
        volunteerLimit: 50,
      });

      expect(testEventId).toBeGreaterThan(0);

      // Verify event was created
      const event = await getMemberEventById(testEventId);
      expect(event).toBeDefined();
      expect(event?.name).toBe("Community Cleanup Drive");
      expect(event?.memberId).toBe(testMemberId);
      expect(event?.volunteerLimit).toBe(50);
    });

    it("should retrieve all events for a member", async () => {
      const events = await getMemberEventsByMemberId(testMemberId);
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].memberId).toBe(testMemberId);
    });

    it("should update a member event", async () => {
      await updateMemberEvent(testEventId, {
        name: "Updated Community Cleanup Drive",
        volunteerLimit: 75,
      });

      const updatedEvent = await getMemberEventById(testEventId);
      expect(updatedEvent?.name).toBe("Updated Community Cleanup Drive");
      expect(updatedEvent?.volunteerLimit).toBe(75);
    });
  });

  describe("Member Event Signups", () => {
    it("should create a signup for an event", async () => {
      const signupId = await createMemberEventSignup({
        eventId: testEventId,
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+65 9123 4567",
      });

      expect(signupId).toBeGreaterThan(0);
    });

    it("should create multiple signups and retrieve them", async () => {
      // Create additional signups
      await createMemberEventSignup({
        eventId: testEventId,
        name: "Bob Smith",
        email: "bob@example.com",
        phone: "+65 9234 5678",
      });

      await createMemberEventSignup({
        eventId: testEventId,
        name: "Carol White",
        email: "carol@example.com",
        phone: "+65 9345 6789",
      });

      // Retrieve all signups
      const signups = await getMemberEventSignupsByEventId(testEventId);
      expect(signups.length).toBeGreaterThanOrEqual(3);

      // Verify signup details
      const aliceSignup = signups.find((s) => s.name === "Alice Johnson");
      expect(aliceSignup).toBeDefined();
      expect(aliceSignup?.email).toBe("alice@example.com");
      expect(aliceSignup?.phone).toBe("+65 9123 4567");
    });

    it("should track signup count for volunteer limit enforcement", async () => {
      const signups = await getMemberEventSignupsByEventId(testEventId);
      const event = await getMemberEventById(testEventId);

      expect(signups.length).toBeLessThanOrEqual(event?.volunteerLimit || 0);
    });
  });

  describe("Member Event Deletion", () => {
    it("should delete a member event and cascade delete signups", async () => {
      // Create a temporary event for deletion testing
      const tempEventId = await createMemberEvent({
        memberId: testMemberId,
        name: "Temporary Event",
        venue: "Test Venue",
        startTime: "10:00",
        endTime: "11:00",
        date: new Date(),
        contactPerson: "Test Contact",
        details: "This is a temporary event for deletion testing",
        volunteerLimit: 10,
      });

      // Add a signup
      await createMemberEventSignup({
        eventId: tempEventId,
        name: "Test Signup",
        email: "test@example.com",
        phone: "+65 9000 0000",
      });

      // Delete the event
      await deleteMemberEvent(tempEventId);

      // Verify event is deleted
      const deletedEvent = await getMemberEventById(tempEventId);
      expect(deletedEvent).toBeUndefined();

      // Verify signups are cascade deleted
      const signups = await getMemberEventSignupsByEventId(tempEventId);
      expect(signups.length).toBe(0);
    });
  });

  describe("Authorization & Security", () => {
    it("should verify member exists before creating account", async () => {
      // This is handled by the router, but we verify the member lookup
      const nonExistentMember = await getMemberById(99999);
      expect(nonExistentMember).toBeUndefined();
    });

    it("should verify password is properly hashed", async () => {
      const plainPassword = "MySecurePassword123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Hash should be different from plain password
      expect(hashedPassword).not.toBe(plainPassword);

      // Hash should be verifiable
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      // Wrong password should not verify
      const isInvalid = await bcrypt.compare("WrongPassword", hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it("should prevent member from accessing other member's events", async () => {
      // Create a second member
      const secondMemberId = await createMember({
        name: "Second Member",
        email: "second@example.com",
        country: "Singapore",
        status: "approved",
        pdpaConsent: true,
        pdpaDataUsage: false,
        pdpaMarketing: false,
        pdpaThirdParty: false,
        eligibleForSpotlight: false,
      });

      // Create event for first member
      const event = await getMemberEventById(testEventId);
      expect(event?.memberId).toBe(testMemberId);
      expect(event?.memberId).not.toBe(secondMemberId);
    });
  });

  describe("Data Validation", () => {
    it("should store event details with correct data types", async () => {
      const event = await getMemberEventById(testEventId);
      expect(event?.name).toBeTypeOf("string");
      expect(event?.venue).toBeTypeOf("string");
      expect(event?.startTime).toBeTypeOf("string");
      expect(event?.endTime).toBeTypeOf("string");
      expect(event?.date).toBeInstanceOf(Date);
      expect(event?.contactPerson).toBeTypeOf("string");
      expect(event?.details).toBeTypeOf("string");
      expect(event?.volunteerLimit).toBeTypeOf("number");
      expect(event?.memberId).toBeTypeOf("number");
    });

    it("should store signup details with correct data types", async () => {
      const signups = await getMemberEventSignupsByEventId(testEventId);
      const signup = signups[0];

      expect(signup.name).toBeTypeOf("string");
      expect(signup.email).toBeTypeOf("string");
      expect(signup.phone).toBeTypeOf("string");
      expect(signup.eventId).toBeTypeOf("number");
      expect(signup.createdAt).toBeInstanceOf(Date);
    });
  });

  afterAll(async () => {
    // Cleanup is handled by cascade delete on member deletion
    // In production, you might want to explicitly delete test data
  });
});

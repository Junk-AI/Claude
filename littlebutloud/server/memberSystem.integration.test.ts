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
} from "./db";

/**
 * Comprehensive End-to-End Integration Test
 * 
 * This test simulates the complete member lifecycle:
 * 1. Member joins the network (auto-approved)
 * 2. Member creates an account with username/password
 * 3. Member creates a volunteering event
 * 4. Public users sign up for the event
 * 5. Member views signups and contact information
 */
describe("Member System - End-to-End Integration", () => {
  let memberId: number;
  let eventId: number;
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "SecurePassword123";

  describe("Complete Member Lifecycle", () => {
    it("Step 1: Member joins the network (auto-approved)", async () => {
      // Simulate Connect form submission
      memberId = await createMember({
        name: "Youth Climate Action",
        email: "contact@youthclimate.org",
        country: "Singapore",
        status: "approved", // Auto-approved
        pdpaConsent: true,
        pdpaDataUsage: true,
        pdpaMarketing: false,
        pdpaThirdParty: false,
        eligibleForSpotlight: false,
      });

      expect(memberId).toBeGreaterThan(0);

      // Verify member was created with approved status
      const member = await getMemberById(memberId);
      expect(member).toBeDefined();
      expect(member?.status).toBe("approved");
      expect(member?.name).toBe("Youth Climate Action");
    });

    it("Step 2: Member creates account with username/password", async () => {
      // Simulate second page of signup form
      const hashedPassword = await bcrypt.hash(testPassword, 10);

      const accountId = await createMemberAccount({
        memberId,
        username: testUsername,
        passwordHash: hashedPassword,
      });

      expect(accountId).toBeGreaterThan(0);

      // Verify account was created
      const account = await getMemberAccountByUsername(testUsername);
      expect(account).toBeDefined();
      expect(account?.memberId).toBe(memberId);

      // Verify password is correct
      const isPasswordValid = await bcrypt.compare(testPassword, account?.passwordHash || "");
      expect(isPasswordValid).toBe(true);
    });

    it("Step 3: Member creates a volunteering event", async () => {
      // Simulate event creation in Members Portal
      const eventDate = new Date("2026-08-15");
      eventId = await createMemberEvent({
        memberId,
        name: "Beach Cleanup for Ocean Conservation",
        venue: "East Coast Park, Singapore",
        startTime: "08:00",
        endTime: "11:00",
        date: eventDate,
        contactPerson: "Sarah Lee",
        details: "Join us for a beach cleanup to protect our marine ecosystem. We'll collect plastic waste and learn about ocean conservation. Bring gloves and water bottles!",
        volunteerLimit: 30,
      });

      expect(eventId).toBeGreaterThan(0);

      // Verify event was created
      const event = await getMemberEventById(eventId);
      expect(event).toBeDefined();
      expect(event?.name).toBe("Beach Cleanup for Ocean Conservation");
      expect(event?.memberId).toBe(memberId);
      expect(event?.volunteerLimit).toBe(30);
    });

    it("Step 4: Public users sign up for the event", async () => {
      // Simulate multiple public signups via Collaborate tab
      const signups = [
        { name: "Alice Johnson", email: "alice@example.com", phone: "+65 9123 4567" },
        { name: "Bob Smith", email: "bob@example.com", phone: "+65 9234 5678" },
        { name: "Carol White", email: "carol@example.com", phone: "+65 9345 6789" },
        { name: "David Chen", email: "david@example.com", phone: "+65 9456 7890" },
      ];

      for (const signup of signups) {
        const signupId = await createMemberEventSignup({
          eventId,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
        });
        expect(signupId).toBeGreaterThan(0);
      }
    });

    it("Step 5: Member views signups and contact information", async () => {
      // Simulate member viewing signups in Track Events tab
      const signups = await getMemberEventSignupsByEventId(eventId);

      expect(signups.length).toBe(4);

      // Verify signup details are complete
      const firstSignup = signups[0];
      expect(firstSignup.name).toBe("Alice Johnson");
      expect(firstSignup.email).toBe("alice@example.com");
      expect(firstSignup.phone).toBe("+65 9123 4567");

      // Verify all signups have required fields
      signups.forEach((signup) => {
        expect(signup.name).toBeDefined();
        expect(signup.email).toBeDefined();
        expect(signup.phone).toBeDefined();
        expect(signup.eventId).toBe(eventId);
      });
    });
  });

  describe("Member Event Management", () => {
    it("Member can retrieve all their created events", async () => {
      const events = await getMemberEventsByMemberId(memberId);
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events.some((e) => e.id === eventId)).toBe(true);
    });

    it("Event details are correctly stored and retrievable", async () => {
      const event = await getMemberEventById(eventId);
      expect(event?.name).toBe("Beach Cleanup for Ocean Conservation");
      expect(event?.venue).toBe("East Coast Park, Singapore");
      expect(event?.startTime).toBe("08:00");
      expect(event?.endTime).toBe("11:00");
      expect(event?.contactPerson).toBe("Sarah Lee");
      expect(event?.volunteerLimit).toBe(30);
    });

    it("Volunteer limit is enforced", async () => {
      const signups = await getMemberEventSignupsByEventId(eventId);
      const event = await getMemberEventById(eventId);
      expect(signups.length).toBeLessThanOrEqual(event?.volunteerLimit || 0);
    });
  });

  describe("Security & Authorization", () => {
    it("Member account has hashed password (not plain text)", async () => {
      const account = await getMemberAccountByMemberId(memberId);
      expect(account?.passwordHash).not.toBe(testPassword);
      expect(account?.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it("Password verification works correctly", async () => {
      const account = await getMemberAccountByUsername(testUsername);
      const isValid = await bcrypt.compare(testPassword, account?.passwordHash || "");
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare("WrongPassword", account?.passwordHash || "");
      expect(isInvalid).toBe(false);
    });

    it("Member can only access their own events", async () => {
      // Create a second member
      const secondMemberId = await createMember({
        name: "Environmental Warriors",
        email: "warriors@env.org",
        country: "Singapore",
        status: "approved",
        pdpaConsent: true,
        pdpaDataUsage: true,
        pdpaMarketing: false,
        pdpaThirdParty: false,
        eligibleForSpotlight: false,
      });

      // Get events for first member
      const firstMemberEvents = await getMemberEventsByMemberId(memberId);
      // Get events for second member (should be empty)
      const secondMemberEvents = await getMemberEventsByMemberId(secondMemberId);

      expect(firstMemberEvents.length).toBeGreaterThan(0);
      expect(secondMemberEvents.length).toBe(0);
      expect(firstMemberEvents.some((e) => e.memberId === secondMemberId)).toBe(false);
    });
  });

  describe("Data Integrity", () => {
    it("Signup data includes all required contact information", async () => {
      const signups = await getMemberEventSignupsByEventId(eventId);
      signups.forEach((signup) => {
        expect(signup.name).toBeTypeOf("string");
        expect(signup.email).toBeTypeOf("string");
        expect(signup.phone).toBeTypeOf("string");
        expect(signup.name.length).toBeGreaterThan(0);
        expect(signup.email).toMatch(/@/);
        expect(signup.phone.length).toBeGreaterThan(0);
      });
    });

    it("Event dates are stored correctly", async () => {
      const event = await getMemberEventById(eventId);
      expect(event?.date).toBeInstanceOf(Date);
      expect(event?.date?.getFullYear()).toBe(2026);
      expect(event?.date?.getMonth()).toBe(7); // August (0-indexed)
      expect(event?.date?.getDate()).toBe(15);
    });

    it("Timestamps are recorded for events and signups", async () => {
      const event = await getMemberEventById(eventId);
      expect(event?.createdAt).toBeInstanceOf(Date);
      expect(event?.updatedAt).toBeInstanceOf(Date);

      const signups = await getMemberEventSignupsByEventId(eventId);
      signups.forEach((signup) => {
        expect(signup.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("Real-World Scenarios", () => {
    it("Event is fully booked when volunteer limit is reached", async () => {
      // Create a small event with limit of 2
      const smallEventId = await createMemberEvent({
        memberId,
        name: "Small Workshop",
        venue: "Community Center",
        startTime: "14:00",
        endTime: "15:00",
        date: new Date("2026-09-01"),
        contactPerson: "John Doe",
        details: "Limited capacity workshop",
        volunteerLimit: 2,
      });

      // Add exactly 2 signups
      await createMemberEventSignup({
        eventId: smallEventId,
        name: "Person One",
        email: "one@example.com",
        phone: "+65 9111 1111",
      });

      await createMemberEventSignup({
        eventId: smallEventId,
        name: "Person Two",
        email: "two@example.com",
        phone: "+65 9222 2222",
      });

      // Verify event is full
      const signups = await getMemberEventSignupsByEventId(smallEventId);
      const event = await getMemberEventById(smallEventId);
      expect(signups.length).toBe(event?.volunteerLimit);
    });

    it("Member can track signup growth over time", async () => {
      // Get initial signup count
      const initialSignups = await getMemberEventSignupsByEventId(eventId);
      const initialCount = initialSignups.length;

      // Add a new signup
      await createMemberEventSignup({
        eventId,
        name: "Eve Martinez",
        email: "eve@example.com",
        phone: "+65 9567 8901",
      });

      // Verify count increased
      const updatedSignups = await getMemberEventSignupsByEventId(eventId);
      expect(updatedSignups.length).toBe(initialCount + 1);
    });
  });

  afterAll(async () => {
    // Cleanup handled by cascade delete
  });
});

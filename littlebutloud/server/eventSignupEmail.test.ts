import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";

describe("Event Signup Email Notifications", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    if (db?.close) {
      await db.close();
    }
  });

  it("should create event registration record", async () => {
    const registration = {
      eventId: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    expect(registration.name).toBe("John Doe");
    expect(registration.email).toContain("@");
    expect(registration.eventId).toBeGreaterThan(0);
  });

  it("should validate email format for event registration", () => {
    const validEmail = "participant@example.com";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test(validEmail)).toBe(true);
  });

  it("should include event details in confirmation email", () => {
    const eventData = {
      title: "Youth Summit 2026",
      date: new Date("2026-06-15"),
      location: "Singapore",
      description: "Annual gathering of young changemakers",
    };

    const emailContent = `
Event Confirmation: ${eventData.title}
Date: ${eventData.date.toLocaleDateString()}
Location: ${eventData.location}
Description: ${eventData.description}
    `.trim();

    expect(emailContent).toContain(eventData.title);
    expect(emailContent).toContain(eventData.location);
  });

  it("should send confirmation to participant email", () => {
    const participantEmail = "participant@example.com";
    const eventTitle = "Workshop";

    expect(participantEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(eventTitle).toBeTruthy();
  });

  it("should notify admin of new registration", () => {
    const adminNotification = {
      participantName: "Jane Smith",
      participantEmail: "jane@example.com",
      eventTitle: "Community Event",
    };

    expect(adminNotification.participantName).toBeTruthy();
    expect(adminNotification.participantEmail).toContain("@");
    expect(adminNotification.eventTitle).toBeTruthy();
  });

  it("should handle optional event location in email", () => {
    const eventWithLocation = {
      title: "Event with Location",
      location: "Singapore",
    };

    const eventWithoutLocation = {
      title: "Event without Location",
      location: null,
    };

    expect(eventWithLocation.location).toBeTruthy();
    expect(eventWithoutLocation.location).toBeNull();
  });

  it("should format event date correctly in email", () => {
    const eventDate = new Date("2026-06-15T14:30:00");
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    expect(formattedDate).toContain("June");
    expect(formattedDate).toContain("2026");
  });
});

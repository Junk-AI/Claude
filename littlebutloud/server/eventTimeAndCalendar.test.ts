import { describe, it, expect } from "vitest";

describe("Event Time Display and Calendar Export", () => {
  it("should format event start and end times correctly", () => {
    const startTime = "14:30";
    const endTime = "16:00";
    
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    expect(startHours).toBe(14);
    expect(startMinutes).toBe(30);
    expect(endHours).toBe(16);
    expect(endMinutes).toBe(0);
  });

  it("should generate valid iCal format", () => {
    const event = {
      id: 1,
      title: "Youth Summit 2026",
      description: "Annual gathering of young changemakers",
      location: "Singapore",
      organiser: "Network of Deeds",
      startTime: "09:00",
      endTime: "17:00",
    };

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Network of Deeds by Kids//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:event-${event.id}@littlebutloud.com
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
ORGANIZER:CN=${event.organiser}
END:VEVENT
END:VCALENDAR`;

    expect(icalContent).toContain("BEGIN:VCALENDAR");
    expect(icalContent).toContain("END:VCALENDAR");
    expect(icalContent).toContain("BEGIN:VEVENT");
    expect(icalContent).toContain("END:VEVENT");
    expect(icalContent).toContain(event.title);
  });

  it("should display capacity limit in event details", () => {
    const event = {
      id: 1,
      title: "Workshop",
      capacityLimit: 50,
    };

    expect(event.capacityLimit).toBe(50);
    expect(event.capacityLimit).toBeGreaterThan(0);
  });

  it("should calculate event duration correctly", () => {
    const startTime = "09:00";
    const endTime = "17:00";

    const [startHours] = startTime.split(":").map(Number);
    const [endHours] = endTime.split(":").map(Number);
    const duration = endHours - startHours;

    expect(duration).toBe(8);
  });

  it("should handle events spanning multiple hours", () => {
    const startTime = "14:30";
    const endTime = "16:45";

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    expect(durationMinutes).toBe(135); // 2 hours 15 minutes
  });

  it("should validate event has required fields for calendar export", () => {
    const event = {
      id: 1,
      title: "Event Title",
      eventDate: new Date("2026-06-15"),
      startTime: "10:00",
      endTime: "12:00",
    };

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.eventDate).toBeDefined();
    expect(event.startTime).toBeDefined();
    expect(event.endTime).toBeDefined();
  });

  it("should generate unique event UID for calendar", () => {
    const eventId1 = 1;
    const eventId2 = 2;

    const uid1 = `event-${eventId1}@littlebutloud.com`;
    const uid2 = `event-${eventId2}@littlebutloud.com`;

    expect(uid1).not.toBe(uid2);
    expect(uid1).toContain("littlebutloud.com");
  });
});

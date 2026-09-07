import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createPastEvent, updatePastEvent, getPastEventById, deletePastEvent, getAllPastEvents } from "./db";
import type { InsertPastEvent } from "../drizzle/schema";

describe("Past Events Photos Functionality", () => {
  let testEventId: number;

  beforeAll(async () => {
    // Create a test past event
    const testEvent: InsertPastEvent = {
      title: "Test Event with Photos",
      description: "A test event to verify photos link functionality",
      eventDate: new Date("2024-12-15"),
      location: "Community Center",
      organiser: "Test Organiser",
      participants: "50 participants",
      photosUrl: "https://drive.google.com/drive/folders/test-folder-id",
    };
    testEventId = await createPastEvent(testEvent);
  });

  afterAll(async () => {
    // Clean up test data
    if (testEventId) {
      await deletePastEvent(testEventId);
    }
  });

  it("should create a past event with photos URL", async () => {
    const event = await getPastEventById(testEventId);
    expect(event).toBeDefined();
    expect(event?.title).toBe("Test Event with Photos");
    expect(event?.photosUrl).toBe("https://drive.google.com/drive/folders/test-folder-id");
  });

  it("should update past event photos URL", async () => {
    const newPhotosUrl = "https://drive.google.com/drive/folders/new-folder-id";
    await updatePastEvent(testEventId, { photosUrl: newPhotosUrl });
    
    const updatedEvent = await getPastEventById(testEventId);
    expect(updatedEvent?.photosUrl).toBe(newPhotosUrl);
  });

  it("should handle empty photos URL", async () => {
    await updatePastEvent(testEventId, { photosUrl: null as any });
    
    const event = await getPastEventById(testEventId);
    expect(event?.photosUrl).toBeNull();
  });

  it("should retrieve all past events with photos links", async () => {
    const allEvents = await getAllPastEvents();
    expect(Array.isArray(allEvents)).toBe(true);
    
    const testEvent = allEvents.find(e => e.id === testEventId);
    expect(testEvent).toBeDefined();
  });

  it("should create past event without photos URL", async () => {
    const eventWithoutPhotos: InsertPastEvent = {
      title: "Event Without Photos",
      description: "Test event without photos link",
      eventDate: new Date("2024-12-20"),
      location: "Park",
      organiser: "Organiser",
      participants: "30 participants",
    };
    
    const id = await createPastEvent(eventWithoutPhotos);
    const event = await getPastEventById(id);
    
    expect(event?.title).toBe("Event Without Photos");
    expect(event?.photosUrl).toBeNull();
    
    // Clean up
    await deletePastEvent(id);
  });

  it("should support various URL formats for photos", async () => {
    const testUrls = [
      "https://drive.google.com/drive/folders/test-id",
      "https://photos.google.com/share/test-id",
      "https://flickr.com/photos/test-id",
      "https://example.com/photos/album",
    ];

    for (const url of testUrls) {
      await updatePastEvent(testEventId, { photosUrl: url });
      const event = await getPastEventById(testEventId);
      expect(event?.photosUrl).toBe(url);
    }
  });
});

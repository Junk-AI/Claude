import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import bcrypt from "bcrypt";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  createMember: vi.fn().mockResolvedValue(1),
  getAllMembers: vi.fn().mockResolvedValue([]),
  getApprovedMembers: vi.fn().mockResolvedValue([]),
  getSpotlightMembers: vi.fn().mockResolvedValue([]),
  getDistinctMemberFilters: vi.fn().mockResolvedValue({ countries: [], issueAreas: [], memberTypes: [] }),
  getMemberById: vi.fn().mockResolvedValue({ id: 1, name: "Test Member" }),
  updateMember: vi.fn().mockResolvedValue(undefined),
  deleteMember: vi.fn().mockResolvedValue(undefined),
  createCollaboration: vi.fn().mockResolvedValue(2),
  getAllCollaborations: vi.fn().mockResolvedValue([]),
  getApprovedCollaborations: vi.fn().mockResolvedValue([]),
  getCollaborationById: vi.fn().mockResolvedValue({ id: 2, title: "Test Collab" }),
  updateCollaboration: vi.fn().mockResolvedValue(undefined),
  deleteCollaboration: vi.fn().mockResolvedValue(undefined),
  createEvent: vi.fn().mockResolvedValue(3),
  getAllEvents: vi.fn().mockResolvedValue([]),
  getUpcomingEvents: vi.fn().mockResolvedValue([]),
  getEventById: vi.fn().mockResolvedValue({ id: 3, title: "Test Event" }),
  updateEvent: vi.fn().mockResolvedValue(undefined),
  deleteEvent: vi.fn().mockResolvedValue(undefined),
  createEventRegistration: vi.fn().mockResolvedValue(4),
  getEventRegistrations: vi.fn().mockResolvedValue([]),
  getAllPastEvents: vi.fn().mockResolvedValue([]),
  getPastEventById: vi.fn().mockResolvedValue({ id: 5, title: "Past Event" }),
  getPastEventImages: vi.fn().mockResolvedValue([]),
  createPastEvent: vi.fn().mockResolvedValue(5),
  updatePastEvent: vi.fn().mockResolvedValue(undefined),
  deletePastEvent: vi.fn().mockResolvedValue(undefined),
  addPastEventImage: vi.fn().mockResolvedValue(6),
  deletePastEventImage: vi.fn().mockResolvedValue(undefined),
  getAllResources: vi.fn().mockResolvedValue([]),
  getFeaturedResources: vi.fn().mockResolvedValue([]),
  getResourceById: vi.fn().mockResolvedValue({ id: 7, title: "Test Resource" }),
  createResource: vi.fn().mockResolvedValue(7),
  updateResource: vi.fn().mockResolvedValue(undefined),
  deleteResource: vi.fn().mockResolvedValue(undefined),
  getLatestUpdates: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./email", () => ({
  notifyNewMember: vi.fn().mockResolvedValue(undefined),
  notifyNewCollaboration: vi.fn().mockResolvedValue(undefined),
  notifyNewEventRegistration: vi.fn().mockResolvedValue(undefined),
  notifyApproval: vi.fn().mockResolvedValue(undefined),
  notifyNewEvent: vi.fn().mockResolvedValue(undefined),
  sendEventConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "/manus-storage/test.jpg", key: "test.jpg" }),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
    expect(result?.name).toBe("Admin User");
  });

  it("logout clears session cookie", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

// ─── Members Tests ────────────────────────────────────────────────────────────
describe("members", () => {
  it("join creates an automatically approved member and notifies admin", async () => {
    const { createMember } = await import("./db");
    const { notifyNewMember } = await import("./email");
    const caller = appRouter.createCaller(makePublicCtx());

    const result = await caller.members.join({
      name: "Alice Youth",
      email: "alice@example.com",
      age: 16,
      location: "Nairobi",
      country: "Kenya",
      initiativeName: "Green Kids",
      issueArea: "Climate & Environment",
      memberType: "Youth Group",
      description: "We plant trees",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe(1);
    expect(createMember).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Alice Youth", status: "approved", eligibleForSpotlight: false })
    );
    expect(notifyNewMember).toHaveBeenCalledWith(expect.objectContaining({ name: "Alice Youth" }));
  });

  it("join requires name and valid email", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.members.join({ name: "", email: "alice@example.com" })).rejects.toThrow();
    await expect(caller.members.join({ name: "Alice", email: "not-an-email" })).rejects.toThrow();
  });

  it("list returns approved members only (public)", async () => {
    const { getApprovedMembers } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.members.list({});
    expect(getApprovedMembers).toHaveBeenCalled();
  });

  it("spotlight returns spotlight-eligible members (public)", async () => {
    const { getSpotlightMembers } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.members.spotlight();
    expect(getSpotlightMembers).toHaveBeenCalled();
  });

  it("adminList requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.members.adminList()).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("adminList succeeds for admin", async () => {
    const { getAllMembers } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.members.adminList();
    expect(getAllMembers).toHaveBeenCalled();
  });

  it("update sends approval notification when status changes to approved", async () => {
    const { notifyApproval } = await import("./email");
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.members.update({ id: 1, status: "approved" });
    expect(notifyApproval).toHaveBeenCalledWith("Member", "Test Member");
  });

  it("delete requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.members.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("bulkCreate requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.members.bulkCreate([])).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("bulkCreate processes multiple rows and returns counts", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.members.bulkCreate([
      { name: "Bob", email: "bob@example.com" },
      { name: "Carol", email: "carol@example.com" },
    ]);
    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
  });
});

// ─── Collaborations Tests ─────────────────────────────────────────────────────
describe("collaborations", () => {
  it("post creates collaboration with pending status and notifies admin", async () => {
    const { createCollaboration } = await import("./db");
    const { notifyNewCollaboration } = await import("./email");
    const caller = appRouter.createCaller(makePublicCtx());

    const result = await caller.collaborations.post({
      title: "Youth Climate Campaign",
      description: "Join our campaign",
      collaborationNeeded: "Graphic designers",
      location: "Remote",
      contactName: "Alice",
      contactEmail: "alice@example.com",
    });

    expect(result.success).toBe(true);
    expect(createCollaboration).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Youth Climate Campaign", status: "pending" })
    );
    expect(notifyNewCollaboration).toHaveBeenCalled();
  });

  it("post requires title", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.collaborations.post({ title: "" })).rejects.toThrow();
  });

  it("list returns only approved collaborations (public)", async () => {
    const { getApprovedCollaborations } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.collaborations.list();
    expect(getApprovedCollaborations).toHaveBeenCalled();
  });

  it("adminList requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.collaborations.adminList()).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("update sends approval notification when approved", async () => {
    const { notifyApproval } = await import("./email");
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.collaborations.update({ id: 2, status: "approved" });
    expect(notifyApproval).toHaveBeenCalledWith("Collaboration", "Test Collab");
  });

  it("delete requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.collaborations.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Admin/);
  });
});

// ─── Events Tests ─────────────────────────────────────────────────────────────
describe("events", () => {
  it("upcoming returns upcoming events (public)", async () => {
    const { getUpcomingEvents } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.events.upcoming();
    expect(getUpcomingEvents).toHaveBeenCalled();
  });

  it("create requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.events.create({
      title: "Test Event",
      eventDate: new Date(),
      status: "upcoming",
    })).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("create succeeds for admin and notifies admin", async () => {
    const { createEvent } = await import("./db");
    const { notifyNewEvent } = await import("./email");
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.create({
      title: "Youth Summit 2025",
      eventDate: new Date("2025-06-15"),
      startTime: "09:00",
      endTime: "12:00",
      location: "Nairobi",
      organiser: "Little But Loud",
      coverImageUrl: "/manus-storage/events/youth-summit.jpg",
      coverImageKey: "events/youth-summit.jpg",
      status: "upcoming",
    });
    expect(result.success).toBe(true);
    expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: "Youth Summit 2025",
      coverImageUrl: "/manus-storage/events/youth-summit.jpg",
      coverImageKey: "events/youth-summit.jpg",
    }));
    expect(notifyNewEvent).toHaveBeenCalledWith(expect.objectContaining({ title: "Youth Summit 2025" }));
  });

  it("uploadCoverImage stores an Admin-provided event cover", async () => {
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(makeAdminCtx());

    const result = await caller.events.uploadCoverImage({
      fileBase64: Buffer.from("event-cover").toString("base64"),
      mimeType: "image/webp",
      fileName: "Festival cover.webp",
    });

    expect(storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^events\/\d+-Festival-cover\.webp$/),
      expect.any(Buffer),
      "image/webp"
    );
    expect(result).toEqual({ url: "/manus-storage/test.jpg", key: expect.stringMatching(/^events\//) });
  });

  it("registerInterest saves registration and notifies admin", async () => {
    const { createEventRegistration } = await import("./db");
    const { notifyNewEventRegistration } = await import("./email");
    const caller = appRouter.createCaller(makePublicCtx());

    const result = await caller.events.registerInterest({
      name: "Bob",
      email: "bob@example.com",
      eventId: 3,
    });

    expect(result.success).toBe(true);
    expect(createEventRegistration).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bob", email: "bob@example.com", eventId: 3 })
    );
    expect(notifyNewEventRegistration).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bob", email: "bob@example.com" })
    );
  });

  it("registerInterest requires name and valid email", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.events.registerInterest({ name: "", email: "bob@example.com" })).rejects.toThrow();
    await expect(caller.events.registerInterest({ name: "Bob", email: "not-email" })).rejects.toThrow();
  });

  it("delete requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.events.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Admin/);
  });
});

// ─── Past Events Tests ────────────────────────────────────────────────────────
describe("pastEvents", () => {
  it("list returns all past events with images (public)", async () => {
    const { getAllPastEvents, getPastEventImages } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.pastEvents.list();
    expect(getAllPastEvents).toHaveBeenCalled();
  });

  it("create requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.pastEvents.create({ title: "Past Event" })).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("create succeeds for admin", async () => {
    const { createPastEvent } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.pastEvents.create({
      title: "Youth Hackathon 2024",
      description: "Annual hackathon",
      participants: "200 youth participants",
    });
    expect(result.success).toBe(true);
    expect(createPastEvent).toHaveBeenCalled();
  });

  it("hides photo URLs and password hashes from the public past-events list", async () => {
    const { getAllPastEvents } = await import("./db");
    (getAllPastEvents as any).mockResolvedValueOnce([{
      id: 8,
      title: "Photo Event",
      photosUrl: "https://drive.example/photos",
      photosPassword: "hashed-password",
    }]);
    const caller = appRouter.createCaller(makePublicCtx());

    const result = await caller.pastEvents.list();

    expect(result[0]).toMatchObject({ id: 8, hasPhotos: true, photosProtected: true });
    expect(result[0]).not.toHaveProperty("photosUrl");
    expect(result[0]).not.toHaveProperty("photosPassword");
  });

  it("hashes a password before an admin stores a protected photo link", async () => {
    const { createPastEvent } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());

    await caller.pastEvents.create({
      title: "Protected photos",
      photosUrl: "https://drive.example/protected",
      photosPassword: "photo-pass",
    });

    const savedEvent = (createPastEvent as any).mock.calls.at(-1)[0];
    expect(savedEvent.photosPassword).not.toBe("photo-pass");
    await expect(bcrypt.compare("photo-pass", savedEvent.photosPassword)).resolves.toBe(true);
  });

  it("returns the photo link only after the correct password is supplied", async () => {
    const { getPastEventById } = await import("./db");
    (getPastEventById as any).mockResolvedValueOnce({
      id: 9,
      title: "Protected photos",
      photosUrl: "https://drive.example/protected",
      photosPassword: await bcrypt.hash("photo-pass", 10),
    });
    const caller = appRouter.createCaller(makePublicCtx());

    await expect(caller.pastEvents.unlockPhotos({ id: 9, password: "wrong" })).rejects.toThrow("Wrong password");

    (getPastEventById as any).mockResolvedValueOnce({
      id: 9,
      title: "Protected photos",
      photosUrl: "https://drive.example/protected",
      photosPassword: await bcrypt.hash("photo-pass", 10),
    });
    await expect(caller.pastEvents.unlockPhotos({ id: 9, password: "photo-pass" })).resolves.toEqual({
      photosUrl: "https://drive.example/protected",
    });
  });

  it("uploadImage requires admin and stores to S3", async () => {
    const { storagePut } = await import("./storage");
    const { addPastEventImage } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());

    const result = await caller.pastEvents.uploadImage({
      pastEventId: 5,
      fileBase64: Buffer.from("fake-image-data").toString("base64"),
      mimeType: "image/jpeg",
      fileName: "event.jpg",
    });

    expect(storagePut).toHaveBeenCalled();
    expect(addPastEventImage).toHaveBeenCalledWith(
      expect.objectContaining({ pastEventId: 5, imageUrl: "/manus-storage/test.jpg" })
    );
    expect(result.url).toBe("/manus-storage/test.jpg");
  });

  it("deleteImage requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.pastEvents.deleteImage({ id: 1 })).rejects.toThrow(/FORBIDDEN|Admin/);
  });
});

// ─── Resources Tests ──────────────────────────────────────────────────────────
describe("resources", () => {
  it("list returns all resources (public)", async () => {
    const { getAllResources } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.resources.list();
    expect(getAllResources).toHaveBeenCalled();
  });

  it("featured returns only featured resources (public)", async () => {
    const { getFeaturedResources } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.resources.featured();
    expect(getFeaturedResources).toHaveBeenCalled();
  });

  it("create requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.resources.create({ title: "Guide", featured: false })).rejects.toThrow(/FORBIDDEN|Admin/);
  });

  it("create succeeds for admin with all fields", async () => {
    const { createResource } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.resources.create({
      title: "Youth Advocacy Toolkit",
      description: "A comprehensive guide",
      resourceType: "Toolkit",
      featured: true,
    });
    expect(result.success).toBe(true);
    expect(createResource).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Youth Advocacy Toolkit", featured: true })
    );
  });

  it("uploadFile requires admin and stores to S3", async () => {
    const { storagePut } = await import("./storage");
    const { updateResource } = await import("./db");
    const caller = appRouter.createCaller(makeAdminCtx());

    const result = await caller.resources.uploadFile({
      resourceId: 7,
      fileBase64: Buffer.from("fake-pdf-data").toString("base64"),
      mimeType: "application/pdf",
      fileName: "toolkit.pdf",
    });

    expect(storagePut).toHaveBeenCalled();
    expect(updateResource).toHaveBeenCalledWith(7, expect.objectContaining({ fileUrl: "/manus-storage/test.jpg" }));
    expect(result.url).toBe("/manus-storage/test.jpg");
  });

  it("delete requires admin role", async () => {
    const userCaller = appRouter.createCaller(makeUserCtx());
    await expect(userCaller.resources.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Admin/);
  });
});

// ─── Home Router Tests ────────────────────────────────────────────────────────
describe("home", () => {
  it("latestUpdates returns updates (public)", async () => {
    const { getLatestUpdates } = await import("./db");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.home.latestUpdates({ limit: 6 });
    expect(getLatestUpdates).toHaveBeenCalledWith(6);
  });
});

// ─── Security: Admin-only procedure enforcement ───────────────────────────────
describe("security: admin-only procedures reject non-admins", () => {
  const adminOnlyProcedures = [
    { name: "members.adminList", call: (c: any) => c.members.adminList() },
    { name: "members.delete", call: (c: any) => c.members.delete({ id: 1 }) },
    { name: "members.bulkCreate", call: (c: any) => c.members.bulkCreate([]) },
    { name: "collaborations.adminList", call: (c: any) => c.collaborations.adminList() },
    { name: "collaborations.delete", call: (c: any) => c.collaborations.delete({ id: 1 }) },
    { name: "events.create", call: (c: any) => c.events.create({ title: "T", eventDate: new Date(), status: "upcoming" }) },
    { name: "events.uploadCoverImage", call: (c: any) => c.events.uploadCoverImage({ fileBase64: "dGVzdA==", mimeType: "image/jpeg", fileName: "event.jpg" }) },
    { name: "events.delete", call: (c: any) => c.events.delete({ id: 1 }) },
    { name: "events.adminList", call: (c: any) => c.events.adminList() },
    { name: "pastEvents.create", call: (c: any) => c.pastEvents.create({ title: "T" }) },
    { name: "pastEvents.delete", call: (c: any) => c.pastEvents.delete({ id: 1 }) },
    { name: "resources.create", call: (c: any) => c.resources.create({ title: "T", featured: false }) },
    { name: "resources.delete", call: (c: any) => c.resources.delete({ id: 1 }) },
  ];

  for (const { name, call } of adminOnlyProcedures) {
    it(`${name} is blocked for unauthenticated users`, async () => {
      const caller = appRouter.createCaller(makePublicCtx());
      await expect(call(caller)).rejects.toThrow();
    });

    it(`${name} is blocked for regular users`, async () => {
      const caller = appRouter.createCaller(makeUserCtx());
      await expect(call(caller)).rejects.toThrow(/FORBIDDEN|Admin|UNAUTHORIZED/);
    });
  }
});

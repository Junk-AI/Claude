import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCollaboration,
  createEvent,
  createEventRegistration,
  createEventRegistrationWithCapacity,
  createMember,
  createPastEvent,
  createResource,
  deleteCollaboration,
  deleteEvent,
  deleteMember,
  deletePastEvent,
  deletePastEventImage,
  deleteResource,
  addPastEventImage,
  getAllCollaborations,
  getAllEvents,
  getAllMembers,
  getAllMemberEmails,
  getAllPastEvents,
  getAllResources,
  getApprovedCollaborations,
  getApprovedMembers,
  getCollaborationById,
  getDistinctMemberFilters,
  getEventById,
  getEventManagementData,
  getEventQuestions,
  getEventRegistrations,
  getEventTicketCount,
  getFeaturedResources,
  getLatestUpdates,
  getPastEventById,
  getPastEventImages,
  getSpotlightMembers,
  getUpcomingEvents,
  replaceEventQuestions,
  updateCollaboration,
  updateEvent,
  updateMember,
  updatePastEvent,
  updateResource,
} from "./db";
import {
  notifyApproval,
  notifyNewCollaboration,
  notifyNewEventRegistration,
  notifyNewMember,
  notifyNewEvent,
  sendConnectionRequest,
  sendEventConfirmation,
} from "./email";
import { storagePut } from "./storage";
import { validateRegistrationAnswers } from "@shared/eventRegistration";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Connection Requests Router ──────────────────────────────────────────────
const connectionRequestsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        toMemberId: z.number(),
        requesterName: z.string().min(1),
        requesterEmail: z.string().email(),
        requesterOrganisation: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { createConnectionRequest, getMemberById } = await import("./db");
      const member = await getMemberById(input.toMemberId);
      if (!member) throw new Error("Member not found");
      
      // Insert connection request using the helper function
      // Note: fromMemberId is set to 0 since this is a public request
      // In a real scenario, this would be the authenticated user's member ID
      await createConnectionRequest({
        fromMemberId: 0, // Placeholder for public requests
        toMemberId: input.toMemberId,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterOrganisation: input.requesterOrganisation || null,
        message: input.message || null,
        purpose: null, // Purpose field for future use
        status: "sent",
      });
      
      // Send email to member - MUST use member.email, never fallback to admin email
      console.log(`[Connection Request] Member found: ${member.name}, Email: ${member.email}`);
      
      if (!member.email) {
        console.warn(`[Connection Request] Member ${member.name} (ID: ${input.toMemberId}) has no email address. Email will not be sent.`);
        return { success: true, message: "Connection request saved, but member has no email address on file." };
      }
      
      try {
        console.log(`[Connection Request] Sending email to ${member.email}`);
        await sendConnectionRequest({
          toName: member.name,
          toEmail: member.email,
          fromName: input.requesterName,
          fromEmail: input.requesterEmail,
          fromOrganisation: input.requesterOrganisation,
          message: input.message,
        });
      } catch (error) {
        console.error("Failed to send connection request email:", error);
        // Don't throw - the request was already saved
      }
      return { success: true, message: "Connection request sent successfully!" };
    }),
});

// ─── Members Router ───────────────────────────────────────────────────────────
const membersRouter = router({
  // Public: get approved members with optional filters
  list: publicProcedure
    .input(
      z.object({
        country: z.string().optional(),
        issueArea: z.string().optional(),
        memberType: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => getApprovedMembers(input)),

  // Public: get spotlight members
  spotlight: publicProcedure.query(() => getSpotlightMembers()),

  // Public: get filter options
  filterOptions: publicProcedure.query(() => getDistinctMemberFilters()),

  // Public: submit join form
  join: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        country: z.string().optional(),
        issueAreas: z.string().optional(), // JSON array string
        customCause: z.string().optional(), // Custom cause when "Other" is selected
        memberType: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email("Valid email required"),
        website: z.string().optional(),
        social: z.string().optional(),
        peopleWithCourses: z.string().optional(), // JSON array string of {name, course}
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
        pdpaConsent: z.boolean().optional(),
        pdpaDataUsage: z.boolean().optional(),
        pdpaMarketing: z.boolean().optional(),
        pdpaThirdParty: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createMember({ ...input, status: "approved", eligibleForSpotlight: false });
      await notifyNewMember(input);
      return { success: true, id, memberId: id };
    }),

  // Admin: get all members
  adminList: adminProcedure.query(() => getAllMembers()),

  // Admin: update member
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        country: z.string().optional(),
        initiativeName: z.string().optional(),
        issueAreas: z.string().optional(),
        customCause: z.string().optional(),
        memberType: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        social: z.string().optional(),
        peopleWithCourses: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        eligibleForSpotlight: z.boolean().optional(),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateMember(id, data);
      if (data.status === "approved") {
        const member = await import("./db").then((m) => m.getMemberById(id));
        if (member) await notifyApproval("Member", member.name);
      }
      return { success: true };
    }),

  // Admin: delete member
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteMember(input.id);
      return { success: true };
    }),

  // Admin: bulk CSV upload
  bulkCreate: adminProcedure
    .input(
      z.array(
        z.object({
          name: z.string().min(1),
          age: z.number().int().optional(),
          location: z.string().optional(),
          country: z.string().optional(),
          initiativeName: z.string().optional(),
          issueArea: z.string().optional(),
          memberType: z.string().optional(),
          description: z.string().optional(),
          email: z.string().email().optional(),
          social: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const results = await Promise.allSettled(
        input.map((row) => createMember({ ...row, status: "approved", eligibleForSpotlight: false }))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      return { succeeded, failed };
    }),

  // Public: upload cover image for join form
  uploadCoverImage: publicProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[uploadCoverImage] Starting:', input.fileName, 'MIME:', input.mimeType);
      const buffer = Buffer.from(input.fileBase64, 'base64');
      console.log('[uploadCoverImage] Buffer size:', buffer.length);
      const key = `covers/${Date.now()}-${input.fileName}`;
      console.log('[uploadCoverImage] Storage key:', key);
      const { url } = await storagePut(key, buffer, input.mimeType);
      console.log('[uploadCoverImage] Storage result URL:', url);
      return { url, key };
    }),

  // Admin: upload member photo
  uploadPhoto: adminProcedure
    .input(
      z.object({
        memberId: z.number(),
        fileBase64: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `members/${input.memberId}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await updateMember(input.memberId, { photoUrl: url, photoKey: key });
      return { url, key };
    }),

  // Public: get member by ID (for member portal profile)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const member = await import("./db").then((m) => m.getMemberById(input.id));
      return member;
    }),

  // Admin: get all member emails for export
  getAllEmails: adminProcedure.query(async () => {
    const emails = await getAllMemberEmails();
    return emails;
  }),
});

// ─── Collaborations Router ────────────────────────────────────────────────────
const collaborationsRouter = router({
  list: publicProcedure.query(() => getApprovedCollaborations()),

  post: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        collaborationNeeded: z.string().optional(),
        location: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email("Valid email required").optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        nature: z.string().optional(),
        skillsNeeded: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createCollaboration({ ...input, status: "pending" });
      await notifyNewCollaboration(input);
      return { success: true, id };
    }),

  adminList: adminProcedure.query(() => getAllCollaborations()),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        collaborationNeeded: z.string().optional(),
        location: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        nature: z.string().optional(),
        skillsNeeded: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCollaboration(id, data);
      if (data.status === "approved") {
        const collab = await getCollaborationById(id);
        if (collab) await notifyApproval("Collaboration", collab.title);
      }
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCollaboration(input.id);
      return { success: true };
    }),
});

// ─── Events Router ────────────────────────────────────────────────────────────
const eventQuestionInput = z.object({
  fieldKey: z.string().min(1).max(80).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Use letters, numbers, and underscores only"),
  label: z.string().min(1).max(255),
  questionType: z.enum(["text", "textarea", "email", "phone", "number", "select", "checkbox"]),
  options: z.array(z.string().min(1)).max(50).optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

const eventsRouter = router({
  upcoming: publicProcedure.query(() => getUpcomingEvents()),

  adminList: adminProcedure.query(() => getAllEvents()),

  details: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const event = await getEventById(input.id);
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      const [questions, ticketCount] = await Promise.all([
        getEventQuestions(input.id),
        getEventTicketCount(input.id),
      ]);
      return { event, questions, ticketCount };
    }),

  uploadCoverImage: adminProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        mimeType: z.string().regex(/^image\//, "An image file is required"),
        fileName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const key = `events/${Date.now()}-${safeFileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        eventDate: z.date(),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        location: z.string().optional(),
        organiser: z.string().optional(),
        contactEmail: z.string().email().optional(),
        adminNotes: z.string().optional(),
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
        capacityLimit: z.number().int().positive().optional(),
        status: z.enum(["upcoming", "past", "cancelled"]).default("upcoming"),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createEvent(input);
      await notifyNewEvent(input);
      return { success: true, id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        location: z.string().optional(),
        organiser: z.string().optional(),
        contactEmail: z.string().email().optional(),
        adminNotes: z.string().optional(),
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
        capacityLimit: z.number().int().positive().nullable().optional(),
        status: z.enum(["upcoming", "past", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateEvent(id, data);
      return { success: true };
    }),

  saveQuestions: adminProcedure
    .input(z.object({ eventId: z.number(), questions: z.array(eventQuestionInput).max(30) }))
    .mutation(async ({ input }) => {
      const fieldKeys = new Set<string>();
      for (const question of input.questions) {
        if (fieldKeys.has(question.fieldKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Duplicate question key: ${question.fieldKey}` });
        }
        fieldKeys.add(question.fieldKey);
      }
      await replaceEventQuestions(
        input.eventId,
        input.questions.map((question) => ({
          fieldKey: question.fieldKey,
          label: question.label,
          questionType: question.questionType,
          options: question.options?.length ? JSON.stringify(question.options) : null,
          isRequired: question.isRequired,
          sortOrder: question.sortOrder,
        }))
      );
      return { success: true };
    }),

  questions: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => getEventQuestions(input.eventId)),

  management: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const result = await getEventManagementData(input.eventId);
      return {
        ...result,
        registrations: result.registrations.map((registration) => ({
          ...registration,
          answers: registration.answers ? (() => {
            try { return JSON.parse(registration.answers); } catch { return {}; }
          })() : {},
        })),
      };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteEvent(input.id);
      return { success: true };
    }),

  // Backwards-compatible interest capture for older clients.
  registerInterest: publicProcedure
    .input(z.object({ eventId: z.number().optional(), name: z.string().min(1), email: z.string().email() }))
    .mutation(async ({ input }) => {
      const id = await createEventRegistration({ eventId: input.eventId ?? null, name: input.name, email: input.email });
      const eventData = input.eventId ? await getEventById(input.eventId) : null;
      const eventTitle = eventData?.title ?? "General Interest";
      await notifyNewEventRegistration({ name: input.name, email: input.email, eventTitle });
      if (eventData) {
        await sendEventConfirmation({ participantName: input.name, participantEmail: input.email, eventTitle: eventData.title, eventDate: eventData.eventDate, eventLocation: eventData.location, eventDescription: eventData.description, contactEmail: eventData.contactEmail });
      }
      return { success: true, id };
    }),

  register: publicProcedure
    .input(z.object({
      eventId: z.number(),
      name: z.string().trim().min(1, "Name is required"),
      email: z.string().trim().email("Valid email required"),
      phone: z.string().trim().min(1, "Contact number is required"),
      ticketQuantity: z.number().int().min(1).max(50),
      answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
    }))
    .mutation(async ({ input }) => {
      const event = await getEventById(input.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      const questions = await getEventQuestions(input.eventId);
      const answerErrors = validateRegistrationAnswers(questions, input.answers);
      const firstAnswerError = Object.values(answerErrors)[0];
      if (firstAnswerError) throw new TRPCError({ code: "BAD_REQUEST", message: firstAnswerError });
      const id = await createEventRegistrationWithCapacity({
        eventId: input.eventId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        ticketQuantity: input.ticketQuantity,
        answers: JSON.stringify(input.answers),
      });
      await notifyNewEventRegistration({ name: input.name, email: input.email, eventTitle: event.title });
      await sendEventConfirmation({ participantName: input.name, participantEmail: input.email, eventTitle: event.title, eventDate: event.eventDate, eventLocation: event.location, eventDescription: event.description, contactEmail: event.contactEmail });
      return { success: true, id, ticketQuantity: input.ticketQuantity };
    }),

  registrations: adminProcedure
    .input(z.object({ eventId: z.number().optional() }))
    .query(({ input }) => getEventRegistrations(input.eventId)),
});

// ─── Past Events Router ───────────────────────────────────────────────────────
const pastEventsRouter = router({
  list: publicProcedure.query(async () => {
    const events = await getAllPastEvents();
    const eventsWithImages = await Promise.all(
      events.map(async ({ photosUrl, photosPassword, ...event }) => ({
        ...event,
        hasPhotos: Boolean(photosUrl),
        photosProtected: Boolean(photosPassword),
        images: await getPastEventImages(event.id),
      }))
    );
    return eventsWithImages;
  }),

  adminList: adminProcedure.query(async () => {
    const events = await getAllPastEvents();
    return Promise.all(
      events.map(async (event) => ({
        ...event,
        images: await getPastEventImages(event.id),
      }))
    );
  }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        location: z.string().optional(),
        organiser: z.string().optional(),
        participants: z.string().optional(),
        photosUrl: z.string().url().optional().or(z.literal("")),
        photosPassword: z.string().min(4).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { photosPassword, ...data } = input;
      const id = await createPastEvent({
        ...data,
        photosPassword: photosPassword ? await bcrypt.hash(photosPassword, 10) : undefined,
      });
      return { success: true, id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        location: z.string().optional(),
        organiser: z.string().optional(),
        participants: z.string().optional(),
        photosUrl: z.string().url().optional().or(z.literal("")),
        photosPassword: z.string().min(4).max(100).optional(),
        clearPhotosPassword: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, photosPassword, clearPhotosPassword, ...data } = input;
      await updatePastEvent(id, {
        ...data,
        ...(photosPassword ? { photosPassword: await bcrypt.hash(photosPassword, 10) } : {}),
        ...(clearPhotosPassword ? { photosPassword: null } : {}),
      });
      return { success: true };
    }),

  unlockPhotos: publicProcedure
    .input(z.object({ id: z.number(), password: z.string().optional() }))
    .mutation(async ({ input }) => {
      const event = await getPastEventById(input.id);
      if (!event?.photosUrl) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photos are not available for this event." });
      }
      if (event.photosPassword) {
        const isValid = Boolean(input.password) && await bcrypt.compare(input.password!, event.photosPassword);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Wrong password" });
        }
      }
      return { photosUrl: event.photosUrl };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePastEvent(input.id);
      return { success: true };
    }),

  uploadImage: adminProcedure
    .input(
      z.object({
        pastEventId: z.number(),
        fileBase64: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `past-events/${input.pastEventId}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      const id = await addPastEventImage({
        pastEventId: input.pastEventId,
        imageUrl: url,
        imageKey: key,
        caption: input.caption,
      });
      return { success: true, id, url, key };
    }),

  deleteImage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePastEventImage(input.id);
      return { success: true };
    }),
});

// ─── Resources Router ─────────────────────────────────────────────────────────
const resourcesRouter = router({
  list: publicProcedure.query(() => getAllResources()),
  featured: publicProcedure.query(() => getFeaturedResources()),

  adminList: adminProcedure.query(() => getAllResources()),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        resourceType: z.string().optional(),
        link: z.string().url().optional().or(z.literal("")),
        featured: z.boolean().default(false),
        fileBase64: z.string().optional(),
        mimeType: z.string().optional(),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { fileBase64, mimeType, fileName, ...resourceData } = input;
      const id = await createResource(resourceData);
      
      if (fileBase64 && mimeType && fileName) {
        const buffer = Buffer.from(fileBase64, "base64");
        const key = `resources/${id}-${Date.now()}-${fileName}`;
        const { url } = await storagePut(key, buffer, mimeType);
        await updateResource(id, { fileUrl: url, fileKey: key });
      }
      
      return { success: true, id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        resourceType: z.string().optional(),
        link: z.string().optional(),
        featured: z.boolean().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateResource(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteResource(input.id);
      return { success: true };
    }),

  uploadFile: adminProcedure
    .input(
      z.object({
        resourceId: z.number(),
        fileBase64: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `resources/${input.resourceId}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await updateResource(input.resourceId, { fileUrl: url, fileKey: key });
      return { url, key };
    }),
});

// ─── Home Router ──────────────────────────────────────────────────────────────
const homeRouter = router({
  latestUpdates: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(6) }).optional())
    .query(({ input }) => getLatestUpdates(input?.limit ?? 6)),
});

// ─── Connections Admin Router ────────────────────────────────────────────────
const connectionsRouter = router({
  adminList: adminProcedure
    .query(async () => {
      const db = await import("./db").then((m) => m.getDb());
      if (!db) throw new Error("Database not available");
      const { connectionRequests } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return db.select().from(connectionRequests).orderBy(desc(connectionRequests.createdAt));
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
import { memberAuthRouter, memberEventsRouter, memberEventSignupsRouter, adminMemberAccountRouter } from "./memberAuthRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  memberAuth: memberAuthRouter,
  adminMemberAccounts: adminMemberAccountRouter,
  members: membersRouter,
  memberEvents: memberEventsRouter,
  memberEventSignups: memberEventSignupsRouter,
  connectionRequests: connectionRequestsRouter,
  connections: connectionsRouter,
  collaborations: collaborationsRouter,
  events: eventsRouter,
  pastEvents: pastEventsRouter,
  resources: resourcesRouter,
  home: homeRouter,
});

export type AppRouter = typeof appRouter;

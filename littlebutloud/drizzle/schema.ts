import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"), // For direct admin authentication
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Members ──────────────────────────────────────────────────────────────────
export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // age and location removed per user request
  country: varchar("country", { length: 100 }),
  issueAreas: text("issueAreas"), // JSON array of issue areas
  customCause: varchar("customCause", { length: 255 }), // Custom cause when "Other" is selected
  memberType: varchar("memberType", { length: 100 }),
  description: text("description"),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  social: varchar("social", { length: 500 }),
  peopleWithCourses: text("peopleWithCourses"), // JSON array of {name, course}
  photoUrl: text("photoUrl"),
  photoKey: text("photoKey"),
  coverImageUrl: text("coverImageUrl"), // Profile cover image
  coverImageKey: text("coverImageKey"),
  pdpaConsent: boolean("pdpaConsent").default(false).notNull(),
  pdpaDataUsage: boolean("pdpaDataUsage").default(false).notNull(),
  pdpaMarketing: boolean("pdpaMarketing").default(false).notNull(),
  pdpaThirdParty: boolean("pdpaThirdParty").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  eligibleForSpotlight: boolean("eligibleForSpotlight").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

// ─── Collaborations ───────────────────────────────────────────────────────────
export const collaborations = mysqlTable("collaborations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  collaborationNeeded: text("collaborationNeeded"),
  location: varchar("location", { length: 255 }),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = typeof collaborations.$inferInsert;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  startTime: varchar("startTime", { length: 10 }), // HH:MM format
  endTime: varchar("endTime", { length: 10 }), // HH:MM format
  location: varchar("location", { length: 255 }),
  organiser: varchar("organiser", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  adminNotes: text("adminNotes"),
  coverImageUrl: text("coverImageUrl"), // Event cover image
  coverImageKey: text("coverImageKey"),
  capacityLimit: int("capacityLimit"), // Maximum number of registrations
  createdByMemberId: int("createdByMemberId"), // Member/group that created this event
  eventType: mysqlEnum("eventType", ["admin", "member"]).default("admin").notNull(), // Who created it
  status: mysqlEnum("status", ["upcoming", "past", "cancelled", "pending_approval"]).default("upcoming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event Registration Questions ─────────────────────────────────────────────
export const eventQuestions = mysqlTable("event_questions", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  fieldKey: varchar("fieldKey", { length: 80 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  questionType: mysqlEnum("questionType", ["text", "textarea", "email", "phone", "number", "select", "checkbox"]).default("text").notNull(),
  options: text("options"), // JSON array for select choices
  isRequired: boolean("isRequired").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventQuestion = typeof eventQuestions.$inferSelect;
export type InsertEventQuestion = typeof eventQuestions.$inferInsert;

// ─── Event Registrations ──────────────────────────────────────────────────────
export const eventRegistrations = mysqlTable("event_registrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  ticketQuantity: int("ticketQuantity").default(1).notNull(),
  answers: text("answers"), // JSON object keyed by event question fieldKey
  confirmationSent: boolean("confirmationSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

export type EventRegistrationWithQuestions = EventRegistration & {
  answers: Record<string, unknown>;
};

// ─── Past Events ──────────────────────────────────────────────────────────────
export const pastEvents = mysqlTable("past_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate"),
  location: varchar("location", { length: 255 }),
  organiser: varchar("organiser", { length: 255 }),
  participants: text("participants"),
  photosUrl: text("photosUrl"), // Google Drive or external link to event photos
  photosPassword: varchar("photosPassword", { length: 255 }), // bcrypt hash for protected photos access
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PastEvent = typeof pastEvents.$inferSelect;
export type InsertPastEvent = typeof pastEvents.$inferInsert;

// ─── Past Event Gallery Images ────────────────────────────────────────────────
export const pastEventImages = mysqlTable("past_event_images", {
  id: int("id").autoincrement().primaryKey(),
  pastEventId: int("pastEventId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull(),
  caption: varchar("caption", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PastEventImage = typeof pastEventImages.$inferSelect;
export type InsertPastEventImage = typeof pastEventImages.$inferInsert;

// ─── Resources ────────────────────────────────────────────────────────────────
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resourceType: varchar("resourceType", { length: 100 }),
  link: text("link"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── Connection Requests ──────────────────────────────────────────────────────
export const connectionRequests = mysqlTable("connection_requests", {
  id: int("id").autoincrement().primaryKey(),
  fromMemberId: int("fromMemberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  toMemberId: int("toMemberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
  requesterOrganisation: varchar("requesterOrganisation", { length: 255 }),
  message: text("message"),
  purpose: varchar("purpose", { length: 255 }),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = typeof connectionRequests.$inferInsert;

// ─── Member Accounts (Username/Password Login) ────────────────────────────────
export const memberAccounts = mysqlTable("member_accounts", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull().unique().references(() => members.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  plainPassword: varchar("plainPassword", { length: 255 }).notNull(), // Plaintext password for admin display
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberAccount = typeof memberAccounts.$inferSelect;
export type InsertMemberAccount = typeof memberAccounts.$inferInsert;

// ─── Member Events (Created by Members in Portal) ────────────────────────────────
export const memberEvents = mysqlTable("member_events", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  startTime: varchar("startTime", { length: 10 }).notNull(),
  endTime: varchar("endTime", { length: 10 }).notNull(),
  date: timestamp("date").notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }).notNull(),
  details: text("details").notNull(),
  volunteerLimit: int("volunteerLimit").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberEvent = typeof memberEvents.$inferSelect;
export type InsertMemberEvent = typeof memberEvents.$inferInsert;

// ─── Member Event Signups ─────────────────────────────────────────────────────────
export const memberEventSignups = mysqlTable("member_event_signups", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => memberEvents.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MemberEventSignup = typeof memberEventSignups.$inferSelect;
export type InsertMemberEventSignup = typeof memberEventSignups.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["connection_request", "event_signup", "collaboration_update", "admin_message"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedId: int("relatedId"), // ID of related object (connection request, event, etc.)
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

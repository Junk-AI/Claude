import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Collaboration,
  Event,
  EventQuestion,
  EventRegistration,
  InsertCollaboration,
  InsertConnectionRequest,
  InsertEvent,
  InsertEventQuestion,
  InsertEventRegistration,
  InsertMember,
  InsertPastEvent,
  InsertPastEventImage,
  InsertResource,
  InsertUser,
  Member,
  MemberAccount,
  InsertMemberAccount,
  MemberEvent,
  InsertMemberEvent,
  MemberEventSignup,
  InsertMemberEventSignup,
  PastEvent,
  PastEventImage,
  Resource,
  collaborations,
  connectionRequests,
  eventQuestions,
  eventRegistrations,
  events,
  memberAccounts,
  memberEvents,
  memberEventSignups,
  members,
  pastEventImages,
  pastEvents,
  resources,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Members ──────────────────────────────────────────────────────────────────
export async function getApprovedMembers(filters?: {
  country?: string;
  issueArea?: string;
  memberType?: string;
}): Promise<Member[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(members.status, "approved")];
  if (filters?.country) conditions.push(eq(members.country, filters.country));
  if (filters?.memberType) conditions.push(eq(members.memberType, filters.memberType));
  // Note: issueArea filtering is done client-side due to JSON array storage
  const allMembers = await db.select().from(members).where(and(...conditions)).orderBy(desc(members.createdAt));
  if (!filters?.issueArea) return allMembers;
  return allMembers.filter((m) => {
    const areas = m.issueAreas ? JSON.parse(m.issueAreas) : [];
    return areas.includes(filters.issueArea);
  });
}

export async function getSpotlightMembers(): Promise<Member[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(members)
    .where(and(eq(members.status, "approved"), eq(members.eligibleForSpotlight, true)))
    .orderBy(desc(members.createdAt));
}

export async function getAllMembers(): Promise<Member[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(desc(members.createdAt));
}

export async function getMemberById(id: number): Promise<Member | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function getAllMemberEmails(): Promise<Array<{ id: number; name: string; email: string }>> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: members.id,
    name: members.name,
    email: members.email,
  }).from(members).where(eq(members.status, "approved")).orderBy(asc(members.name));
  return result.filter((m): m is { id: number; name: string; email: string } => !!m.email);
}

export async function createMember(data: InsertMember): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(members).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateMember(id: number, data: Partial<InsertMember>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set(data).where(eq(members.id, id));
}

export async function deleteMember(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all connection requests related to this member (both as sender and recipient)
  await db.delete(connectionRequests).where(
    sql`${connectionRequests.fromMemberId} = ${id} OR ${connectionRequests.toMemberId} = ${id}`
  );
  
  // Delete the member
  await db.delete(members).where(eq(members.id, id));
}

export async function getDistinctMemberFilters() {
  const db = await getDb();
  if (!db) return { countries: [], issueAreas: [], memberTypes: [] };
  const rows = await db
    .select({ country: members.country, issueAreas: members.issueAreas, memberType: members.memberType })
    .from(members)
    .where(eq(members.status, "approved"));
  const countries = Array.from(new Set(rows.map((r) => r.country).filter(Boolean))) as string[];
  const issueAreas = Array.from(new Set(
    rows
      .flatMap((r) => r.issueAreas ? JSON.parse(r.issueAreas) : [])
      .filter(Boolean)
  )) as string[];
  const memberTypes = Array.from(new Set(rows.map((r) => r.memberType).filter(Boolean))) as string[];
  return { countries, issueAreas, memberTypes };
}

// ─── Collaborations ───────────────────────────────────────────────────────────
export async function getApprovedCollaborations(): Promise<Collaboration[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collaborations).where(eq(collaborations.status, "approved")).orderBy(desc(collaborations.createdAt));
}

export async function getAllCollaborations(): Promise<Collaboration[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collaborations).orderBy(desc(collaborations.createdAt));
}

export async function getCollaborationById(id: number): Promise<Collaboration | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1);
  return result[0];
}

export async function createCollaboration(data: InsertCollaboration): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(collaborations).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateCollaboration(id: number, data: Partial<InsertCollaboration>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(collaborations).set(data).where(eq(collaborations.id, id));
}

export async function deleteCollaboration(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collaborations).where(eq(collaborations.id, id));
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function getUpcomingEvents(): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.status, "upcoming")).orderBy(events.eventDate);
}

export async function getAllEvents(): Promise<(Event & { eventRegistrations?: EventRegistration[] })[]> {
  const db = await getDb();
  if (!db) return [];
  const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
  
  // Fetch registrations for each event
  const eventsWithRegistrations = await Promise.all(
    allEvents.map(async (event) => {
      const registrations = await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, event.id));
      return { ...event, eventRegistrations: registrations };
    })
  );
  
  return eventsWithRegistrations;
}

export async function getEventById(id: number): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: InsertEvent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ─── Event Registrations ──────────────────────────────────────────────────────
export async function createEventRegistration(data: InsertEventRegistration): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eventRegistrations).values(data);
  return (result[0] as any).insertId as number;
}

export async function getEventRegistrations(eventId?: number): Promise<EventRegistration[]> {
  const db = await getDb();
  if (!db) return [];
  if (eventId) {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId)).orderBy(desc(eventRegistrations.createdAt));
  }
  return db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.createdAt));
}

export async function getEventQuestions(eventId: number): Promise<EventQuestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(eventQuestions)
    .where(eq(eventQuestions.eventId, eventId))
    .orderBy(asc(eventQuestions.sortOrder), asc(eventQuestions.id));
}

export async function replaceEventQuestions(eventId: number, questions: Omit<InsertEventQuestion, "eventId">[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(eventQuestions).where(eq(eventQuestions.eventId, eventId));
  if (questions.length > 0) {
    await db.insert(eventQuestions).values(questions.map((question) => ({ ...question, eventId })));
  }
}

export async function getEventTicketCount(eventId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${eventRegistrations.ticketQuantity}), 0)` })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, eventId));
  return Number(result[0]?.total ?? 0);
}

export async function createEventRegistrationWithCapacity(data: InsertEventRegistration): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const event = await getEventById(data.eventId ?? 0);
  if (!event) throw new Error("Event not found");
  const ticketQuantity = Number(data.ticketQuantity ?? 1);
  const ticketCount = await getEventTicketCount(event.id);
  if (event.capacityLimit !== null && event.capacityLimit !== undefined && ticketCount + ticketQuantity > event.capacityLimit) {
    throw new Error(`Only ${Math.max(event.capacityLimit - ticketCount, 0)} ticket${Math.max(event.capacityLimit - ticketCount, 0) === 1 ? "" : "s"} remaining`);
  }
  const result = await db.insert(eventRegistrations).values({ ...data, ticketQuantity });
  return (result[0] as any).insertId as number;
}

export async function getEventManagementData(eventId: number) {
  const [questions, registrations, ticketCount] = await Promise.all([
    getEventQuestions(eventId),
    getEventRegistrations(eventId),
    getEventTicketCount(eventId),
  ]);
  return { questions, registrations, ticketCount };
}

// ─── Past Events ──────────────────────────────────────────────────────────────
export async function getAllPastEvents(): Promise<PastEvent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pastEvents).orderBy(desc(pastEvents.eventDate));
}

export async function getPastEventById(id: number): Promise<PastEvent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pastEvents).where(eq(pastEvents.id, id)).limit(1);
  return result[0];
}

export async function createPastEvent(data: InsertPastEvent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pastEvents).values(data);
  return (result[0] as any).insertId as number;
}

export async function updatePastEvent(id: number, data: Partial<InsertPastEvent>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pastEvents).set(data).where(eq(pastEvents.id, id));
}

export async function deletePastEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pastEvents).where(eq(pastEvents.id, id));
}

export async function getPastEventImages(pastEventId: number): Promise<PastEventImage[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pastEventImages).where(eq(pastEventImages.pastEventId, pastEventId)).orderBy(pastEventImages.createdAt);
}

export async function addPastEventImage(data: InsertPastEventImage): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pastEventImages).values(data);
  return (result[0] as any).insertId as number;
}

export async function deletePastEventImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pastEventImages).where(eq(pastEventImages.id, id));
}

// ─── Resources ────────────────────────────────────────────────────────────────
export async function getAllResources(): Promise<Resource[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(desc(resources.createdAt));
}

export async function getFeaturedResources(): Promise<Resource[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.featured, true)).orderBy(desc(resources.createdAt)).limit(4);
}

export async function getResourceById(id: number): Promise<Resource | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result[0];
}

export async function createResource(data: InsertResource): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(resources).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateResource(id: number, data: Partial<InsertResource>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(resources).set(data).where(eq(resources.id, id));
}

export async function deleteResource(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(resources).where(eq(resources.id, id));
}

// ─── Connection Requests ────────────────────────────────────────────────────────
export async function createConnectionRequest(data: Omit<InsertConnectionRequest, 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  // Use Drizzle's insert method to properly handle the insert
  const result = await db.insert(connectionRequests).values({
    ...data,
    createdAt: now,
    updatedAt: now,
  } as InsertConnectionRequest);
  
  return (result[0] as any).insertId as number;
}

// ─── Latest Updates ───────────────────────────────────────────────────────────
export async function getLatestUpdates(limit = 6) {
  const db = await getDb();
  if (!db) return [];

  const [latestEvents, latestCollabs, latestMembers] = await Promise.all([
    db.select().from(events).where(eq(events.status, "upcoming")).orderBy(desc(events.createdAt)).limit(limit),
    db.select().from(collaborations).where(eq(collaborations.status, "approved")).orderBy(desc(collaborations.createdAt)).limit(limit),
    db.select().from(members).where(eq(members.status, "approved")).orderBy(desc(members.createdAt)).limit(limit),
  ]);

  const updates = [
    ...latestEvents.map((e) => ({ type: "event" as const, id: e.id, title: e.title, description: e.description, date: e.createdAt })),
    ...latestCollabs.map((c) => ({ type: "collaboration" as const, id: c.id, title: c.title, description: c.description, date: c.createdAt })),
    ...latestMembers.map((m) => ({ type: "member" as const, id: m.id, title: m.name, description: m.description, date: m.createdAt })),
  ];

  return updates.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}


// ─── Member Accounts (Username/Password) ──────────────────────────────────────
export async function createMemberAccount(data: InsertMemberAccount): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memberAccounts).values(data);
  return (result[0] as any).insertId as number;
}

export async function getMemberAccountByUsername(username: string): Promise<MemberAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memberAccounts).where(eq(memberAccounts.username, username)).limit(1);
  return result[0];
}

export async function getMemberAccountByMemberId(memberId: number): Promise<MemberAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memberAccounts).where(eq(memberAccounts.memberId, memberId)).limit(1);
  return result[0];
}

// ─── Member Events ────────────────────────────────────────────────────────────
export async function createMemberEvent(data: InsertMemberEvent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memberEvents).values(data);
  return (result[0] as any).insertId as number;
}

export async function getMemberEventsByMemberId(memberId: number): Promise<MemberEvent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberEvents).where(eq(memberEvents.memberId, memberId)).orderBy(desc(memberEvents.createdAt));
}

export async function getMemberEventById(eventId: number): Promise<MemberEvent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memberEvents).where(eq(memberEvents.id, eventId)).limit(1);
  return result[0];
}

export async function updateMemberEvent(id: number, data: Partial<InsertMemberEvent>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(memberEvents).set(data).where(eq(memberEvents.id, id));
}

export async function deleteMemberEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memberEvents).where(eq(memberEvents.id, id));
}

// ─── Member Event Signups ─────────────────────────────────────────────────────
export async function createMemberEventSignup(data: InsertMemberEventSignup): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memberEventSignups).values(data);
  return (result[0] as any).insertId as number;
}

export async function getMemberEventSignupsByEventId(eventId: number): Promise<MemberEventSignup[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberEventSignups).where(eq(memberEventSignups.eventId, eventId)).orderBy(desc(memberEventSignups.createdAt));
}

export async function deleteMemberEventSignup(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memberEventSignups).where(eq(memberEventSignups.id, id));
}


export async function updateMemberAccountPassword(memberId: number, passwordHash: string, plainPassword?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { passwordHash };
  if (plainPassword) updateData.plainPassword = plainPassword;
  await db.update(memberAccounts)
    .set(updateData)
    .where(eq(memberAccounts.memberId, memberId));
  return true;
}

export async function updateMemberAccountUsername(memberId: number, newUsername: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(memberAccounts)
    .set({ username: newUsername })
    .where(eq(memberAccounts.memberId, memberId));
  return true;
}

export async function getAllMemberAccounts(): Promise<(MemberAccount & { memberName?: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const accounts = await db.select().from(memberAccounts);
  
  // Fetch member names for each account
  const accountsWithNames = await Promise.all(
    accounts.map(async (account) => {
      const member = await getMemberById(account.memberId);
      return {
        ...account,
        memberName: member?.name,
      };
    })
  );
  
  return accountsWithNames;
}

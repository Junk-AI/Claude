import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { memberAccounts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

describe("Admin Account Management", () => {
  let db: any;
  let testMemberId = 999;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      await db.delete(memberAccounts).where(eq(memberAccounts.memberId, testMemberId));
    }
  });

  it("should create a member account with plainPassword", async () => {
    const testPassword = "TestPassword123";
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Insert test account
    await db.insert(memberAccounts).values({
      memberId: testMemberId,
      username: "testuser",
      passwordHash,
      plainPassword: testPassword,
    });

    // Verify it was stored
    const account = await db.select().from(memberAccounts).where(eq(memberAccounts.memberId, testMemberId));
    expect(account).toHaveLength(1);
    expect(account[0].plainPassword).toBe(testPassword);
    expect(account[0].username).toBe("testuser");
  });

  it("should update password with plainPassword", async () => {
    const newPassword = "NewPassword456";
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.update(memberAccounts)
      .set({ passwordHash: newPasswordHash, plainPassword: newPassword })
      .where(eq(memberAccounts.memberId, testMemberId));

    // Verify update
    const account = await db.select().from(memberAccounts).where(eq(memberAccounts.memberId, testMemberId));
    expect(account[0].plainPassword).toBe(newPassword);
    expect(account[0].passwordHash).toBe(newPasswordHash);
  });

  it("should update username", async () => {
    const newUsername = "updateduser";

    // Update username
    await db.update(memberAccounts)
      .set({ username: newUsername })
      .where(eq(memberAccounts.memberId, testMemberId));

    // Verify update
    const account = await db.select().from(memberAccounts).where(eq(memberAccounts.memberId, testMemberId));
    expect(account[0].username).toBe(newUsername);
  });

  it("should retrieve plainPassword for display", async () => {
    const account = await db.select().from(memberAccounts).where(eq(memberAccounts.memberId, testMemberId));
    
    // This is what the admin panel should display
    expect(account[0].plainPassword).toBeDefined();
    expect(account[0].plainPassword).not.toBeNull();
    expect(typeof account[0].plainPassword).toBe("string");
  });
});

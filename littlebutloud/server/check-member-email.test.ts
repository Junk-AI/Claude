import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { members } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Check Member Email", () => {
  it("should verify Test123 has an email address", async () => {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      expect(db).toBeDefined();
      return;
    }

    const result = await db
      .select()
      .from(members)
      .where(eq(members.name, "Test123"))
      .limit(1);

    console.log("\n=== Test123 Member Details ===");
    console.log("Result length:", result.length);
    
    if (result.length > 0) {
      const member = result[0];
      console.log("ID:", member.id);
      console.log("Name:", member.name);
      console.log("Email:", member.email);
      console.log("Email type:", typeof member.email);
      console.log("Email is null:", member.email === null);
      console.log("Email is undefined:", member.email === undefined);
      console.log("Email is empty string:", member.email === "");
      
      if (!member.email) {
        console.error("\n❌ ERROR: Test123 has NO email address!");
        console.error("This is why connection request emails are not being sent.");
        console.error("The router checks 'if (member.email)' and skips email sending if it's null/empty.");
      } else {
        console.log("\n✅ SUCCESS: Test123 has email:", member.email);
      }
    } else {
      console.error("Test123 member not found!");
    }

    expect(result.length).toBeGreaterThan(0);
    if (result.length > 0) {
      expect(result[0].email).toBeTruthy();
    }
  });
});

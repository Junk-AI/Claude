import { getDb } from "../server/db.ts";
import { memberAccounts } from "../drizzle/schema.ts";
import { isNull } from "drizzle-orm";
import bcrypt from "bcrypt";

async function populatePlainPasswords() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  try {
    // Find all accounts with NULL plainPassword
    const accountsWithoutPlainPassword = await db
      .select()
      .from(memberAccounts)
      .where(isNull(memberAccounts.plainPassword));

    console.log(`Found ${accountsWithoutPlainPassword.length} accounts without plainPassword`);

    if (accountsWithoutPlainPassword.length === 0) {
      console.log("All accounts already have plainPassword set");
      process.exit(0);
    }

    // For each account, generate a new temporary password
    for (const account of accountsWithoutPlainPassword) {
      // Generate a random password
      const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Update the account
      await db
        .update(memberAccounts)
        .set({
          plainPassword: tempPassword,
          passwordHash: passwordHash,
        })
        .where(memberAccounts.id === account.id);

      console.log(`Updated account ${account.memberId} (${account.username}) with temp password`);
    }

    console.log("✅ Successfully populated plainPassword for all accounts");
    process.exit(0);
  } catch (error) {
    console.error("Error populating plainPassword:", error);
    process.exit(1);
  }
}

populatePlainPasswords();

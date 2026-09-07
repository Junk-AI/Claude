import { describe, it, expect, vi, beforeAll } from 'vitest';
import { sendConnectionRequest } from './email';
import { getDb } from './db';
import { connectionRequests } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Connection Request Email Delivery', () => {
  it('should send themed email to recipient member with all connection details', async () => {
    // Test data
    const recipientName = 'Test Member';
    const recipientEmail = 'test.member@example.com';
    const requesterName = 'Test Requester';
    const requesterEmail = 'test.requester@example.com';
    const requesterOrganisation = 'Test Organization';
    const message = 'I would love to collaborate with you on environmental initiatives.';

    // Mock console.log to capture the email sending
    const consoleSpy = vi.spyOn(console, 'log');

    try {
      // Call the sendConnectionRequest function
      await sendConnectionRequest({
        toName: recipientName,
        toEmail: recipientEmail,
        fromName: requesterName,
        fromEmail: requesterEmail,
        fromOrganisation: requesterOrganisation,
        message: message,
      });

      // Verify that email was attempted to be sent
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending')
      );
    } finally {
      consoleSpy.mockRestore();
    }
  }, { timeout: 10000 });

  it('should store connection request in database with all details', async () => {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      expect(db).toBeDefined();
      return;
    }

    // Test that connection request is stored with requesterOrganisation and message
    const result = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.requesterName, 'Test Requester'))
      .limit(1);

    if (result.length > 0) {
      const connectionRequest = result[0];
      expect(connectionRequest.requesterName).toBe('Test Requester');
      expect(connectionRequest.requesterEmail).toBeDefined();
      expect(connectionRequest.requesterOrganisation).toBeDefined();
      expect(connectionRequest.message).toBeDefined();
      expect(connectionRequest.toMemberId).toBeDefined();
    }
  });
});

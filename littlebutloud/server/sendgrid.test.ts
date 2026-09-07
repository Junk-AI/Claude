import { describe, it, expect, beforeAll } from "vitest";
import { ENV } from "./_core/env";

describe("SendGrid Email Integration", () => {
  beforeAll(() => {
    console.log("[Test] SendGrid API Key configured:", !!ENV.sendgridApiKey);
  });

  it("should have SendGrid API key configured", () => {
    expect(ENV.sendgridApiKey).toBeTruthy();
  });

  it("should have valid SendGrid API key format", () => {
    if (!ENV.sendgridApiKey) {
      console.log("[Test] Skipping SendGrid format test - no API key configured");
      expect(true).toBe(true);
      return;
    }

    // SendGrid API keys start with "SG." and are typically 69 characters long
    expect(ENV.sendgridApiKey).toMatch(/^SG\./);
    expect(ENV.sendgridApiKey.length).toBeGreaterThan(50);
  });

  it("should have sendEmail function exported", async () => {
    const { sendEmail } = await import("./email");
    expect(typeof sendEmail).toBe("function");
  });

  it("should have getEmailQueue function exported", async () => {
    const { getEmailQueue } = await import("./email");
    expect(typeof getEmailQueue).toBe("function");
  });

  it("should return empty email queue with SendGrid integration", async () => {
    const { getEmailQueue } = await import("./email");
    const queue = getEmailQueue();
    expect(Array.isArray(queue)).toBe(true);
    expect(queue.length).toBe(0);
  });
});

import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";
import sgMail from "@sendgrid/mail";

export const ADMIN_EMAIL = "app.networkofdeedsbykids@gmail.com";

// Initialize SendGrid with API key if available
if (ENV.sendgridApiKey) {
  sgMail.setApiKey(ENV.sendgridApiKey);
  console.log("[Email] SendGrid initialized with API key");
} else {
  console.warn("[Email] SendGrid API key not configured");
}

/**
 * Send an email directly to a recipient using SendGrid
 */
export async function sendEmail(data: {
  to: string;
  subject: string;
  htmlContent: string;
}): Promise<boolean> {
  try {
    if (!ENV.sendgridApiKey) {
      console.error("[Email] SendGrid API key not configured");
      return false;
    }

    console.log("[Email] Sending email via SendGrid to:", data.to);
    console.log("[Email] Subject:", data.subject);

    const msg = {
      to: data.to,
      from: ADMIN_EMAIL,
      subject: data.subject,
      html: data.htmlContent,
    };

    const response = await sgMail.send(msg);
    console.log(`[Email] Successfully sent email to ${data.to}`);
    console.log("[Email] SendGrid response:", response[0].statusCode);
    return true;
  } catch (err: any) {
    console.error("[Email] Error sending email via SendGrid:");
    console.error("[Email] Error message:", err?.message);
    console.error("[Email] Error code:", err?.code);
    if (err?.response?.body?.errors) {
      console.error("[Email] SendGrid errors:", err.response.body.errors);
    }
    return false;
  }
}

/**
 * Get the current email queue (for debugging/admin purposes)
 * Note: Email queue is no longer used with SendGrid integration
 */
export function getEmailQueue() {
  return [];
}

/**
 * Send an admin notification via the built-in notification system.
 * Notifications are delivered to the platform owner (littlebutloud.kids@gmail.com).
 * Failures are logged but do not block the main operation.
 */
export async function sendAdminNotification(title: string, content: string): Promise<void> {
  try {
    await notifyOwner({ title, content });
  } catch (err) {
    console.error("[Email] Failed to send admin notification:", err);
  }
}

export async function notifyNewMember(data: {
  name: string;
  age?: number | null;
  location?: string | null;
  country?: string | null;
  initiativeName?: string | null;
  issueArea?: string | null;
  memberType?: string | null;
  description?: string | null;
  email?: string | null;
  social?: string | null;
}) {
  const content = `
New member application received on Deeds By Kids.

Name: ${data.name}
Age: ${data.age ?? "Not provided"}
Location: ${data.location ?? "Not provided"}
Country: ${data.country ?? "Not provided"}
Initiative: ${data.initiativeName ?? "Not provided"}
Issue Area: ${data.issueArea ?? "Not provided"}
Member Type: ${data.memberType ?? "Not provided"}
Description: ${data.description ?? "Not provided"}
Email: ${data.email ?? "Not provided"}
Social: ${data.social ?? "Not provided"}

This submission is pending review. Please log in to the admin panel to approve or reject.
Admin panel: /admin
Admin email: ${ADMIN_EMAIL}
  `.trim();

  await sendAdminNotification("🌟 New Member Application — Deeds By Kids", content);
}

export async function notifyNewCollaboration(data: {
  title: string;
  description?: string | null;
  collaborationNeeded?: string | null;
  location?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
}) {
  const content = `
New collaboration opportunity posted on Deeds By Kids.

Title: ${data.title}
Description: ${data.description ?? "Not provided"}
Collaboration Needed: ${data.collaborationNeeded ?? "Not provided"}
Location: ${data.location ?? "Not provided"}
Contact Name: ${data.contactName ?? "Not provided"}
Contact Email: ${data.contactEmail ?? "Not provided"}

This submission is pending review. Please log in to the admin panel to approve or reject.
Admin panel: /admin
Admin email: ${ADMIN_EMAIL}
  `.trim();

  await sendAdminNotification("🤝 New Collaboration Post — Deeds By Kids", content);
}

export async function notifyNewEventRegistration(data: {
  name: string;
  email: string;
  eventTitle?: string;
}) {
  const content = `
New event registration interest received on Deeds By Kids.

Name: ${data.name}
Email: ${data.email}
Event: ${data.eventTitle ?? "General Interest"}

Please log in to the admin panel to view all registrations.
Admin panel: /admin
Admin email: ${ADMIN_EMAIL}
  `.trim();

  // Send notification to admin via platform
  await sendAdminNotification("📅 New Event Registration — Deeds By Kids", content);
  
  // Also send email to network email
  const htmlContent = `
    <h2>New Event Registration</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Event:</strong> ${data.eventTitle ?? "General Interest"}</p>
    <p>View in <a href="/admin">Admin Panel</a></p>
  `;
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `📅 New Event Registration — ${data.eventTitle ?? "General Interest"}`,
    htmlContent,
  });
}

export async function notifyApproval(type: string, title: string, details?: string) {
  const content = `
An item has been approved on Deeds By Kids and is now publicly visible.

Type: ${type}
Title/Name: ${title}
${details ? `\nDetails:\n${details}` : ""}

Admin email: ${ADMIN_EMAIL}
  `.trim();

  await sendAdminNotification(`✅ Approved: ${title} — Deeds By Kids`, content);
}

export async function notifyNewEvent(data: {
  title: string;
  description?: string | null;
  eventDate?: Date | null;
  location?: string | null;
  organiser?: string | null;
}) {
  const content = `
A new event has been created on Deeds By Kids.

Title: ${data.title}
Date: ${data.eventDate ? new Date(data.eventDate).toLocaleDateString() : "Not provided"}
Location: ${data.location ?? "Not provided"}
Organiser: ${data.organiser ?? "Not provided"}
Description: ${data.description ?? "Not provided"}

Admin email: ${ADMIN_EMAIL}
  `.trim();

  await sendAdminNotification("📣 New Event Created — Deeds By Kids", content);
}

export async function sendConnectionRequest(data: {
  toName: string;
  toEmail: string;
  fromName: string;
  fromEmail: string;
  fromOrganisation?: string | null;
  message?: string | null;
}) {
  try {
    // Send admin notification
    const adminContent = `
Connection request received:

To: ${data.toName} (${data.toEmail})
From: ${data.fromName}${data.fromOrganisation ? ` (${data.fromOrganisation})` : ""}
Email: ${data.fromEmail}
${data.message ? `\nMessage:\n${data.message}` : ""}

Please forward this to the recipient or they can reach out directly.
    `.trim();
    
    await sendAdminNotification(`🔗 Connection Request: ${data.fromName} → ${data.toName}`, adminContent);
    
    // Create themed HTML email for recipient
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connection Request - Deeds By Kids</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .request-details {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            margin: 12px 0;
            font-size: 14px;
        }
        .detail-label {
            font-weight: 600;
            color: #667eea;
            display: inline-block;
            width: 120px;
        }
        .detail-value {
            color: #333;
        }
        .message-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
        }
        .message-box p {
            margin: 0;
            font-size: 14px;
            color: #333;
        }
        .cta-section {
            margin: 30px 0;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔗 New Connection Request</h1>
            <p>Someone wants to collaborate with you on Deeds By Kids</p>
        </div>
        <div class="content">
            <div class="greeting">
                <p>Hi <strong>${data.toName}</strong>,</p>
                <p>You've received a new connection request from someone interested in collaborating with you!</p>
            </div>
            <div class="request-details">
                <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value"><strong>${data.fromName}</strong></span>
                </div>
                ${data.fromOrganisation ? `
                <div class="detail-row">
                    <span class="detail-label">Organisation:</span>
                    <span class="detail-value">${data.fromOrganisation}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value"><a href="mailto:${data.fromEmail}" style="color: #667eea; text-decoration: none;">${data.fromEmail}</a></span>
                </div>
            </div>
            ${data.message ? `
            <div class="message-box">
                <p><strong>Their Message:</strong></p>
                <p style="margin-top: 10px; white-space: pre-wrap;">${data.message}</p>
            </div>
            ` : ''}
            <div class="cta-section">
                <p style="margin-bottom: 15px; color: #666;">Ready to connect? Reach out directly:</p>
                <a href="mailto:${data.fromEmail}" class="cta-button">Reply to ${data.fromName}</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                This is a great opportunity to expand your network and explore collaboration possibilities. We encourage you to reach out and learn more about what they're working on!
            </p>
        </div>
        <div class="footer">
            <p><strong>Deeds By Kids</strong> — Connecting young changemakers, creating change through collaboration</p>
            <p>© 2026 Little But Loud. All rights reserved.</p>
            <p><a href="mailto:littlebutloud.kids@gmail.com" style="color: #667eea; text-decoration: none;">littlebutloud.kids@gmail.com</a></p>
        </div>
    </div>
</body>
</html>
    `.trim();
    
    // Send themed HTML email to recipient
    console.log(`[Email] Sending connection request email to: ${data.toEmail}`);
    const emailSent = await sendEmail({
      to: data.toEmail,
      subject: `🔗 New Connection Request from ${data.fromName} - Deeds By Kids`,
      htmlContent,
    });

    if (!emailSent) {
      console.warn(`[Email] Failed to send connection request email to ${data.toEmail}`);
    } else {
      console.log(`[Email] Successfully sent connection request email to ${data.toEmail}`);
    }
  } catch (err) {
    console.error("[Email] Failed to send connection request:", err);
  }
}

export async function sendEventConfirmation(data: {
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventDate: Date | string;
  eventLocation?: string | null;
  eventDescription?: string | null;
  contactEmail?: string | null;
}) {
  try {
    const adminContent = `
Event confirmation for: ${data.participantName} (${data.participantEmail})

Event: ${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()} at ${new Date(data.eventDate).toLocaleTimeString()}
Location: ${data.eventLocation ?? "TBA"}

${data.eventDescription ? `Description:\n${data.eventDescription}\n` : ""}

Contact: ${data.contactEmail ?? "Not provided"}
    `.trim();
    
    await sendAdminNotification(`📧 Event Registration Confirmed: ${data.eventTitle}`, adminContent);
    
    // Send participant confirmation via SendGrid
    const eventDate = new Date(data.eventDate);
    const participantHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Confirmation - Deeds By Kids</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .event-details { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { margin: 12px 0; font-size: 14px; }
        .detail-label { font-weight: 600; color: #667eea; display: inline-block; width: 100px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Event Confirmation</h1>
            <p>You are registered for ${data.eventTitle}</p>
        </div>
        <div class="content">
            <p>Hi <strong>${data.participantName}</strong>,</p>
            <p>Thank you for registering for our event! We are excited to have you join us.</p>
            <div class="event-details">
                <div class="detail-row"><span class="detail-label">Event:</span> <strong>${data.eventTitle}</strong></div>
                <div class="detail-row"><span class="detail-label">Date:</span> ${eventDate.toLocaleDateString()}</div>
                <div class="detail-row"><span class="detail-label">Time:</span> ${eventDate.toLocaleTimeString()}</div>
                ${data.eventLocation ? `<div class="detail-row"><span class="detail-label">Location:</span> ${data.eventLocation}</div>` : ""}
            </div>
            ${data.eventDescription ? `<p><strong>About the event:</strong></p><p>${data.eventDescription}</p>` : ""}
            <p>If you have any questions, please reach out to: <a href="mailto:${data.contactEmail || "littlebutloud.kids@gmail.com"}" style="color: #667eea; text-decoration: none;">${data.contactEmail || "littlebutloud.kids@gmail.com"}</a></p>
            <p>We look forward to seeing you there!</p>
        </div>
        <div class="footer">
            <p><strong>Deeds By Kids</strong> — Connecting young changemakers, creating change through collaboration</p>
        </div>
    </div>
</body>
</html>
    `.trim();
    
    console.log(`[Email] Sending event confirmation to participant: ${data.participantEmail}`);
    const confirmationSent = await sendEmail({
      to: data.participantEmail,
      subject: `Event Confirmation: ${data.eventTitle} - Deeds By Kids`,
      htmlContent: participantHtml,
    });
    
    if (!confirmationSent) {
      console.warn(`[Email] Failed to send event confirmation to ${data.participantEmail}`);
    } else {
      console.log(`[Email] Successfully sent event confirmation to ${data.participantEmail}`);
    }
  } catch (err) {
    console.error("[Email] Failed to send event confirmation:", err);
  }
}

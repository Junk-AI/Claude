
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import bcrypt from "bcrypt";
import {
  createMemberAccount,
  getMemberAccountByUsername,
  getMemberAccountByMemberId,
  getMemberById,
  createMemberEvent,
  getMemberEventsByMemberId,
  getMemberEventById,
  getMemberEventSignupsByEventId,
  createMemberEventSignup,
  updateMemberEvent,
  deleteMemberEvent,
  getAllMembers,
  updateMemberAccountPassword,
  getAllMemberAccounts,
} from "./db";

// ─── Member Authentication Router ─────────────────────────────────────────────
export const memberAuthRouter = router({
  // Create member account (username/password) after signup
  createAccount: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify member exists
        const member = await getMemberById(input.memberId);
        if (!member) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
        }

        // Check if account already exists
        const existingAccount = await getMemberAccountByMemberId(input.memberId);
        if (existingAccount) {
          throw new TRPCError({ code: "CONFLICT", message: "Account already exists for this member" });
        }

        // Check if username is already taken
        const existingUsername = await getMemberAccountByUsername(input.username);
        if (existingUsername) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(input.password, saltRounds);

        // Create account
        const accountId = await createMemberAccount({
          memberId: input.memberId,
          username: input.username,
          passwordHash: passwordHash,
          plainPassword: input.password,
        });

        return { success: true, accountId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create account" });
      }
    }),

  // Login with username/password
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Find account by username
        const account = await getMemberAccountByUsername(input.username);
        if (!account) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(input.password, account.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }

        // Get member details
        const member = await getMemberById(account.memberId);
        if (!member) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
        }

        // Return member info (don't return password hash)
        return {
          success: true,
          memberId: member.id,
          username: account.username,
          memberName: member.name,
          email: member.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Login failed" });
      }
    }),

  // Member changes their own password (using member ID from localStorage)
  memberChangePassword: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get member's account
        const account = await getMemberAccountByMemberId(input.memberId);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(input.currentPassword, account.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

        // Update password with both hash and plaintext
        const success = await updateMemberAccountPassword(input.memberId, newPasswordHash, input.newPassword);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update password" });
        }

        return { success: true, message: "Password changed successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to change password" });
      }
    }),

  // Admin changes their own password (using admin user ID from OAuth)
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get member's account
        const account = await getMemberAccountByMemberId(ctx.user.id);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(input.currentPassword, account.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

        // Update password
        const success = await updateMemberAccountPassword(ctx.user.id, newPasswordHash, input.newPassword);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update password" });
        }

        return { success: true, message: "Password changed successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to change password" });
      }
    }),
});

// ─── Member Events Router ─────────────────────────────────────────────────────
export const memberEventsRouter = router({
  // Create a new event
  create: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        name: z.string().min(1, "Event name is required"),
        venue: z.string().min(1, "Venue is required"),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM format"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM format"),
        date: z.date(),
        contactPerson: z.string().min(1, "Contact person is required"),
        details: z.string().min(1, "Event details are required"),
        volunteerLimit: z.number().int().positive("Volunteer limit must be positive"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify member exists
        const member = await getMemberById(input.memberId);
        if (!member) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
        }

        // Create event
        const eventId = await createMemberEvent({
          memberId: input.memberId,
          name: input.name,
          venue: input.venue,
          startTime: input.startTime,
          endTime: input.endTime,
          date: input.date,
          contactPerson: input.contactPerson,
          details: input.details,
          volunteerLimit: input.volunteerLimit,
        });

        return { success: true, eventId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create event" });
      }
    }),

  // Get all events (public discovery for Collaborate tab)
  getAll: publicProcedure.query(async () => {
    try {
      const members = await getAllMembers();
      const allEvents: any[] = [];
      
      for (const member of members) {
        try {
          const events = await getMemberEventsByMemberId(member.id);
          allEvents.push(...events.map((e: any) => ({
            ...e,
            memberName: member.name,
            memberId: member.id,
          })));
        } catch (err) {
          // Silently continue if member has no events
        }
      }
      
      return allEvents;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch events" });
    }
  }),

  // Get all events created by a member
  getByMemberId: publicProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ input }) => {
      try {
        const events = await getMemberEventsByMemberId(input.memberId);
        return events;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch events" });
      }
    }),

  // Get event details by ID
  getById: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      try {
        const event = await getMemberEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }
        return event;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch event" });
      }
    }),

  // Get signups for an event (member-only)
  getSignups: publicProcedure
    .input(z.object({ eventId: z.number(), memberId: z.number() }))
    .query(async ({ input }) => {
      try {
        // Verify event exists and belongs to member
        const event = await getMemberEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }

        // Verify member owns this event
        if (event.memberId !== input.memberId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only view signups for your own events" });
        }

        // Get signups
        const signups = await getMemberEventSignupsByEventId(input.eventId);
        return signups;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch signups" });
      }
    }),

  // Update event
  update: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        memberId: z.number(),
        name: z.string().optional(),
        venue: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        date: z.date().optional(),
        contactPerson: z.string().optional(),
        details: z.string().optional(),
        volunteerLimit: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify event exists and belongs to member
        const event = await getMemberEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }

        if (event.memberId !== input.memberId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own events" });
        }

        // Update event
        const { eventId, memberId, ...updateData } = input;
        await updateMemberEvent(eventId, updateData);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update event" });
      }
    }),

  // Delete event
  delete: publicProcedure
    .input(z.object({ eventId: z.number(), memberId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        // Verify event exists and belongs to member
        const event = await getMemberEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }

        if (event.memberId !== input.memberId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own events" });
        }

        // Delete event
        await deleteMemberEvent(input.eventId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete event" });
      }
    }),
});

// ─── Member Event Signups Router ──────────────────────────────────────────────
export const memberEventSignupsRouter = router({
  // Sign up for an event
  create: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email required"),
        phone: z.string().min(1, "Phone is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify event exists
        const event = await getMemberEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }

        // Check if signup limit reached
        const signups = await getMemberEventSignupsByEventId(input.eventId);
        if (signups.length >= event.volunteerLimit) {
          throw new TRPCError({ code: "CONFLICT", message: "Event has reached maximum volunteer limit" });
        }

        // Create signup
        const signupId = await createMemberEventSignup({
          eventId: input.eventId,
          name: input.name,
          email: input.email,
          phone: input.phone,
        });

        return { success: true, signupId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create signup" });
      }
    }),
});


// ─── Admin Member Account Management ──────────────────────────────────────────
export const adminMemberAccountRouter = router({
  // Get all member accounts with member names
  getAll: publicProcedure.query(async () => {
    try {
      return await getAllMemberAccounts();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch member accounts" });
    }
  }),

  // Update member password (admin only)
  updatePassword: protectedProcedure
    .use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update member passwords' });
      }
      return next({ ctx });
    })
    .input(
      z.object({
        memberId: z.number(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify member account exists
        const account = await getMemberAccountByMemberId(input.memberId);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member account not found" });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(input.newPassword, 10);

        // Update password
        const success = await updateMemberAccountPassword(input.memberId, passwordHash, input.newPassword);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update password" });
        }

        return { success: true, message: "Password updated successfully", plainPassword: input.newPassword };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update password" });
      }
    }),

  // Update username (admin only)
  updateUsername: protectedProcedure
    .use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update usernames' });
      }
      return next({ ctx });
    })
    .input(
      z.object({
        memberId: z.number(),
        newUsername: z.string().min(3, "Username must be at least 3 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const account = await getMemberAccountByMemberId(input.memberId);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member account not found" });
        }

        const existingUsername = await getMemberAccountByUsername(input.newUsername);
        if (existingUsername && existingUsername.memberId !== input.memberId) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }

        // Update the username in the database
        const { updateMemberAccountUsername } = await import("./db");
        const success = await updateMemberAccountUsername(input.memberId, input.newUsername);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update username" });
        }

        return { success: true, message: "Username updated successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update username" });
      }
    }),
});

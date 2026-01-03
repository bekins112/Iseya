import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Export users and sessions from auth model
export * from "./models/auth";

export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employerId: varchar("employer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'waitress', 'cleaner', etc.
  wage: varchar("wage").notNull(),
  location: varchar("location").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });

// Types
// User types are already exported from ./models/auth but we can re-export or aliases if needed
// export type User = typeof users.$inferSelect; // Already in auth.ts
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type CreateJobRequest = InsertJob;
export type CreateApplicationRequest = InsertApplication;

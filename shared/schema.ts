import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personalDetails: jsonb("personal_details").$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location?: string;
    summary?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    photoUrl?: string;
  }>(),
  experience: jsonb("experience").$type<Array<{
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>>().default([]),
  education: jsonb("education").$type<Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    description?: string;
  }>>().default([]),
  skills: jsonb("skills").$type<Array<{
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: string;
  }>>().default([]),
  projects: jsonb("projects").$type<Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>>().default([]),
  languages: jsonb("languages").$type<Array<{
    id: string;
    name: string;
    proficiency: "basic" | "conversational" | "fluent" | "native";
  }>>().default([]),
  certificates: jsonb("certificates").$type<Array<{
    id: string;
    name: string;
    issuer: string;
    dateIssued: string;
    expiryDate?: string;
    credentialUrl?: string;
  }>>().default([]),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateResumeSchema = insertResumeSchema.partial();

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type UpdateResume = z.infer<typeof updateResumeSchema>;

// Individual schemas for form validation
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().optional(),
  summary: z.string().optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  photoUrl: z.string().optional(),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, "Description is required"),
});

export const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.string().min(1, "Category is required"),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  url: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const languageItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Language name is required"),
  proficiency: z.enum(["basic", "conversational", "fluent", "native"]),
});

export const certificateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certificate name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  dateIssued: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
});

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type CertificateItem = z.infer<typeof certificateItemSchema>;

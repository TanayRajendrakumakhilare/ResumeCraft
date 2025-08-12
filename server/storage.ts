import { type Resume, type InsertResume, type UpdateResume } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getResume(id: string): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: string, updates: UpdateResume): Promise<Resume | undefined>;
  deleteResume(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private resumes: Map<string, Resume>;

  constructor() {
    this.resumes = new Map();
  }

  async getResume(id: string): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = randomUUID();
    const now = new Date();
    const resume: Resume = {
      ...insertResume,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: string, updates: UpdateResume): Promise<Resume | undefined> {
    const existing = this.resumes.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Resume = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.resumes.set(id, updated);
    return updated;
  }

  async deleteResume(id: string): Promise<boolean> {
    return this.resumes.delete(id);
  }
}

export const storage = new MemStorage();

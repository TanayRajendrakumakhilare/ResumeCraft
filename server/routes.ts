import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertResumeSchema, 
  updateResumeSchema,
  personalDetailsSchema,
  experienceItemSchema,
  educationItemSchema,
  skillItemSchema,
  projectItemSchema,
  languageItemSchema,
  certificateItemSchema
} from "@shared/schema";
import { 
  generateProfessionalSummary, 
  generateExperienceDescription, 
  generateSkillSuggestions,
  enhanceProjectDescription,
  type AISummaryRequest,
  type AIExperienceRequest
} from "./services/openai";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, and PNG files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Resume CRUD operations
  app.post("/api/resumes", async (req, res) => {
    try {
      const validatedData = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(validatedData);
      res.json(resume);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/resumes/:id", async (req, res) => {
    try {
      const validatedData = updateResumeSchema.parse(req.body);
      const resume = await storage.updateResume(req.params.id, validatedData);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  app.delete("/api/resumes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteResume(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json({ message: "Resume deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Content Generation Routes
  app.post("/api/ai/generate-summary", async (req, res) => {
    try {
      const request: AISummaryRequest = req.body;
      if (!request.jobTitle || !request.yearsExperience) {
        return res.status(400).json({ message: "Job title and years of experience are required" });
      }
      
      const summaries = await generateProfessionalSummary(request);
      res.json({ summaries });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-experience", async (req, res) => {
    try {
      const request: AIExperienceRequest = req.body;
      if (!request.jobTitle || !request.company) {
        return res.status(400).json({ message: "Job title and company are required" });
      }
      
      const bullets = await generateExperienceDescription(request);
      res.json({ bullets });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/suggest-skills", async (req, res) => {
    try {
      const { jobTitle, industry = "Technology" } = req.body;
      if (!jobTitle) {
        return res.status(400).json({ message: "Job title is required" });
      }
      
      const skills = await generateSkillSuggestions(jobTitle, industry);
      res.json({ skills });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/enhance-project", async (req, res) => {
    try {
      const { projectName, technologies, currentDescription } = req.body;
      if (!projectName || !technologies || !Array.isArray(technologies)) {
        return res.status(400).json({ message: "Project name and technologies array are required" });
      }
      
      const descriptions = await enhanceProjectDescription(projectName, technologies, currentDescription);
      res.json({ descriptions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Photo upload route
  app.post("/api/upload-photo", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      // In a real app, you'd upload to cloud storage and return the URL
      // For this demo, we'll return a mock URL
      const photoUrl = `/uploads/${req.file.filename}`;
      res.json({ photoUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}

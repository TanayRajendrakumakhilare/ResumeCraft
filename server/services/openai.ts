import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIGenerationRequest {
  section: "summary" | "experience" | "education" | "skills" | "projects";
  context: Record<string, any>;
}

export interface AISummaryRequest {
  jobTitle: string;
  yearsExperience: string;
  skills: string[];
  industry?: string;
}

export interface AIExperienceRequest {
  jobTitle: string;
  company: string;
  responsibilities: string[];
  achievements?: string[];
}

export async function generateProfessionalSummary(request: AISummaryRequest): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Generate 3 different professional summary variations for a resume. Each should be 2-3 sentences, professional, and ATS-friendly. Respond with JSON in this format: { 'summaries': ['summary1', 'summary2', 'summary3'] }",
        },
        {
          role: "user",
          content: `Generate professional summaries for:
          Job Title: ${request.jobTitle}
          Years of Experience: ${request.yearsExperience}
          Key Skills: ${request.skills.join(", ")}
          Industry: ${request.industry || "Technology"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.summaries || [];
  } catch (error) {
    console.error("Failed to generate professional summary:", error);
    throw new Error("Failed to generate AI content");
  }
}

export async function generateExperienceDescription(request: AIExperienceRequest): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Generate 3-5 bullet points for a job experience that are achievement-focused, quantifiable when possible, and ATS-friendly. Start each bullet with an action verb. Respond with JSON in this format: { 'bullets': ['bullet1', 'bullet2', 'bullet3'] }",
        },
        {
          role: "user",
          content: `Generate experience bullet points for:
          Job Title: ${request.jobTitle}
          Company: ${request.company}
          Responsibilities: ${request.responsibilities.join(", ")}
          Achievements: ${request.achievements?.join(", ") || "General professional achievements"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.bullets || [];
  } catch (error) {
    console.error("Failed to generate experience description:", error);
    throw new Error("Failed to generate AI content");
  }
}

export async function generateSkillSuggestions(jobTitle: string, industry: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a career advisor. Suggest 10-15 relevant skills for a specific job title and industry. Include both technical and soft skills. Respond with JSON in this format: { 'skills': ['skill1', 'skill2', 'skill3'] }",
        },
        {
          role: "user",
          content: `Suggest relevant skills for:
          Job Title: ${jobTitle}
          Industry: ${industry}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.skills || [];
  } catch (error) {
    console.error("Failed to generate skill suggestions:", error);
    throw new Error("Failed to generate AI content");
  }
}

export async function enhanceProjectDescription(projectName: string, technologies: string[], currentDescription?: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a technical writer. Generate 2-3 enhanced project descriptions that highlight technical skills, impact, and achievements. Make them professional and suitable for a resume. Respond with JSON in this format: { 'descriptions': ['desc1', 'desc2', 'desc3'] }",
        },
        {
          role: "user",
          content: `Enhance project description for:
          Project Name: ${projectName}
          Technologies Used: ${technologies.join(", ")}
          Current Description: ${currentDescription || "A technical project showcasing development skills"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.descriptions || [];
  } catch (error) {
    console.error("Failed to enhance project description:", error);
    throw new Error("Failed to generate AI content");
  }
}

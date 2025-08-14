import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
  Resume,
  PersonalDetails,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  LanguageItem,
  CertificateItem,
} from "@shared/schema";

import ProgressIndicator from "@/components/progress-indicator";
import PersonalDetailsStep from "@/components/form-steps/personal-details";
import ExperienceStep from "@/components/form-steps/experience";
import EducationStep from "@/components/form-steps/education";
import SkillsStep from "@/components/form-steps/skills";
import ReviewStep from "@/components/form-steps/review";
import ResumePreview from "@/components/resume-preview";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle } from "lucide-react";

/** ---- helper: extract server error messages from non-2xx responses ---- */
const extractErrorMessage = async (response: Response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json?.message || JSON.stringify(json);
  } catch {
    return text || "Unknown error";
  }
};

export default function ResumeBuilder() {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeId, setResumeId] = useState<string | null>(id || null);

  // Form data state
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    photoUrl: "",
  });

  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  // Fetch existing resume if ID provided
  const { data: existingResume, isLoading } = useQuery({
    queryKey: ["/api/resumes", resumeId],
    enabled: !!resumeId,
  });

  // Load existing data when resume is fetched
  useEffect(() => {
    if (existingResume) {
      const resume = existingResume as Resume;
      if (resume.personalDetails) setPersonalDetails(resume.personalDetails);
      if (resume.experience) setExperience(resume.experience);
      if (resume.education) setEducation(resume.education);
      if (resume.skills) setSkills(resume.skills);
      if (resume.projects) setProjects(resume.projects);
      if (resume.languages) setLanguages(resume.languages);
      if (resume.certificates) setCertificates(resume.certificates);
    }
  }, [existingResume]);

  /** ----------------- MUTATIONS ----------------- */

  // Create resume (use fetch directly so we can show precise errors)
  const createResumeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      return res.json();
    },
    onSuccess: (data: any) => {
      const newId = data?.id ?? data?.resume?.id;
      if (newId) setResumeId(newId);
      toast({
        title: "Resume created",
        description: "Your resume has been created successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to create resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update resume with 404→POST fallback (handles in-memory storage resets)
  const updateResumeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!resumeId) throw new Error("Missing resumeId");

      // Try PATCH first
      const patchRes = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (patchRes.status === 404) {
        // Map reset: create a fresh resume and set new id
        const postRes = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        if (!postRes.ok) throw new Error(await extractErrorMessage(postRes));
        const created = await postRes.json();
        const newId = created?.id ?? created?.resume?.id;
        if (!newId) throw new Error("Create succeeded but no id returned");
        setResumeId(newId);
        return { ok: true, created: true, id: newId };
      }

      if (!patchRes.ok) throw new Error(await extractErrorMessage(patchRes));
      return patchRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", resumeId] });
      toast({
        title: "Resume saved",
        description: "Your changes have been saved.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isSaving = createResumeMutation.isPending || updateResumeMutation.isPending;

  /** Build a minimal payload for the current step (prevents validation errors on unfinished sections) */
  const buildPayloadForStep = (step: number) => {
    switch (step) {
      case 1:
        return { personalDetails };
      case 2:
        return { experience };
      case 3:
        return { education };
      case 4:
        return { skills, projects, languages, certificates };
      case 5:
      default:
        return {
          personalDetails,
          experience,
          education,
          skills,
          projects,
          languages,
          certificates,
        };
    }
  };

  // Save helper that awaits create/update
  const saveResume = async (saveAll = false) => {
    const payload = saveAll
      ? {
          personalDetails,
          experience,
          education,
          skills,
          projects,
          languages,
          certificates,
        }
      : buildPayloadForStep(currentStep);

    try {
      if (resumeId) {
        await updateResumeMutation.mutateAsync(payload);
      } else {
        const created = await createResumeMutation.mutateAsync(payload);
        const newId = created?.id ?? created?.resume?.id;
        if (!newId) throw new Error("Create succeeded but no id returned");
        setResumeId(newId);
      }
      return true;
    } catch {
      return false;
    }
  };

  // NEXT: strict (must save before advancing)
  const handleNext = async () => {
    if (currentStep < 5) {
      const ok = await saveResume(false);
      if (ok) setCurrentStep((s) => s + 1);
    }
  };

  // PREVIOUS: navigate first, save best-effort (don’t block going back)
  const handlePrevious = async () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      saveResume(false).catch(() => {});
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            data={personalDetails}
            onChange={setPersonalDetails}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <ExperienceStep
            data={experience}
            onChange={setExperience}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <EducationStep
            data={education}
            onChange={setEducation}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <SkillsStep
            data={skills}
            onChange={setSkills}
            projects={projects}
            onProjectsChange={setProjects}
            languages={languages}
            onLanguagesChange={setLanguages}
            certificates={certificates}
            onCertificatesChange={setCertificates}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <ReviewStep
            personalDetails={personalDetails}
            experience={experience}
            education={education}
            skills={skills}
            projects={projects}
            languages={languages}
            certificates={certificates}
            onPrevious={handlePrevious}
            onSave={() => saveResume(true)}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-poppins font-bold text-text-primary">Craft.CV</h1>
                <p className="text-xs text-secondary">Professional Resume Builder</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-help">
                <HelpCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  await saveResume(true);
                }}
                disabled={isSaving}
                data-testid="button-save-exit"
              >
                {isSaving ? "Saving..." : "Save & Exit"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} totalSteps={5} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-screen">
          {/* Left Panel - Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {renderCurrentStep()}
          </div>

          {/* Right Panel - Preview */}
          <ResumePreview
            personalDetails={personalDetails}
            experience={experience}
            education={education}
            skills={skills}
            projects={projects}
            languages={languages}
            certificates={certificates}
          />
        </div>
      </div>
    </div>
  );
}

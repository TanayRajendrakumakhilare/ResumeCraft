import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Resume, PersonalDetails, ExperienceItem, EducationItem, SkillItem, ProjectItem, LanguageItem, CertificateItem } from "@shared/schema";

import ProgressIndicator from "@/components/progress-indicator";
import PersonalDetailsStep from "@/components/form-steps/personal-details";
import ExperienceStep from "@/components/form-steps/experience";
import EducationStep from "@/components/form-steps/education";
import SkillsStep from "@/components/form-steps/skills";
import ReviewStep from "@/components/form-steps/review";
import ResumePreview from "@/components/resume-preview";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle } from "lucide-react";

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

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/resumes", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResumeId(data.id);
      toast({
        title: "Resume created",
        description: "Your resume has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/resumes/${resumeId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", resumeId] });
      toast({
        title: "Resume saved",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveResume = () => {
    const resumeData = {
      personalDetails,
      experience,
      education,
      skills,
      projects,
      languages,
      certificates,
    };

    if (resumeId) {
      updateResumeMutation.mutate(resumeData);
    } else {
      createResumeMutation.mutate(resumeData);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      saveResume();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveResume();
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
            onSave={saveResume}
            isSaving={createResumeMutation.isPending || updateResumeMutation.isPending}
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
                onClick={saveResume}
                disabled={createResumeMutation.isPending || updateResumeMutation.isPending}
                data-testid="button-save-exit"
              >
                Save & Exit
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

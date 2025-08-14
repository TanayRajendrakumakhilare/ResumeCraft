import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  skillItemSchema,
  projectItemSchema,
  languageItemSchema,
  certificateItemSchema,
  type SkillItem,
  type ProjectItem,
  type LanguageItem,
  type CertificateItem,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AIAssistantModal from "@/components/ai-assistant-modal";
import { ChevronRight, ChevronLeft, Plus, Trash2, Wand2, X } from "lucide-react";

// Relaxed schema so draft/incomplete items don't block navigation
const relaxedSkillItem = skillItemSchema.partial();
const relaxedProjectItem = projectItemSchema.partial();
const relaxedLanguageItem = languageItemSchema.partial();
const relaxedCertificateItem = certificateItemSchema.partial();

const skillsFormSchema = z.object({
  skills: z.array(relaxedSkillItem),
  projects: z.array(relaxedProjectItem),
  languages: z.array(relaxedLanguageItem),
  certificates: z.array(relaxedCertificateItem),
});

type SkillsFormData = z.infer<typeof skillsFormSchema>;

interface SkillsStepProps {
  data: SkillItem[];
  onChange: (data: SkillItem[]) => void;
  projects: ProjectItem[];
  onProjectsChange: (data: ProjectItem[]) => void;
  languages: LanguageItem[];
  onLanguagesChange: (data: LanguageItem[]) => void;
  certificates: CertificateItem[];
  onCertificatesChange: (data: CertificateItem[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSaving?: boolean; // optional
}

export default function SkillsStep({
  data,
  onChange,
  projects,
  onProjectsChange,
  languages,
  onLanguagesChange,
  certificates,
  onCertificatesChange,
  onNext,
  onPrevious,
  isSaving = false,
}: SkillsStepProps) {
  const [activeTab, setActiveTab] = useState<"skills" | "projects" | "languages" | "certificates">("skills");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSection, setAISection] = useState<"skills" | "project">("skills");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      skills: data.length > 0 ? data : [],
      projects: projects.length > 0 ? projects : [],
      languages: languages.length > 0 ? languages : [],
      certificates: certificates.length > 0 ? certificates : [],
    },
    mode: "onChange",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control: form.control, name: "skills" });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: form.control, name: "projects" });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({ control: form.control, name: "languages" });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({ control: form.control, name: "certificates" });

  const addSkill = () => {
    appendSkill({
      // @ts-expect-error allow partial during step
      id: crypto.randomUUID(),
      name: "",
      level: "intermediate",
      category: "",
    });
  };

  const addProject = () => {
    appendProject({
      // @ts-expect-error allow partial during step
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      startDate: "",
      endDate: "",
    });
  };

  const addLanguage = () => {
    appendLanguage({
      // @ts-expect-error allow partial during step
      id: crypto.randomUUID(),
      name: "",
      proficiency: "conversational",
    });
  };

  const addCertificate = () => {
    appendCertificate({
      // @ts-expect-error allow partial during step
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      dateIssued: "",
      expiryDate: "",
      credentialUrl: "",
    });
  };

  // Save current form values up to parent state (without leaving the step)
  const syncUp = () => {
    const v = form.getValues();
    onChange(v.skills);
    onProjectsChange(v.projects);
    onLanguagesChange(v.languages);
    onCertificatesChange(v.certificates);
  };

  // Continue regardless of which tab is active; only block if ALL sections are empty
  const handleContinue = () => {
    const v = form.getValues();
    const hasAny =
      (v.skills?.length ?? 0) > 0 ||
      (v.projects?.length ?? 0) > 0 ||
      (v.languages?.length ?? 0) > 0 ||
      (v.certificates?.length ?? 0) > 0;

    // Always push current edits up
    onChange(v.skills);
    onProjectsChange(v.projects);
    onLanguagesChange(v.languages);
    onCertificatesChange(v.certificates);

    if (!hasAny) {
      // if absolutely nothing is filled, nudge user to Skills tab
      setActiveTab("skills");
      // optionally you can show a small message using your toast here
      return;
    }
    onNext();
  };

  const handleSaveDraft = () => {
    syncUp();
    // optional: you can show a toast from parent after this
  };

  const handleAISkills = () => {
    setAISection("skills");
    setShowAIModal(true);
  };

  const handleAIProject = (index: number) => {
    setAISection("project");
    setSelectedProjectIndex(index);
    setShowAIModal(true);
  };

  const handleAIApply = (content: string) => {
    if (aiSection === "skills") {
      const skillNames = content.split(",").map((s) => s.trim()).filter(Boolean);
      skillNames.forEach((skillName) => {
        appendSkill({
          // @ts-expect-error allow partial during step
          id: crypto.randomUUID(),
          name: skillName,
          level: "intermediate",
          category: "Technical",
        });
      });
      onChange(form.getValues().skills);
    } else if (aiSection === "project" && selectedProjectIndex !== null) {
      form.setValue(`projects.${selectedProjectIndex}.description`, content);
      onProjectsChange(form.getValues().projects);
    }
  };

  const addTechnology = (projectIndex: number, tech: string) => {
    if (!tech.trim()) return;
    const currentTechs = form.getValues(`projects.${projectIndex}.technologies`) || [];
    if (!currentTechs.includes(tech.trim())) {
      form.setValue(`projects.${projectIndex}.technologies`, [...currentTechs, tech.trim()]);
      onProjectsChange(form.getValues().projects);
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const currentTechs = form.getValues(`projects.${projectIndex}.technologies`) || [];
    const updatedTechs = currentTechs.filter((_, index) => index !== techIndex);
    form.setValue(`projects.${projectIndex}.technologies`, updatedTechs);
    onProjectsChange(form.getValues().projects);
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">
            Skills & Additional Information
          </h2>
          <p className="text-secondary">
            Showcase your skills, projects, languages, and certifications to strengthen your profile.
          </p>
        </div>

        <Form {...form}>
          {/* We keep the form wrapper for layout/keyboard, but we DO NOT submit it */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
              </TabsList>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">Technical & Soft Skills</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAISkills}
                    className="bg-accent text-white hover:bg-accent/90 border-accent"
                    data-testid="button-ai-suggest-skills"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Suggest
                  </Button>
                </div>

                {skillFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`skills.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skill Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="JavaScript"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onChange(form.getValues().skills);
                                  }}
                                  data-testid={`input-skill-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Programming"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onChange(form.getValues().skills);
                                  }}
                                  data-testid={`input-skill-category-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Proficiency Level *</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  onChange(form.getValues().skills);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid={`select-skill-level-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-skill-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="w-full"
                  data-testid="button-add-skill"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Projects</h3>

                {projectFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Project {index + 1}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAIProject(index)}
                            className="bg-accent text-white hover:bg-accent/90 border-accent"
                            data-testid={`button-ai-enhance-project-${index}`}
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            AI Enhance
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProject(index)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-remove-project-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="E-commerce Platform"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onProjectsChange(form.getValues().projects);
                                  }}
                                  data-testid={`input-project-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`projects.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project URL</FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://github.com/username/project"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onProjectsChange(form.getValues().projects);
                                  }}
                                  data-testid={`input-project-url-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="month"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onProjectsChange(form.getValues().projects);
                                  }}
                                  data-testid={`input-project-start-date-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`projects.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="month"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onProjectsChange(form.getValues().projects);
                                  }}
                                  data-testid={`input-project-end-date-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Technologies */}
                      <div>
                        <FormLabel>Technologies Used *</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(form.watch(`projects.${index}.technologies`) || []).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                              {tech}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
                                onClick={() => removeTechnology(index, techIndex)}
                                data-testid={`button-remove-tech-${index}-${techIndex}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Type technology and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const tech = (e.target as HTMLInputElement).value;
                              addTechnology(index, tech);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                          data-testid={`input-project-technologies-${index}`}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`projects.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Describe the project, your role, and key achievements..."
                                className="resize-none"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  onProjectsChange(form.getValues().projects);
                                }}
                                data-testid={`textarea-project-description-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addProject}
                  className="w-full"
                  data-testid="button-add-project"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </TabsContent>

              {/* Languages Tab */}
              <TabsContent value="languages" className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Languages</h3>

                {languageFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`languages.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Spanish"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onLanguagesChange(form.getValues().languages);
                                  }}
                                  data-testid={`input-language-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`languages.${index}.proficiency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Proficiency Level *</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  onLanguagesChange(form.getValues().languages);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid={`select-language-proficiency-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="conversational">Conversational</SelectItem>
                                  <SelectItem value="fluent">Fluent</SelectItem>
                                  <SelectItem value="native">Native</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-language-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addLanguage}
                  className="w-full"
                  data-testid="button-add-language"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Certifications</h3>

                {certificateFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Certificate {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCertificate(index)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-certificate-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`certificates.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="AWS Certified Solutions Architect"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onCertificatesChange(form.getValues().certificates);
                                  }}
                                  data-testid={`input-certificate-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`certificates.${index}.issuer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Issuing Organization *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Amazon Web Services"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onCertificatesChange(form.getValues().certificates);
                                  }}
                                  data-testid={`input-certificate-issuer-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`certificates.${index}.dateIssued`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Issued *</FormLabel>
                              <FormControl>
                                <Input
                                  type="month"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onCertificatesChange(form.getValues().certificates);
                                  }}
                                  data-testid={`input-certificate-date-issued-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`certificates.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="month"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onCertificatesChange(form.getValues().certificates);
                                  }}
                                  data-testid={`input-certificate-expiry-date-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`certificates.${index}.credentialUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credential URL</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://www.credly.com/..."
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  onCertificatesChange(form.getValues().certificates);
                                }}
                                data-testid={`input-certificate-credential-url-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCertificate}
                  className="w-full"
                  data-testid="button-add-certificate"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </TabsContent>
            </Tabs>

            {/* Form Actions (no real submit; we control navigation) */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onPrevious}
                data-testid="button-previous"
                disabled={isSaving}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  data-testid="button-save-draft"
                  disabled={isSaving}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={handleContinue}
                  data-testid="button-continue"
                  disabled={isSaving}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>

      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        section={aiSection}
        onApply={handleAIApply}
        initialData={
          aiSection === "project" && selectedProjectIndex !== null
            ? {
                projectName: form.watch(`projects.${selectedProjectIndex}.name`),
                technologies: form.watch(`projects.${selectedProjectIndex}.technologies`) || [],
              }
            : { jobTitle: "", industry: "Technology" }
        }
      />
    </>
  );
}

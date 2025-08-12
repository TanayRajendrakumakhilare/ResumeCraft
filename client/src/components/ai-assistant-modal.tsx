import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, CheckCircle2, Loader2 } from "lucide-react";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: "summary" | "experience" | "skills" | "project";
  onApply: (content: string) => void;
  initialData?: Record<string, any>;
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  section,
  onApply,
  initialData = {},
}: AIAssistantModalProps) {
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle || "");
  const [yearsExperience, setYearsExperience] = useState(initialData.yearsExperience || "");
  const [skills, setSkills] = useState(initialData.skills || "");
  const [company, setCompany] = useState(initialData.company || "");
  const [responsibilities, setResponsibilities] = useState(initialData.responsibilities || "");
  const [projectName, setProjectName] = useState(initialData.projectName || "");
  const [technologies, setTechnologies] = useState(initialData.technologies || "");
  const [industry, setIndustry] = useState(initialData.industry || "Technology");
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      let endpoint = "";
      let payload = {};

      switch (section) {
        case "summary":
          endpoint = "/api/ai/generate-summary";
          payload = {
            jobTitle,
            yearsExperience,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            industry,
          };
          break;
        case "experience":
          endpoint = "/api/ai/generate-experience";
          payload = {
            jobTitle,
            company,
            responsibilities: responsibilities.split(",").map(s => s.trim()).filter(Boolean),
          };
          break;
        case "skills":
          endpoint = "/api/ai/suggest-skills";
          payload = { jobTitle, industry };
          break;
        case "project":
          endpoint = "/api/ai/enhance-project";
          payload = {
            projectName,
            technologies: technologies.split(",").map(s => s.trim()).filter(Boolean),
          };
          break;
      }

      const response = await apiRequest("POST", endpoint, payload);
      return response.json();
    },
    onSuccess: (data) => {
      if (section === "summary") {
        setSuggestions(data.summaries || []);
      } else if (section === "experience") {
        setSuggestions(data.bullets || []);
      } else if (section === "skills") {
        setSuggestions(data.skills || []);
      } else if (section === "project") {
        setSuggestions(data.descriptions || []);
      }
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    // Validate required fields based on section
    if (section === "summary" && (!jobTitle || !yearsExperience)) {
      toast({
        title: "Missing information",
        description: "Please provide job title and years of experience.",
        variant: "destructive",
      });
      return;
    }
    
    if (section === "experience" && (!jobTitle || !company)) {
      toast({
        title: "Missing information", 
        description: "Please provide job title and company.",
        variant: "destructive",
      });
      return;
    }
    
    if (section === "skills" && !jobTitle) {
      toast({
        title: "Missing information",
        description: "Please provide a job title.",
        variant: "destructive",
      });
      return;
    }
    
    if (section === "project" && (!projectName || !technologies)) {
      toast({
        title: "Missing information",
        description: "Please provide project name and technologies.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate();
  };

  const handleApply = () => {
    if (!selectedSuggestion) {
      toast({
        title: "No selection",
        description: "Please select a suggestion to apply.",
        variant: "destructive",
      });
      return;
    }

    onApply(selectedSuggestion);
    onClose();
    
    // Reset form
    setSuggestions([]);
    setSelectedSuggestion("");
  };

  const renderForm = () => {
    switch (section) {
      case "summary":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="jobTitle">Job Title/Role *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Developer"
                  data-testid="input-job-title"
                />
              </div>
              <div>
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Select value={yearsExperience} onValueChange={setYearsExperience}>
                  <SelectTrigger data-testid="select-years-experience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-4">2-4 years</SelectItem>
                    <SelectItem value="5-7">5-7 years</SelectItem>
                    <SelectItem value="8+">8+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="skills">Key Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, AWS"
                data-testid="input-skills"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
                data-testid="input-industry"
              />
            </div>
          </>
        );

      case "experience":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Developer"
                  data-testid="input-job-title"
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Tech Corp"
                  data-testid="input-company"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="responsibilities">Key Responsibilities (comma-separated)</Label>
              <Textarea
                id="responsibilities"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="e.g., Led development team, Built web applications, Improved performance"
                rows={3}
                data-testid="textarea-responsibilities"
              />
            </div>
          </>
        );

      case "skills":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Data Scientist"
                  data-testid="input-job-title"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                  data-testid="input-industry"
                />
              </div>
            </div>
          </>
        );

      case "project":
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., E-commerce Platform"
                data-testid="input-project-name"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="technologies">Technologies Used (comma-separated) *</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB, AWS"
                data-testid="input-technologies"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case "summary":
        return "Professional Summary";
      case "experience":
        return "Experience Description";
      case "skills":
        return "Skill Suggestions";
      case "project":
        return "Project Description";
      default:
        return "AI Assistant";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Wand2 className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-poppins font-semibold">
                AI Resume Assistant
              </DialogTitle>
              <p className="text-sm text-secondary">
                Enhance your {getSectionTitle().toLowerCase()} with AI suggestions
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-text-primary mb-3">
              Tell us about your background:
            </h4>
            {renderForm()}
            
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full"
              data-testid="button-generate-suggestions"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {getSectionTitle()}
                </>
              )}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-text-primary mb-3">
                AI-Generated Suggestions:
              </h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`bg-white p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSuggestion === suggestion
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-accent"
                    }`}
                    onClick={() => setSelectedSuggestion(suggestion)}
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-text-primary leading-relaxed flex-1">
                        {suggestion}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`ml-3 ${
                          selectedSuggestion === suggestion
                            ? "text-accent"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedSuggestion}
              data-testid="button-apply-selection"
            >
              Apply Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generatePDF } from "@/lib/pdf-generator";
import { 
  type PersonalDetails, 
  type ExperienceItem, 
  type EducationItem, 
  type SkillItem, 
  type ProjectItem, 
  type LanguageItem, 
  type CertificateItem 
} from "@shared/schema";
import { 
  ChevronLeft, 
  Download, 
  Save, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderOpen, 
  Globe, 
  Award 
} from "lucide-react";

interface ReviewStepProps {
  personalDetails: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  onPrevious: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function ReviewStep({
  personalDetails,
  experience,
  education,
  skills,
  projects,
  languages,
  certificates,
  onPrevious,
  onSave,
  isSaving,
}: ReviewStepProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF({
        personalDetails,
        experience,
        education,
        skills,
        projects,
        languages,
        certificates,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getSectionCount = () => {
    let count = 1; // Personal details always present
    if (experience.length > 0) count++;
    if (education.length > 0) count++;
    if (skills.length > 0) count++;
    if (projects.length > 0) count++;
    if (languages.length > 0) count++;
    if (certificates.length > 0) count++;
    return count;
  };

  const getCompletionPercentage = () => {
    const totalSections = 7; // Maximum possible sections
    const completedSections = getSectionCount();
    return Math.round((completedSections / totalSections) * 100);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">
          Review Your Resume
        </h2>
        <p className="text-secondary">
          Review all your information and download your professional resume.
        </p>
        
        {/* Completion Status */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Resume Completion</span>
            <span className="text-sm text-secondary">{getCompletionPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-secondary mt-2">
            {getSectionCount()} of 7 sections completed
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary">Name</p>
                <p className="font-medium">{personalDetails.firstName} {personalDetails.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Email</p>
                <p className="font-medium">{personalDetails.email}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Phone</p>
                <p className="font-medium">{personalDetails.phone}</p>
              </div>
              {personalDetails.location && (
                <div>
                  <p className="text-sm text-secondary">Location</p>
                  <p className="font-medium">{personalDetails.location}</p>
                </div>
              )}
            </div>
            
            {personalDetails.summary && (
              <div className="mt-4">
                <p className="text-sm text-secondary">Professional Summary</p>
                <p className="text-sm leading-relaxed mt-1">{personalDetails.summary}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {personalDetails.linkedIn && (
                <Badge variant="outline">LinkedIn</Badge>
              )}
              {personalDetails.github && (
                <Badge variant="outline">GitHub</Badge>
              )}
              {personalDetails.portfolio && (
                <Badge variant="outline">Portfolio</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        {experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Work Experience ({experience.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{exp.jobTitle}</h4>
                        <p className="text-primary font-medium">{exp.company}</p>
                        {exp.location && <p className="text-sm text-secondary">{exp.location}</p>}
                      </div>
                      <span className="text-xs text-secondary">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                    {index < experience.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Education ({education.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-primary font-medium">{edu.institution}</p>
                        {edu.location && <p className="text-sm text-secondary">{edu.location}</p>}
                        {edu.gpa && <p className="text-sm text-secondary">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-xs text-secondary">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-700">{edu.description}</p>
                    )}
                    {index < education.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Skills ({skills.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  skills.reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(skill);
                    return acc;
                  }, {} as Record<string, SkillItem[]>)
                ).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                          {skill.name}
                          <span className="text-xs opacity-70">({skill.level})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5" />
                <span>Projects ({projects.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      {(project.startDate || project.endDate) && (
                        <span className="text-xs text-secondary">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    {index < projects.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Languages ({languages.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <Badge key={language.id} variant="secondary" className="flex items-center gap-1">
                    {language.name}
                    <span className="text-xs opacity-70">({language.proficiency})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Certifications ({certificates.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <div key={cert.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-primary font-medium">{cert.issuer}</p>
                        {cert.credentialUrl && (
                          <a 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline"
                          >
                            View Credential
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-secondary text-right">
                        <p>Issued: {formatDate(cert.dateIssued)}</p>
                        {cert.expiryDate && <p>Expires: {formatDate(cert.expiryDate)}</p>}
                      </div>
                    </div>
                    {index < certificates.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          data-testid="button-previous"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSave}
            disabled={isSaving}
            data-testid="button-save-resume"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Resume"}
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-success hover:bg-success/90"
            data-testid="button-download-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

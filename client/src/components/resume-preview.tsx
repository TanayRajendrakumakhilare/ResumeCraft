import { Eye, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  type PersonalDetails, 
  type ExperienceItem, 
  type EducationItem, 
  type SkillItem, 
  type ProjectItem, 
  type LanguageItem, 
  type CertificateItem 
} from "@shared/schema";
import { generatePDF } from "@/lib/pdf-generator";
import { useState } from "react";

interface ResumePreviewProps {
  personalDetails: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
}

export default function ResumePreview({
  personalDetails,
  experience,
  education,
  skills,
  projects,
  languages,
  certificates,
}: ResumePreviewProps) {
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

  const groupSkillsByCategory = () => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, SkillItem[]>);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-poppins font-semibold text-text-primary">Resume Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            className="bg-success text-white hover:bg-success/90"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            data-testid="button-download-preview-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Resume Document Preview */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" style={{ aspectRatio: "8.5/11", maxHeight: "700px" }}>
        <div className="w-full h-full p-8 text-xs overflow-y-auto" style={{ transform: "scale(0.8)", transformOrigin: "top left", width: "125%", height: "125%" }}>
          
          {/* Resume Header */}
          <div className="text-center mb-6">
            {personalDetails.photoUrl && (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={personalDetails.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  data-testid="img-resume-photo"
                />
              </div>
            )}
            {!personalDetails.photoUrl && (
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-text-primary font-poppins" data-testid="text-resume-name">
              {personalDetails.firstName || "Your"} {personalDetails.lastName || "Name"}
            </h1>
            
            {personalDetails.summary && (
              <p className="text-base text-secondary font-medium mt-1">Professional Summary Available</p>
            )}
            
            <div className="flex flex-wrap justify-center items-center space-x-4 mt-3 text-sm text-secondary">
              {personalDetails.email && <span data-testid="text-resume-email">{personalDetails.email}</span>}
              {personalDetails.phone && (
                <>
                  {personalDetails.email && <span>•</span>}
                  <span data-testid="text-resume-phone">{personalDetails.phone}</span>
                </>
              )}
              {personalDetails.location && (
                <>
                  {(personalDetails.email || personalDetails.phone) && <span>•</span>}
                  <span data-testid="text-resume-location">{personalDetails.location}</span>
                </>
              )}
            </div>
            
            {/* Professional Links */}
            {(personalDetails.linkedIn || personalDetails.github || personalDetails.portfolio) && (
              <div className="flex flex-wrap justify-center items-center space-x-4 mt-2 text-xs text-primary">
                {personalDetails.linkedIn && <span>LinkedIn</span>}
                {personalDetails.github && <span>GitHub</span>}
                {personalDetails.portfolio && <span>Portfolio</span>}
              </div>
            )}
          </div>

          {/* Professional Summary Section */}
          {personalDetails.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-gray-700" data-testid="text-resume-summary">
                {personalDetails.summary}
              </p>
            </div>
          )}

          {/* Experience Section */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Professional Experience
              </h2>
              
              {experience.slice(0, 3).map((exp, index) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-text-primary">{exp.jobTitle || "Job Title"}</h3>
                      <p className="text-primary font-medium">{exp.company || "Company Name"}</p>
                      {exp.location && <p className="text-xs text-secondary">{exp.location}</p>}
                    </div>
                    <span className="text-secondary text-xs">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <div className="text-sm text-gray-700 whitespace-pre-line ml-0">
                      {exp.description.split('\n').slice(0, 3).join('\n')}
                    </div>
                  )}
                </div>
              ))}
              
              {experience.length === 0 && (
                <div className="text-xs text-gray-400 italic text-center py-4">
                  [Experience details will appear as you complete the form]
                </div>
              )}
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Education
              </h2>
              
              {education.slice(0, 2).map((edu, index) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-text-primary">{edu.degree || "Degree"}</h3>
                      <p className="text-primary font-medium">{edu.institution || "Institution"}</p>
                      {edu.location && <p className="text-xs text-secondary">{edu.location}</p>}
                    </div>
                    <span className="text-secondary text-xs">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.gpa && <p className="text-xs text-secondary">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {education.length === 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Education
              </h2>
              <div className="text-xs text-gray-400 italic text-center py-4">
                [Education details will appear in the next step]
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Skills
              </h2>
              
              {Object.entries(groupSkillsByCategory()).slice(0, 3).map(([category, categorySkills]) => (
                <div key={category} className="mb-2">
                  <span className="font-semibold text-xs text-text-primary mr-2">{category}:</span>
                  <span className="text-xs text-gray-700">
                    {categorySkills.slice(0, 6).map(skill => skill.name).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {skills.length === 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Skills
              </h2>
              <div className="text-xs text-gray-400 italic text-center py-4">
                [Skills will be displayed after completing the skills section]
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Notable Projects
              </h2>
              
              {projects.slice(0, 2).map((project, index) => (
                <div key={project.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-text-primary">{project.name || "Project Name"}</h3>
                    {(project.startDate || project.endDate) && (
                      <span className="text-secondary text-xs">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-700 mb-1">{project.description.slice(0, 120)}...</p>
                  )}
                  {project.technologies.length > 0 && (
                    <p className="text-xs text-secondary">
                      <span className="font-medium">Technologies:</span> {project.technologies.slice(0, 4).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Languages & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-2 uppercase tracking-wide">
                  Languages
                </h2>
                <div className="space-y-1">
                  {languages.slice(0, 4).map((language) => (
                    <p key={language.id} className="text-xs text-gray-700">
                      {language.name} - {language.proficiency}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {certificates.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-2 uppercase tracking-wide">
                  Certifications
                </h2>
                <div className="space-y-1">
                  {certificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="text-xs">
                      <p className="font-medium text-text-primary">{cert.name}</p>
                      <p className="text-gray-700">{cert.issuer} - {formatDate(cert.dateIssued)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-text-primary text-sm">Template Style</h4>
          <Button variant="ghost" size="sm" className="text-primary text-sm hover:text-blue-700">
            Browse All
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-2 rounded border-2 border-primary">
            <div className="h-12 bg-gradient-to-b from-gray-100 to-gray-200 rounded mb-1"></div>
            <p className="text-xs text-center text-primary font-medium">Professional</p>
          </div>
          <div className="bg-white p-2 rounded border border-gray-300 hover:border-primary cursor-pointer transition-colors">
            <div className="h-12 bg-gradient-to-b from-blue-50 to-blue-100 rounded mb-1"></div>
            <p className="text-xs text-center text-secondary">Modern</p>
          </div>
          <div className="bg-white p-2 rounded border border-gray-300 hover:border-primary cursor-pointer transition-colors">
            <div className="h-12 bg-gradient-to-b from-green-50 to-green-100 rounded mb-1"></div>
            <p className="text-xs text-center text-secondary">Creative</p>
          </div>
        </div>
      </div>
    </div>
  );
}

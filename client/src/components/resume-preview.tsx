import { Eye, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import React, { useEffect, useMemo, useRef, useState } from "react";

interface ResumePreviewProps {
  personalDetails: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
}

const A4_RATIO = 11 / 8.5; // height / width for US Letter look; for true A4 use 297/210 ≈ 1.414

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

  // --- Page break markers state ---
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [pageHeightPx, setPageHeightPx] = useState<number>(0);
  const [breaks, setBreaks] = useState<number[]>([]); // y positions in px (unscaled, relative to contentRef)

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

  // --- Compute page breaks: based on content width -> pageHeightPx = width * A4_RATIO
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      // Use the element's layout width (unscaled). Absolute children use this same coordinate space.
      const width = el.clientWidth;
      const ph = width * A4_RATIO;
      const total = el.scrollHeight; // unscaled scroll height
      if (ph > 0) {
        const count = Math.floor(total / ph);
        const arr: number[] = [];
        for (let i = 1; i <= count; i++) {
          const y = Math.round(i * ph);
          if (y < total - 8) arr.push(y);
        }
        setPageHeightPx(ph);
        setBreaks(arr);
      } else {
        setBreaks([]);
      }
    };

    // Recompute on resize and whenever content size changes
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    // Some content (images) may load after mount
    const onLoad = () => compute();
    window.addEventListener("load", onLoad);
    window.addEventListener("resize", compute);

    // Also recompute when data arrays change
    compute();

    return () => {
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", compute);
    };
  }, [personalDetails, experience, education, skills, projects, languages, certificates]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-poppins font-semibold text-text-primary">Resume Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Zoom in">
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
      <div
        className="bg-white border border-gray-300 rounded-lg overflow-hidden"
        style={{ aspectRatio: "8.5/11", maxHeight: "700px" }}
      >
        <div
          ref={contentRef}
          data-pdf-root
          className="relative w-full h-full p-8 text-xs overflow-y-auto"
          style={{ transform: "scale(0.8)", transformOrigin: "top left", width: "125%", height: "125%" }}
        >
          {/* --- Page break markers (absolute inside contentRef) --- */}
          {breaks.map((y, idx) => (
            <div
              key={`pb-${idx}`}
              className="absolute left-0 w-full pointer-events-none"
              style={{ top: y }}
              aria-hidden
            >
              {/* dashed divider */}
              <div className="border-t border-dashed border-gray-300" />
              {/* pill label */}
              <div className="absolute -top-3 right-3 bg-white/90 text-[10px] text-gray-600 px-2 py-0.5 rounded-full shadow-sm">
                Page {idx + 1} ends • Page {idx + 2} starts
              </div>
            </div>
          ))}

          {/* ====== Resume content starts ====== */}

          {/* Resume Header */}
          <div className="text-center mb-6">
            {personalDetails.photoUrl ? (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={personalDetails.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  data-testid="img-resume-photo"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-400 rounded-full" />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-text-primary font-poppins" data-testid="text-resume-name">
              {personalDetails.firstName || "Your"} {personalDetails.lastName || "Name"}
            </h1>
            
            {personalDetails.summary && (
              <p className="text-base text-secondary font-medium mt-1">Professional Summary Available</p>
            )}
            
            <div className="flex flex-wrap justify-center items-center gap-x-4 mt-3 text-sm text-secondary">
              {personalDetails.email && <span data-testid="text-resume-email">{personalDetails.email}</span>}
              {personalDetails.phone && <span data-testid="text-resume-phone">{personalDetails.phone}</span>}
              {personalDetails.location && <span data-testid="text-resume-location">{personalDetails.location}</span>}
            </div>
            
            {/* Professional Links */}
            {(personalDetails.linkedIn || personalDetails.github || personalDetails.portfolio) && (
              <div className="flex flex-wrap justify-center items-center gap-x-4 mt-2 text-xs text-primary">
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
              
              {experience.slice(0, 3).map((exp) => (
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
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary border-b border-primary pb-1 mb-3 uppercase tracking-wide">
                Education
              </h2>
              
              {education.slice(0, 2).map((edu) => (
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
          ) : (
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
          {skills.length > 0 ? (
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
          ) : (
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
                 Projects
              </h2>
              
              {projects.slice(0, 2).map((project) => (
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
                      <p className="text-gray-700">
                        {cert.issuer} - {formatDate(cert.dateIssued)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ====== Resume content ends ====== */}
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

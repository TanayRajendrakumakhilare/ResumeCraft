import { 
  type PersonalDetails, 
  type ExperienceItem, 
  type EducationItem, 
  type SkillItem, 
  type ProjectItem, 
  type LanguageItem, 
  type CertificateItem 
} from "@shared/schema";

interface ResumeData {
  personalDetails: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
}

// Using jsPDF for client-side PDF generation
declare global {
  interface Window {
    jsPDF: any;
  }
}

const loadJsPDF = async () => {
  if (typeof window.jsPDF === 'undefined') {
    // Dynamically import jsPDF
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        resolve(window.jsPDF);
      };
    });
  }
  return window.jsPDF;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const addText = (doc: any, text: string, x: number, y: number, options: any = {}) => {
  const { fontSize = 10, fontStyle = 'normal', maxWidth = 180, align = 'left' } = options;
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', fontStyle);
  
  if (maxWidth && text.length * (fontSize * 0.6) > maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      doc.text(line, x, y + (index * (fontSize * 0.4)), { align });
    });
    return lines.length * (fontSize * 0.4);
  } else {
    doc.text(text, x, y, { align });
    return fontSize * 0.4;
  }
};

const addSection = (doc: any, title: string, x: number, y: number) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), x, y);
  
  // Add underline
  doc.setDrawColor(37, 99, 235); // Primary blue color
  doc.line(x, y + 2, x + 180, y + 2);
  
  return y + 15;
};

export async function generatePDF(resumeData: ResumeData): Promise<void> {
  try {
    await loadJsPDF();
    const { jsPDF } = window;
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 20;
    const margin = 15;
    const pageHeight = 297;
    const pageWidth = 210;
    
    const { personalDetails, experience, education, skills, projects, languages, certificates } = resumeData;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Header Section
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const fullName = `${personalDetails.firstName || ''} ${personalDetails.lastName || ''}`.trim() || 'Your Name';
    doc.text(fullName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Contact Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [
      personalDetails.email,
      personalDetails.phone,
      personalDetails.location
    ].filter(Boolean).join(' • ');
    
    if (contactInfo) {
      doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Professional Links
    const links = [
      personalDetails.linkedIn && 'LinkedIn',
      personalDetails.github && 'GitHub', 
      personalDetails.portfolio && 'Portfolio'
    ].filter(Boolean).join(' • ');
    
    if (links) {
      doc.setTextColor(37, 99, 235);
      doc.text(links, pageWidth / 2, yPosition, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    }

    // Professional Summary
    if (personalDetails.summary) {
      checkNewPage(30);
      yPosition = addSection(doc, 'Professional Summary', margin, yPosition);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(personalDetails.summary, pageWidth - (margin * 2));
      summaryLines.forEach((line: string, index: number) => {
        doc.text(line, margin, yPosition + (index * 5));
      });
      yPosition += summaryLines.length * 5 + 10;
    }

    // Professional Experience
    if (experience.length > 0) {
      checkNewPage(40);
      yPosition = addSection(doc, 'Professional Experience', margin, yPosition);

      experience.forEach((exp, index) => {
        checkNewPage(25);
        
        // Job title and date
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.jobTitle || 'Job Title', margin, yPosition);
        
        const dateRange = `${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}`;
        doc.text(dateRange, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;

        // Company and location
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(exp.company || 'Company Name', margin, yPosition);
        doc.setTextColor(0, 0, 0);
        
        if (exp.location) {
          doc.text(exp.location, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 6;

        // Description
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, pageWidth - (margin * 2));
          descLines.forEach((line: string, lineIndex: number) => {
            checkNewPage(5);
            doc.text(line, margin, yPosition + (lineIndex * 4));
          });
          yPosition += descLines.length * 4 + 8;
        }
      });
    }

    // Education
    if (education.length > 0) {
      checkNewPage(30);
      yPosition = addSection(doc, 'Education', margin, yPosition);

      education.forEach((edu) => {
        checkNewPage(20);
        
        // Degree and date
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.degree || 'Degree', margin, yPosition);
        
        const dateRange = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
        doc.text(dateRange, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;

        // Institution
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(edu.institution || 'Institution', margin, yPosition);
        doc.setTextColor(0, 0, 0);
        
        if (edu.location) {
          doc.text(edu.location, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 4;

        if (edu.gpa) {
          doc.text(`GPA: ${edu.gpa}`, margin, yPosition);
          yPosition += 4;
        }

        if (edu.description) {
          const descLines = doc.splitTextToSize(edu.description, pageWidth - (margin * 2));
          descLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin, yPosition + (lineIndex * 4));
          });
          yPosition += descLines.length * 4;
        }
        
        yPosition += 8;
      });
    }

    // Skills
    if (skills.length > 0) {
      checkNewPage(25);
      yPosition = addSection(doc, 'Technical Skills', margin, yPosition);

      // Group skills by category
      const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
      }, {} as Record<string, SkillItem[]>);

      Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
        checkNewPage(8);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${category}:`, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        const skillNames = categorySkills.map(skill => skill.name).join(', ');
        const skillLines = doc.splitTextToSize(skillNames, pageWidth - margin - 40);
        
        skillLines.forEach((line: string, index: number) => {
          doc.text(line, margin + 40, yPosition + (index * 4));
        });
        
        yPosition += Math.max(skillLines.length * 4, 6) + 2;
      });
    }

    // Projects
    if (projects.length > 0) {
      checkNewPage(30);
      yPosition = addSection(doc, 'Notable Projects', margin, yPosition);

      projects.slice(0, 4).forEach((project) => {
        checkNewPage(20);
        
        // Project name and date
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(project.name || 'Project Name', margin, yPosition);
        
        if (project.startDate || project.endDate) {
          const dateRange = `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`;
          doc.text(dateRange, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 6;

        // URL
        if (project.url) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(37, 99, 235);
          doc.text(project.url, margin, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 5;
        }

        // Description
        if (project.description) {
          doc.setFontSize(10);
          const descLines = doc.splitTextToSize(project.description, pageWidth - (margin * 2));
          descLines.forEach((line: string, lineIndex: number) => {
            checkNewPage(4);
            doc.text(line, margin, yPosition + (lineIndex * 4));
          });
          yPosition += descLines.length * 4 + 2;
        }

        // Technologies
        if (project.technologies.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Technologies:', margin, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(project.technologies.join(', '), margin + 30, yPosition);
          yPosition += 6;
        }
        
        yPosition += 4;
      });
    }

    // Languages and Certifications (side by side if space allows)
    const hasBoth = languages.length > 0 && certificates.length > 0;
    const columnWidth = hasBoth ? (pageWidth - margin * 3) / 2 : pageWidth - margin * 2;

    if (languages.length > 0) {
      checkNewPage(20);
      const langYStart = yPosition;
      yPosition = addSection(doc, 'Languages', margin, yPosition);

      languages.forEach((lang) => {
        checkNewPage(6);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${lang.name} - ${lang.proficiency}`, margin, yPosition);
        yPosition += 5;
      });
      
      if (hasBoth) {
        yPosition = langYStart;
      } else {
        yPosition += 5;
      }
    }

    if (certificates.length > 0) {
      const certXPosition = hasBoth ? pageWidth / 2 + margin / 2 : margin;
      const certYStart = yPosition;
      
      if (!hasBoth) {
        checkNewPage(20);
      }
      
      yPosition = addSection(doc, 'Certifications', certXPosition, yPosition);

      certificates.slice(0, 6).forEach((cert) => {
        checkNewPage(12);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(cert.name || 'Certificate', certXPosition, yPosition);
        yPosition += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.text(cert.issuer || 'Issuer', certXPosition, yPosition);
        yPosition += 4;
        
        doc.text(formatDate(cert.dateIssued), certXPosition, yPosition);
        yPosition += 8;
      });
    }

    // Save the PDF
    const fileName = `${fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

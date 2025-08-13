import jsPDF from "jspdf";
import {
  type PersonalDetails,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type ProjectItem,
  type LanguageItem,
  type CertificateItem,
} from "@shared/schema";

interface ResumeData {
  personalDetails: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  filename?: string;
}

/** ---------- Layout constants (fixed sizes) ---------- **/
const MARGIN = 15;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Typography (fixed)
const NAME_SIZE = 22;             // top name
const SECTION_TITLE_SIZE = 13;    // section headings
const SUBHEADING_SIZE = 11;       // subheadings (job title, degree, project name)
const BODY_SIZE = 10;             // normal paragraph/body text
const META_SIZE = 9;              // dates, URLs, small meta text

// Spacing (uniform)
const GAP_BEFORE_SECTION = 6;     // uniform vertical gap before ALL main section headers
const INTER_BLOCK_GAP = 2;        // small gap between entries/blocks

// Extra gaps around company & institution lines
const COMPANY_GAP_BEFORE = 3;     // mm
const COMPANY_GAP_AFTER  = 3;     // mm
const INSTITUTION_GAP_BEFORE = 3; // mm
const INSTITUTION_GAP_AFTER  = 3; // mm

// Skills-specific (inline label + skills)
const SKILLS_INLINE_GAP = 2;        // mm between "Category:" and first skill text
const NEW_CATEGORY_GAP_BEFORE = 4;  // mm vertical gap before a NEW category row
const CATEGORY_GAP_AFTER = 2.5;     // mm vertical gap after finishing a category row
const SKILLS_TAIL_PAD = 2;          // 🔧 extra pad after the whole skills section to match other sections' perceived gap

// Projects-specific
const PROJECT_AFTER_TITLE_GAP = 2;  // mm space after project name before URL/description

/** ---------- Helpers ---------- **/
function mmPerPoint() { return 25.4 / 72; }
function lineHeightMM(doc: jsPDF, fontSize: number) {
  return fontSize * doc.getLineHeightFactor() * mmPerPoint();
}
function needSpace(doc: jsPDF, y: number, required: number) {
  if (y + required > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}
function addTopSpacing(doc: jsPDF, y: number, gap: number) {
  return needSpace(doc, y, gap) + gap;
}
function sectionHeader(doc: jsPDF, title: string, y: number) {
  const lh = lineHeightMM(doc, SECTION_TITLE_SIZE);
  y = needSpace(doc, y, lh + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(SECTION_TITLE_SIZE);
  doc.text(title.toUpperCase(), MARGIN, y);
  doc.setDrawColor(37, 99, 235);
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  return y + lh + 2;
}
function writeParagraph(
  doc: jsPDF,
  text: string,
  y: number,
  opts?: { fontSize?: number; maxWidth?: number }
) {
  const fontSize = opts?.fontSize ?? BODY_SIZE;
  const maxWidth = opts?.maxWidth ?? CONTENT_W;
  const lh = lineHeightMM(doc, fontSize);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = needSpace(doc, y, lh);
    doc.text(String(line), MARGIN, y);
    y += lh;
  }
  return y;
}
function writeBullets(
  doc: jsPDF,
  bullets: string[],
  y: number,
  opts?: { fontSize?: number; indent?: number; bullet?: string }
) {
  const fontSize = opts?.fontSize ?? BODY_SIZE;
  const indent = opts?.indent ?? 4;
  const bullet = opts?.bullet ?? "•";
  const lh = lineHeightMM(doc, fontSize);
  const maxWidth = CONTENT_W - indent;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  for (const raw of bullets) {
    const wrapped = doc.splitTextToSize(raw, maxWidth);
    y = needSpace(doc, y, lh);
    doc.text(bullet, MARGIN, y);
    for (let i = 0; i < wrapped.length; i++) {
      if (i > 0) y = needSpace(doc, y, lh);
      doc.text(String(wrapped[i]), MARGIN + indent, y);
      y += lh;
    }
    y += 1.5;
  }
  return y;
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Normalize URL for clickable links
function normalizeUrl(u: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

/** Draw a clickable text link. Falls back to a rectangle link if textWithLink is missing. */
function drawLink(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  url: string,
  fontSize = META_SIZE
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const normalized =
    url.startsWith("mailto:") || url.startsWith("tel:")
      ? url
      : normalizeUrl(url);

  // blue text
  doc.setTextColor(37, 99, 235);

  const anyDoc = doc as any;
  if (typeof anyDoc.textWithLink === "function") {
    anyDoc.textWithLink(text, x, y, { url: normalized });
  } else {
    // fallback: draw text, then overlay link rectangle
    doc.text(text, x, y);
    const w = doc.getTextWidth(text);
    const h = lineHeightMM(doc, fontSize);
    doc.link(x, y - h + 1, w, h, { url: normalized });
  }

  // reset color
  doc.setTextColor(0, 0, 0);
}

/** Draw inline items centered with separators, adding links when url is provided. */
function drawInlineCentered(
  doc: jsPDF,
  items: Array<{ label: string; url?: string }>,
  y: number,
  fontSize = META_SIZE
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const sep = " • ";
  const widths = items.map((it, i) =>
    doc.getTextWidth(it.label) + (i < items.length - 1 ? doc.getTextWidth(sep) : 0)
  );
  const totalW = widths.reduce((a, b) => a + b, 0);
  let x = (PAGE_W - totalW) / 2;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.url) {
      drawLink(doc, it.label, x, y, it.url, fontSize);
    } else {
      doc.text(it.label, x, y);
    }
    x += doc.getTextWidth(it.label);
    if (i < items.length - 1) {
      doc.text(sep, x, y);
      x += doc.getTextWidth(sep);
    }
  }
}

/** ---------- Category normalization & grouping ---------- **/
function normalizeCategoryKey(raw: string | undefined | null): string {
  return (raw ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase(); // strict case-insensitive key
}
function hasUppercase(s: string) {
  return /[A-Z]/.test(s);
}
type CatBucket = { label: string; items: SkillItem[] };
function groupSkillsCaseInsensitive(skills: SkillItem[]): Array<CatBucket> {
  const map = new Map<string, CatBucket>(); // preserves insertion order
  for (const s of skills) {
    const original = (s.category ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
    const key = normalizeCategoryKey(original);
    const existing = map.get(key);

    if (existing) {
      existing.items.push(s);
      // Upgrade label if we see a nicer (mixed-case) version later
      if (!hasUppercase(existing.label) && hasUppercase(original)) {
        existing.label = original;
      }
    } else {
      map.set(key, { label: original || "Category", items: [s] });
    }
  }
  return Array.from(map.values());
}

/** ---------- Main ---------- **/
export async function generatePDF(resumeData: ResumeData): Promise<void> {
  const {
    personalDetails,
    experience,
    education,
    skills,
    projects,
    languages,
    certificates,
    filename,
  } = resumeData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MARGIN;

  // NAME
  {
    const lh = lineHeightMM(doc, NAME_SIZE);
    const fullName =
      `${personalDetails.firstName || ""} ${personalDetails.lastName || ""}`.trim() || "Your Name";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(NAME_SIZE);
    y = needSpace(doc, y, lh);
    doc.text(fullName, PAGE_W / 2, y, { align: "center" });
    y += lh * 0.6;

    // Contact (email/phone/location)
    const contacts: Array<{ label: string; url?: string }> = [];
    if (personalDetails.email) contacts.push({ label: personalDetails.email, url: `mailto:${personalDetails.email}` });
    if (personalDetails.phone) {
      const tel = `tel:${String(personalDetails.phone).replace(/\s+/g, "")}`;
      contacts.push({ label: personalDetails.phone, url: tel });
    }
    if (personalDetails.location) contacts.push({ label: personalDetails.location });

    if (contacts.length) {
      const clh = lineHeightMM(doc, META_SIZE);
      y = needSpace(doc, y, clh);
      drawInlineCentered(doc, contacts, y, META_SIZE);
      y += clh * 0.9;
    }

    // Links (clickable)
    const links: Array<{ label: string; url: string }> = [];
    if (personalDetails.linkedIn) links.push({ label: "LinkedIn", url: personalDetails.linkedIn });
    if (personalDetails.github) links.push({ label: "GitHub", url: personalDetails.github });
    if (personalDetails.portfolio) links.push({ label: "Portfolio", url: personalDetails.portfolio });

    if (links.length) {
      const llh = lineHeightMM(doc, META_SIZE);
      y = needSpace(doc, y, llh);
      drawInlineCentered(doc, links, y, META_SIZE);
      y += llh * 0.9;
    }

    // Photo (optional)
    if (personalDetails.photoUrl) {
      try {
        const dataUrl = await imageUrlToDataUrl(personalDetails.photoUrl);
        const size = 24;
        doc.addImage(dataUrl, "JPEG", PAGE_W - MARGIN - size, MARGIN, size, size);
        y = Math.max(y, MARGIN + size + 2);
      } catch { /* ignore */ }
    }
  }

  // SUMMARY (uniform pre-section gap)
  if (personalDetails.summary) {
    y = sectionHeader(doc, "Professional Summary", addTopSpacing(doc, y, GAP_BEFORE_SECTION));
    y = writeParagraph(doc, personalDetails.summary, y, { fontSize: BODY_SIZE });
    y += INTER_BLOCK_GAP;
  }

  // EXPERIENCE (uniform pre-section gap)
  if (experience.length > 0) {
    y = sectionHeader(doc, "Professional Experience", addTopSpacing(doc, y, GAP_BEFORE_SECTION));
    for (const exp of experience) {
      const titleLH = lineHeightMM(doc, SUBHEADING_SIZE);
      y = needSpace(doc, y, titleLH + 1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(SUBHEADING_SIZE);
      doc.text(exp.jobTitle || "Job Title", MARGIN, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(META_SIZE);
      const dates = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.text(dates, PAGE_W - MARGIN, y, { align: "right" });
      y += titleLH * 0.95;

      // Company + location — with extra space before/after
      const metaLH = lineHeightMM(doc, META_SIZE);

      // BEFORE
      y = addTopSpacing(doc, y, COMPANY_GAP_BEFORE);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(META_SIZE);
      doc.setTextColor(37, 99, 235);
      y = needSpace(doc, y, metaLH);
      doc.text(exp.company || "Company Name", MARGIN, y);
      doc.setTextColor(0, 0, 0);
      if (exp.location) {
        doc.text(exp.location, PAGE_W - MARGIN, y, { align: "right" });
      }
      y += metaLH * 0.9;

      // AFTER
      y = addTopSpacing(doc, y, COMPANY_GAP_AFTER);

      // Description bullets
      if (exp.description) {
        const bullets = exp.description.split("\n").map((s) => s.trim()).filter(Boolean);
        y = writeBullets(doc, bullets, y, { fontSize: BODY_SIZE, indent: 4, bullet: "•" });
      }
      y += INTER_BLOCK_GAP;
    }
  }

  // EDUCATION (uniform pre-section gap)
  if (education.length > 0) {
    y = sectionHeader(doc, "Education", addTopSpacing(doc, y, GAP_BEFORE_SECTION));
    for (const edu of education) {
      const degLH = lineHeightMM(doc, SUBHEADING_SIZE);
      y = needSpace(doc, y, degLH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(SUBHEADING_SIZE);
      doc.text(edu.degree || "Degree", MARGIN, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(META_SIZE);
      const dates = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
      doc.text(dates, PAGE_W - MARGIN, y, { align: "right" });
      y += degLH * 0.95;

      // Institution + location — with extra space before/after
      const instLH = lineHeightMM(doc, META_SIZE);

      // BEFORE
      y = addTopSpacing(doc, y, INSTITUTION_GAP_BEFORE);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(META_SIZE);
      doc.setTextColor(37, 99, 235);
      y = needSpace(doc, y, instLH);
      doc.text(edu.institution || "Institution", MARGIN, y);
      doc.setTextColor(0, 0, 0);
      if (edu.location) doc.text(edu.location, PAGE_W - MARGIN, y, { align: "right" });
      y += instLH * 0.9;

      // AFTER
      y = addTopSpacing(doc, y, INSTITUTION_GAP_AFTER);

      if (edu.gpa) {
        const gpaLH = lineHeightMM(doc, BODY_SIZE);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(BODY_SIZE);
        y = needSpace(doc, y, gpaLH);
        doc.text(`GPA: ${edu.gpa}`, MARGIN, y);
        y += gpaLH * 0.9;
      }

      if (edu.description) {
        y = writeParagraph(doc, edu.description, y, { fontSize: BODY_SIZE });
      }
      y += INTER_BLOCK_GAP;
    }
  }

  // TECHNICAL SKILLS (uniform pre-section gap) — case-insensitive grouping, inline after label
  if (skills.length > 0) {
    y = sectionHeader(doc, "Technical Skills", addTopSpacing(doc, y, GAP_BEFORE_SECTION));

    const buckets = groupSkillsCaseInsensitive(skills);

    let firstCategory = true;
    for (const bucket of buckets) {
      const displayCat = bucket.label || "Category";
      const lineLH = lineHeightMM(doc, BODY_SIZE);

      // Measure label width (bold), compute dynamic start X & wrap width
      const labelText = `${displayCat}:`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(BODY_SIZE);
      const labelW = doc.getTextWidth(labelText);
      const startX = MARGIN + labelW + SKILLS_INLINE_GAP;
      const wrapWidth = Math.max(10, PAGE_W - MARGIN - startX);

      // Build the skills list for this category
      const list = bucket.items.map((s) => s.name).join(", ");

      // Wrap skill text using NORMAL font
      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SIZE);
      const lines = doc.splitTextToSize(list, wrapWidth);

      // Gap before new category (skip before the very first)
      if (!firstCategory) {
        y = addTopSpacing(doc, y, NEW_CATEGORY_GAP_BEFORE);
      }

      // Pre-measure required height for this category row
      const blockH = Math.max(lineLH, lines.length * lineLH) + CATEGORY_GAP_AFTER;
      if (y + blockH > PAGE_H - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }

      // Draw the label and first line on the same baseline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(BODY_SIZE);
      y = needSpace(doc, y, lineLH);
      doc.text(labelText, MARGIN, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SIZE);
      if (lines.length > 0) {
        doc.text(String(lines[0]), startX, y); // first line after label
        // subsequent lines align to startX
        for (let i = 1; i < lines.length; i++) {
          y = needSpace(doc, y, lineLH);
          y += lineLH;
          doc.text(String(lines[i]), startX, y);
        }
      }

      // Gap after this category block
      y += CATEGORY_GAP_AFTER;

      firstCategory = false;
    }

    // 🔧 Normalize perceived spacing before the NEXT section (e.g., Projects)
    // This brings it in line with other sections that end with INTER_BLOCK_GAP.
    y = addTopSpacing(doc, y, SKILLS_TAIL_PAD);
  }

  // NOTABLE PROJECTS (uniform pre-section gap) — clickable URL + small gap after title
  if (projects.length > 0) {
    y = sectionHeader(doc, "Projects", addTopSpacing(doc, y, GAP_BEFORE_SECTION));
    for (const p of projects.slice(0, 4)) {
      const titleLH = lineHeightMM(doc, SUBHEADING_SIZE);

      // Title + dates
      y = needSpace(doc, y, titleLH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SUBHEADING_SIZE);
      doc.text(p.name || "Project Name", MARGIN, y);

      if (p.startDate || p.endDate) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(META_SIZE);
        const dates = `${formatDate(p.startDate)} - ${formatDate(p.endDate)}`;
        doc.text(dates, PAGE_W - MARGIN, y, { align: "right" });
      }

      // drop below the title baseline
      y += titleLH * 0.95;

      // small vertical gap between project name and context
      y = addTopSpacing(doc, y, PROJECT_AFTER_TITLE_GAP);

      // URL (clickable)
      if (p.url) {
        const ulh = lineHeightMM(doc, META_SIZE);
        y = needSpace(doc, y, ulh);
        drawLink(doc, p.url, MARGIN, y, p.url, META_SIZE);
        y += ulh * 0.9;
      }

      // Description
      if (p.description) {
        y = writeParagraph(doc, p.description, y, { fontSize: BODY_SIZE });
      }

      // Technologies
      if (p.technologies?.length) {
        const labLH = lineHeightMM(doc, BODY_SIZE);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(BODY_SIZE);
        y = needSpace(doc, y, labLH);
        doc.text("Technologies:", MARGIN, y);
        doc.setFont("helvetica", "normal");
        const tech = p.technologies.join(", ");
        const wrap = doc.splitTextToSize(tech, CONTENT_W - 30);
        for (const line of wrap) {
          const lh = lineHeightMM(doc, BODY_SIZE);
          y = needSpace(doc, y, lh);
          doc.text(String(line), MARGIN + 30, y);
          y += lh;
        }
      }

      y += INTER_BLOCK_GAP;
    }
  }

  // ADDITIONAL (uniform pre-section gap)
  if (languages.length > 0 || certificates.length > 0) {
    y = sectionHeader(doc, "Additional", addTopSpacing(doc, y, GAP_BEFORE_SECTION));

    if (languages.length > 0) {
      const subLH = lineHeightMM(doc, SUBHEADING_SIZE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SUBHEADING_SIZE);
      y = needSpace(doc, y, subLH);
      doc.text("Languages", MARGIN, y);
      y += subLH * 0.8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SIZE);
      const lh = lineHeightMM(doc, BODY_SIZE);
      for (const lang of languages) {
        y = needSpace(doc, y, lh);
        doc.text(`${lang.name} - ${lang.proficiency}`, MARGIN, y);
        y += lh;
      }
      y += INTER_BLOCK_GAP;
    }

    if (certificates.length > 0) {
      const subLH = lineHeightMM(doc, SUBHEADING_SIZE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SUBHEADING_SIZE);
      y = needSpace(doc, y, subLH);
      doc.text("Certifications", MARGIN, y);
      y += subLH * 0.8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SIZE);
      for (const cert of certificates.slice(0, 10)) {
        const nameLH = lineHeightMM(doc, BODY_SIZE);
        y = needSpace(doc, y, nameLH);
        doc.setFont("helvetica", "bold");
        doc.text(cert.name || "Certificate", MARGIN, y);
        y += nameLH * 0.8;

        doc.setFont("helvetica", "normal");
        const meta = [cert.issuer || "Issuer", formatDate(cert.dateIssued)]
          .filter(Boolean)
          .join(" • ");
        const metaLH = lineHeightMM(doc, BODY_SIZE);
        y = needSpace(doc, y, metaLH);
        doc.text(meta, MARGIN, y);
        y += metaLH;

        y += 1.2;
      }
    }
  }

  const fullName =
    `${personalDetails.firstName || ""} ${personalDetails.lastName || ""}`.trim() || "Your_Name";
  const fileName = filename || `${fullName.replace(/\s+/g, "_")}_Resume.pdf`;
  doc.save(fileName);
}

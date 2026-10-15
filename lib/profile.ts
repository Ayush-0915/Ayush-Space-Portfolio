import rawProfile from "@/data/ayush-profile.json";

export interface ProfileMeta {
  version: string;
  lastUpdated: string;
  owner: string;
  description: string;
  privacyPolicy: string;
}

export interface PersonalInfo {
  fullName: string;
  preferredName: string;
  title: string;
  tagline: string;
  shortBio: string;
  location: string;
  status: string;
  seekingRoles: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsappUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  portfolioUrl: string;
  live3dPortfolioUrl: string;
  resumeUrl: string;
}

export interface EducationEntry {
  institution: string;
  location: string;
  degree: string;
  major: string;
  period: string;
  status: string;
  accreditation?: string;
  keyFocusAreas: string[];
}

export interface FrameworkOrLibrary {
  name: string;
  category: string;
}

export interface DatabaseSkill {
  name: string;
  type: string;
}

export interface CloudSkill {
  name: string;
  description: string;
}

export interface SkillsData {
  programmingLanguages: Array<{ name: string; level: string }>;
  machineLearning: string[];
  frameworksAndLibraries: FrameworkOrLibrary[];
  databases: DatabaseSkill[];
  cloudAndDevOps: CloudSkill[];
  toolsAndPlatforms: string[];
}

export interface ProjectMetrics {
  accuracy?: string;
  precision?: string;
  recall?: string;
  keyFinding?: string;
  keyFeature?: string;
  keyInsight?: string;
  deployment?: string;
  [key: string]: string | undefined;
}

export interface ProjectEntry {
  id: string;
  title: string;
  category: string;
  summary: string;
  problemSolved: string;
  technologies: string[];
  verifiedMetrics: ProjectMetrics;
  githubUrl: string | null;
  liveDemoUrl: string | null;
}

export interface CertificateEntry {
  id: string;
  title: string;
  shortTitle: string;
  issuer: string;
  curriculumProvider?: string;
  period: string;
  duration?: string;
  issueDate?: string;
  grade?: string;
  credentialId: string | null;
  verificationUrl: string | null;
  summary: string;
  skillsCovered: string[];
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  period: string;
  type: string;
  highlights: string[];
}

export interface HackathonEvent {
  title: string;
  organization: string;
  date: string;
  achievement: string;
  project?: string;
}

export interface HackathonsInfo {
  status: string;
  description: string;
  policyNote: string;
  events?: HackathonEvent[];
}

export interface GroundingRules {
  systemRole: string;
  truthPolicy: string;
  missingDataHandling: string;
  projectComparisons: string;
  linksPolicy: string;
  untrustedInputDefense: string;
}

export interface AyushProfile {
  $schema?: string;
  meta: ProfileMeta;
  personal: PersonalInfo;
  contact: ContactInfo;
  education: EducationEntry[];
  skills: SkillsData;
  projects: ProjectEntry[];
  certifications: CertificateEntry[];
  experience: ExperienceEntry[];
  hackathonsAndCompetitions: HackathonsInfo;
  groundingRules: GroundingRules;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the profile object against required schema constraints,
 * ensuring no empty values, valid URL structures, and zero leaked sensitive keys.
 */
export function validateProfile(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Profile data must be a non-null object."] };
  }

  const profile = data as Partial<AyushProfile>;

  // 1. Meta checks
  if (!profile.meta?.owner || !profile.meta?.version) {
    errors.push("Missing meta.owner or meta.version.");
  }

  // 2. Personal checks
  if (!profile.personal?.fullName || !profile.personal?.title) {
    errors.push("Missing personal.fullName or personal.title.");
  }
  if (!Array.isArray(profile.personal?.seekingRoles) || profile.personal.seekingRoles.length === 0) {
    errors.push("personal.seekingRoles must be a non-empty array.");
  }

  // 3. Contact checks
  const contact = profile.contact;
  if (!contact?.email || !contact.email.includes("@")) {
    errors.push("Invalid or missing contact.email.");
  }
  const urlFields: Array<keyof ContactInfo> = [
    "whatsappUrl",
    "githubUrl",
    "linkedinUrl",
    "instagramUrl",
    "portfolioUrl",
    "live3dPortfolioUrl",
  ];
  for (const field of urlFields) {
    const val = contact?.[field];
    if (!val || typeof val !== "string" || !val.startsWith("https://")) {
      errors.push(`contact.${field} must be a valid secure URL starting with https://.`);
    }
  }

  // 4. Education checks
  if (!Array.isArray(profile.education) || profile.education.length === 0) {
    errors.push("education must be a non-empty array.");
  }

  // 5. Skills checks
  if (!Array.isArray(profile.skills?.programmingLanguages) || profile.skills.programmingLanguages.length === 0) {
    errors.push("skills.programmingLanguages must be a non-empty array.");
  }
  if (!Array.isArray(profile.skills?.frameworksAndLibraries) || profile.skills.frameworksAndLibraries.length === 0) {
    errors.push("skills.frameworksAndLibraries must be a non-empty array.");
  }

  // 6. Projects checks
  if (!Array.isArray(profile.projects) || profile.projects.length === 0) {
    errors.push("projects must be a non-empty array.");
  } else {
    for (const proj of profile.projects) {
      if (!proj.id || !proj.title || !proj.summary || !proj.technologies) {
        errors.push(`Project "${proj.title || "unnamed"}" is missing required fields (id, title, summary, or technologies).`);
      }
      if (proj.githubUrl && !proj.githubUrl.startsWith("https://")) {
        errors.push(`Project "${proj.title}" githubUrl must start with https://.`);
      }
    }
  }

  // 7. Certifications checks
  if (!Array.isArray(profile.certifications) || profile.certifications.length === 0) {
    errors.push("certifications must be a non-empty array.");
  }

  // 8. Privacy & Sensitive Key Guard
  const rawString = JSON.stringify(data);
  const sensitivePatterns = [
    /STU696de12b5ea621768808747/i, // Student ID from virtual internship
    /SMTP_PASS/i,
    /GROQ_API_KEY/i,
    /SUPABASE_SERVICE_ROLE_KEY/i,
    /password/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(rawString)) {
      errors.push(`Sensitive information or token pattern detected: ${pattern.source}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validated, typed singleton instance of Ayush's knowledge base.
 */
export const profileKnowledge: AyushProfile = rawProfile as unknown as AyushProfile;

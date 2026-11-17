export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  totalExperienceYears: number;
  skills: string[];
  resumeFileName: string | null;
  resumeUploadedAtUtc: string | null;
}

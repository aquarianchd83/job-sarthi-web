export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';
export const ALL_MODES: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

/** Work modes you accept in one place, e.g. Pune: Hybrid and Onsite. */
export interface LocationPref {
  place: string;
  modes: WorkMode[];
}

export interface Rule {
  roles: string[];
  minExperience: number;
  maxExperience: number;
  locationPrefs: LocationPref[];
  /** Work modes you accept everywhere that is not in locationPrefs. */
  otherModes: WorkMode[];
  minSalaryLpa: number | null;
  keywords: string[];
  blacklistedCompanies: string[];
  minSkillMatches: number;
  minFitScore: number;
  maxFitScore: number;
}

export interface ScoringSummary { total: number; shortlisted: number; rejected: number; }

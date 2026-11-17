export type WorkMode = 'Remote' | 'Onsite' | 'Hybrid';

export interface Rule {
  roles: string[];
  minExperience: number;
  maxExperience: number;
  locations: string[];
  workMode: WorkMode | null;
  minSalaryLpa: number | null;
  keywords: string[];
  blacklistedCompanies: string[];
}

export interface ScoringSummary { total: number; shortlisted: number; rejected: number; }

export interface MarketSkill {
  name: string;
  jobs: number;
  percent: number;
  have: boolean;
  /** Mentioned by almost every tech posting (HTML, CSS, Git...). */
  common: boolean;
}

export interface SkillGap {
  scope: 'field' | 'all';
  totalJobs: number;
  jobsAnalysed: number;
  skills: MarketSkill[];
  topN: number;
  topHave: number;
  toAdd: MarketSkill[];
  rarelyAsked: MarketSkill[];
  note: string | null;
}

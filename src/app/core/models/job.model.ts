export interface Job {
  id: number;
  sourceKey: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Onsite' | 'Hybrid';
  url: string;
  canAutoApply: boolean;
  fitScore: number;
  scoreNotes: string | null;
  fetchedAtUtc: string;
}

export interface ShortlistStats {
  total: number;
  shortlisted: number;
  rejected: number;
  topRejectReasons: { reason: string; count: number }[];
}

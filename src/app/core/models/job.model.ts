/** How a job is applied to. Jobs that no longer accept applications get no category and never appear here. */
export type ApplyCategory = 'Api' | 'Email' | 'Manual';

export interface CategoryCounts { api: number; email: number; manual: number; unclassified: number; closed: number; }

export interface ClassifyResponse {
  reclassified: number;
  pages: { checked: number; closed: number; upgraded: number; errors: number } | null;
  shortlist: CategoryCounts;
}

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
  applyCategory: ApplyCategory | null;
  /** greenhouse, lever, ashby or workable for API apply. */
  atsKey: string | null;
  /** Best link to apply on (may be an ATS link found in the description). */
  applyUrl: string | null;
  applyEmail: string | null;
  categoryReason: string | null;
}

export interface ShortlistStats {
  total: number;
  shortlisted: number;
  rejected: number;
  topRejectReasons: { reason: string; count: number }[];
}

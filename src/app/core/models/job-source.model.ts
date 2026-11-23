export type SourceCapability = 'FetchAndApply' | 'FetchOnly' | 'AlertsOnly';

export interface JobSource {
  key: string;
  displayName: string;
  capability: SourceCapability;
  enabled: boolean;
  lastRunUtc: string | null; // UTC ISO from API, display via istDate pipe
  lastJobCount: number;
  lastError: string | null;
  companySlugs: string[]; // greenhouse | lever | ashby only
}

/** A Greenhouse/Lever/Ashby company found in the apply link of a job from another source. */
export interface CompanySuggestion {
  id: number;
  sourceKey: 'greenhouse' | 'lever' | 'ashby';
  slug: string;
  seenCount: number;
  exampleTitle: string | null;
  exampleCompany: string | null;
  lastSeenUtc: string;
}

export interface SourceRunResult {
  key: string;
  fetched: number;
  added: number;
  error: string | null;
}

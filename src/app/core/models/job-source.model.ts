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

export interface SourceRunResult {
  key: string;
  fetched: number;
  added: number;
  error: string | null;
}

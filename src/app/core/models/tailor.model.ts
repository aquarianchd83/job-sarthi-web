export interface TailorResult {
  jobId: number;
  engine: 'rule' | 'gemini' | 'ollama';
  orderedSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  coverLetter: string;
  note: string | null;
  tailoredAtUtc: string;
}

export interface EngineStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  detail: string;
}

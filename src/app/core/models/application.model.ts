export type ApplicationStatus =
  | 'Shortlisted' | 'AwaitingApproval' | 'Tailoring' | 'Applying'
  | 'PausedNeedsInput' | 'Submitted' | 'Failed' | 'ManualApply' | 'Cancelled';

export interface ApplicationListItem {
  id: number;
  jobId: number;
  title: string;
  company: string;
  sourceKey: string;
  status: ApplicationStatus;
  updatedAtUtc: string;
  url: string;
}

export interface LogLine { atUtc: string; message: string; }
export interface PendingQuestion { id: number; kind: 'question' | 'captcha' | 'otp'; prompt: string; }

export interface ApplicationDetail extends ApplicationListItem {
  submittedAtUtc: string | null;
  coverLetter: string | null;
  hasScreenshot: boolean;
  log: LogLine[];
  pending: PendingQuestion[];
}

export interface SavedAnswer { id: number; question: string; answer: string; }

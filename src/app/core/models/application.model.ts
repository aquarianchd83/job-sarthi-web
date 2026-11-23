import { ApplyCategory } from './job.model';

export type ApplicationStatus =
  | 'Shortlisted' | 'AwaitingApproval' | 'Tailoring' | 'Applying'
  | 'PausedNeedsInput' | 'Submitted' | 'Failed' | 'ManualApply' | 'Cancelled' | 'DraftReady';

export interface ApplicationListItem {
  id: number;
  jobId: number;
  title: string;
  company: string;
  sourceKey: string;
  status: ApplicationStatus;
  updatedAtUtc: string;
  url: string;
  applyCategory: ApplyCategory | null;
}

export interface LogLine { atUtc: string; message: string; }
export interface PendingQuestion { id: number; kind: 'question' | 'captcha' | 'otp'; prompt: string; }

export interface ApplicationDetail extends ApplicationListItem {
  submittedAtUtc: string | null;
  coverLetter: string | null;
  hasScreenshot: boolean;
  log: LogLine[];
  pending: PendingQuestion[];
  applyUrl: string | null;
  applyEmail: string | null;
  /** Set for email apply. */
  emailSubject: string | null;
}

export interface SavedAnswer { id: number; question: string; answer: string; }

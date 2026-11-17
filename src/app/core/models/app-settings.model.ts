export interface AppSettings {
  dailyRunTimeIst: string; // 'HH:mm' wall-clock IST
  schedulerEnabled: boolean;
  dailyApplyLimit: number;
  gapBetweenAppliesSeconds: number;
  autoApplyMinScore: number;
  applyMode: 'Approval' | 'FullAuto';
  useGemini: boolean;
  useOllama: boolean;
  notifySummary: boolean;
  notifyAlerts: boolean;
}

export interface ChannelStatus { name: 'telegram' | 'email'; configured: boolean; detail: string; }
export interface ChannelResult { channel: string; ok: boolean; message: string; }
export interface TelegramChat { chatId: string; name: string; }

export interface DailyRun {
  id: number;
  trigger: 'schedule' | 'manual';
  startedAtUtc: string;
  finishedAtUtc: string | null;
  fetched: number;
  newJobs: number;
  shortlisted: number;
  queued: number;
  error: string | null;
  notes: string[];
}

export interface AppAlert {
  id: number;
  kind: 'source' | 'apply-failed' | 'run-failed' | 'run-missed';
  message: string;
  createdAtUtc: string;
}

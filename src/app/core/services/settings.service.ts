import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppAlert, AppSettings, DailyRun } from '../models/app-settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  get() { return this.http.get<AppSettings>(this.base + '/settings'); }
  save(s: AppSettings) { return this.http.put<void>(this.base + '/settings', s); }
  nextRun() { return this.http.get<{ nextRunUtc: string; enabled: boolean }>(this.base + '/settings/next-run'); }

  /** Starts the whole daily routine in the background. */
  runNow() { return this.http.post<{ running: boolean }>(this.base + '/runs/daily', {}); }
  runStatus() { return this.http.get<{ running: boolean }>(this.base + '/runs/status'); }
  history(take = 7) { return this.http.get<DailyRun[]>(`${this.base}/runs?take=${take}`); }

  alerts() { return this.http.get<AppAlert[]>(this.base + '/alerts'); }
  dismiss(id: number) { return this.http.post<void>(`${this.base}/alerts/${id}/ack`, {}); }
  dismissAll() { return this.http.post<void>(this.base + '/alerts/ack-all', {}); }
}

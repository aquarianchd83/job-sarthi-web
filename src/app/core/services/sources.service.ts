import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CompanySuggestion, JobSource, SourceRunResult } from '../models/job-source.model';

@Injectable({ providedIn: 'root' })
export class SourcesService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/sources';

  getAll() { return this.http.get<JobSource[]>(this.base); }
  setEnabled(key: string, enabled: boolean) { return this.http.put<void>(`${this.base}/${key}/enabled`, { enabled }); }
  addCompany(key: string, slug: string) { return this.http.post<void>(`${this.base}/${key}/companies`, { slug }); }
  removeCompany(key: string, slug: string) { return this.http.delete<void>(`${this.base}/${key}/companies/${encodeURIComponent(slug)}`); }
  suggestions() { return this.http.get<{ autoAdd: boolean; items: CompanySuggestion[] }>(`${this.base}/suggestions`); }
  scanSuggestions() { return this.http.post<{ jobsScanned: number; newSuggestions: number; autoAdded: number }>(`${this.base}/suggestions/scan`, {}); }
  acceptSuggestion(id: number) { return this.http.post<void>(`${this.base}/suggestions/${id}/accept`, {}); }
  acceptAllSuggestions() { return this.http.post<{ added: number }>(`${this.base}/suggestions/accept-all`, {}); }
  dismissSuggestion(id: number) { return this.http.post<void>(`${this.base}/suggestions/${id}/dismiss`, {}); }
  setAutoAdd(enabled: boolean) { return this.http.put<void>(`${this.base}/suggestions/auto-add`, { enabled }); }
  /** Fetch now. No key = every enabled source. */
  fetchNow(key?: string) {
    const q = key ? `?source=${encodeURIComponent(key)}` : '';
    return this.http.post<{ sources: SourceRunResult[]; scoring: { shortlisted: number; total: number } }>(
      environment.apiBaseUrl + '/runs/fetch' + q, {});
  }
}
